import os
from datetime import timedelta

from django.db import transaction
from django.db.models import Count, Q
from django.http import FileResponse, HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Analysis, AnalysisSettings, Comparison, Document, MatchingPassage
from .serializers import (
    AnalysisSerializer,
    AnalysisSettingsSerializer,
    ComparisonSerializer,
    DocumentSerializer,
    DocumentUploadSerializer,
    LoginSerializer,
    StartAnalysisSerializer,
    UserSerializer,
)
from .services import analyze_pair, count_words, get_status, normalize_text, read_file_text


# =======================================================================
# Authentification
# =======================================================================

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        from django.contrib.auth import login
        login(request, user)
        AnalysisSettings.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Connexion réussie.',
        })


class LogoutView(APIView):
    def post(self, request):
        from django.contrib.auth import logout
        logout(request)
        return Response({'message': 'Déconnexion réussie.'})


class MeView(APIView):
    def get(self, request):
        settings, _ = AnalysisSettings.objects.get_or_create(user=request.user)
        return Response({
            'user': UserSerializer(request.user).data,
            'settings': AnalysisSettingsSerializer(settings).data,
        })


# =======================================================================
# Documents
# =======================================================================

class DocumentListCreateView(APIView):
    def get(self, request):
        documents = Document.objects.filter(uploaded_by=request.user)
        return Response(DocumentSerializer(documents, many=True).data)

    def post(self, request):
        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = request.data.get('name') or serializer.validated_data['file'].name
        ext = os.path.splitext(name)[1].lower().lstrip('.')
        duplicate = Document.objects.filter(
            uploaded_by=request.user, name__iexact=name
        ).exists()
        if duplicate:
            return Response(
                {'detail': f'Le document "{name}" existe déjà.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        document = serializer.save(name=name, uploaded_by=request.user)

        try:
            content = read_file_text(
                document.file.open('rb'), ext
            )
        except Exception as exc:
            document.delete()
            return Response(
                {'detail': f'Impossible de lire le fichier "{name}". {exc}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        document.content = content or ''
        document.file_extension = ext
        document.size_bytes = document.file.size
        document.word_count = count_words(content)
        document.text_extracted = bool(content.strip()) if content else False
        document.status = 'ready' if document.text_extracted else 'pending'
        document.save()

        return Response(
            DocumentSerializer(document).data,
            status=status.HTTP_201_CREATED,
        )


class DocumentDetailView(APIView):
    def _get_document(self, request, pk):
        return Document.objects.filter(pk=pk, uploaded_by=request.user).first()

    def get(self, request, pk):
        document = self._get_document(request, pk)
        if not document:
            return Response({'detail': 'Document introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        data = DocumentSerializer(document).data

        action = request.query_params.get('action')
        if action == 'download':
            response = FileResponse(
                document.file.open('rb'),
                as_attachment=True,
                filename=document.name,
            )
            response['Content-Disposition'] = f'attachment; filename="{document.name}"'
            return response

        if action == 'preview':
            return Response({
                'id': document.id,
                'name': document.name,
                'type': document.file_extension.upper(),
                'content': document.content,
                'text_extracted': document.text_extracted,
            })

        data['content'] = document.content
        return Response(data)

    def delete(self, request, pk):
        document = self._get_document(request, pk)
        if not document:
            return Response({'detail': 'Document introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        document.file.delete(save=False)
        document.delete()
        return Response({'message': 'Document supprimé.'})


# =======================================================================
# Analyses
# =======================================================================

class AnalysisCreateView(APIView):
    @transaction.atomic
    def post(self, request):
        serializer = StartAnalysisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ids = serializer.validated_data['documentIds']
        ngram_size = serializer.validated_data['ngramSize']
        normalization = serializer.validated_data['normalization']
        alert_threshold = serializer.validated_data['alertThreshold']

        if len(ids) != len(set(ids)):
            return Response(
                {'detail': 'Un document est sélectionné en double.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_ids = set(
            Document.objects.filter(id__in=ids, uploaded_by=request.user)
            .values_list('id', flat=True)
        )
        if set(ids) != valid_ids:
            return Response(
                {'detail': 'Un ou plusieurs documents sont introuvables.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        documents = list(Document.objects.filter(id__in=ids, uploaded_by=request.user))
        if len(documents) < 2:
            return Response(
                {'detail': 'Veuillez sélectionner au moins deux documents pour lancer une analyse.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        analysis = Analysis.objects.create(
            user=request.user,
            ngram_size=ngram_size,
            normalization=normalization,
            alert_threshold=alert_threshold,
            status='completed',
        )
        analysis.documents.set(documents)

        comparison_count = 0
        for i in range(len(documents)):
            for j in range(i + 1, len(documents)):
                doc1, doc2 = documents[i], documents[j]
                text1 = normalize_text(doc1.content)
                text2 = normalize_text(doc2.content)

                if not text1.strip() or not text2.strip():
                    continue

                result = analyze_pair(text1, text2, ngram_size)
                comparison = Comparison.objects.create(
                    analysis=analysis,
                    document1=doc1,
                    document2=doc2,
                    similarity=result['similarity'],
                    common_ngrams=result['common_ngrams'],
                    total_ngrams_doc1=result['total_ngrams_doc1'],
                    total_ngrams_doc2=result['total_ngrams_doc2'],
                    matches=len(result['passages']),
                    status=get_status(result['similarity'], alert_threshold),
                )

                for order, passage in enumerate(result['passages'], start=1):
                    MatchingPassage.objects.create(
                        comparison=comparison,
                        order=order,
                        text1=passage['text1'],
                        text2=passage['text2'],
                        similarity=passage['similarity'],
                    )
                comparison_count += 1

        if comparison_count == 0:
            analysis.status = 'failed'
            analysis.save()

        return Response(
            AnalysisSerializer(analysis).data,
            status=status.HTTP_201_CREATED,
        )


class AnalysisListView(APIView):
    def get(self, request):
        analyses = Analysis.objects.filter(user=request.user).prefetch_related('comparisons')
        return Response(AnalysisSerializer(analyses, many=True).data)


class AnalysisDetailView(APIView):
    def get(self, request, pk):
        analysis = Analysis.objects.filter(pk=pk, user=request.user).first()
        if not analysis:
            return Response({'detail': 'Analyse introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AnalysisSerializer(analysis).data)


# =======================================================================
# Dashboard
# =======================================================================

class DashboardView(APIView):
    def get(self, request):
        user = request.user
        documents = Document.objects.filter(uploaded_by=user)
        comparisons = Comparison.objects.filter(analysis__user=user)

        total = documents.count()
        analysed = Document.objects.filter(
            uploaded_by=user, analyses__status='completed'
        ).distinct().count()
        pending = total - analysed
        plagiarism_alerts = comparisons.filter(status='plagiat').count()

        recent = DocumentSerializer(documents[:5], many=True).data
        series = self._monthly_series(user)

        return Response({
            'total_documents': total,
            'analysed': max(analysed, 0),
            'pending': max(pending, 0),
            'plagiarism_alerts': plagiarism_alerts,
            'recent_documents': recent,
            'monthly_series': series,
        })

    def _monthly_series(self, user):
        now = timezone.now()
        series = []

        for month_offset in range(5, -1, -1):
            month_start = (now - timedelta(days=30 * month_offset)).replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )
            month_end = (
                (month_start + timedelta(days=32)).replace(day=1)
                if month_offset > 0 else now
            )
            comparisons = Comparison.objects.filter(
                analysis__user=user, created_at__gte=month_start, created_at__lt=month_end
            )
            series.append({
                'month': month_start.strftime('%b'),
                'month_fr': month_start.strftime('%B'),
                'conforme': comparisons.filter(status='conforme').count(),
                'revision': comparisons.filter(status='revision').count(),
                'plagiat': comparisons.filter(status='plagiat').count(),
            })

        return series


# =======================================================================
# Paramètres
# =======================================================================

class SettingsView(APIView):
    def get(self, request):
        settings, _ = AnalysisSettings.objects.get_or_create(user=request.user)
        return Response(AnalysisSettingsSerializer(settings).data)

    def put(self, request):
        settings, _ = AnalysisSettings.objects.get_or_create(user=request.user)
        serializer = AnalysisSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        data = serializer.validated_data
        user = request.user
        user.first_name = request.data.get('nom', user.first_name)
        user.last_name = request.data.get('prenom', user.last_name)
        user.email = request.data.get('email', user.email)
        user.save()

        return Response({
            'settings': serializer.data,
            'user': UserSerializer(user).data,
        })