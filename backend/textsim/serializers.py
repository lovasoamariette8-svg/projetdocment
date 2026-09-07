from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Analysis, AnalysisSettings, Comparison, Document, MatchingPassage


# =======================================================================
# Authentification
# =======================================================================

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Identifiants incorrects.')
        attrs['user'] = user
        return attrs


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Ce nom d\'utilisateur est déjà pris.')
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Cet e-mail est déjà utilisé.')
        return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# =======================================================================
# Documents
# =======================================================================

class DocumentSerializer(serializers.ModelSerializer):
    size = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    words = serializers.IntegerField(source='word_count', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'name', 'file_name', 'size', 'size_bytes',
            'words', 'date', 'type', 'text_extracted', 'status', 'uploaded_at',
        ]

    def get_size(self, obj):
        return obj.size_display

    def get_date(self, obj):
        return obj.uploaded_at_display

    def get_file_name(self, obj):
        import os
        return os.path.basename(obj.file.name)

    def get_type(self, obj):
        return obj.file_extension.upper()


class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'name', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def validate_file(self, value):
        import os
        from django.conf import settings

        ext = os.path.splitext(value.name)[1].lower().lstrip('.')
        from .services import ALLOWED_EXTENSIONS

        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f'Le fichier doit être au format TXT, DOCX ou PDF ({ext} refusé).'
            )
        if value.size == 0:
            raise serializers.ValidationError('Le fichier est vide.')
        if value.size > settings.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                'Le fichier dépasse la taille maximale de 10 Mo.'
            )
        return value


# =======================================================================
# Analyses
# =======================================================================

class MatchingPassageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchingPassage
        fields = ['id', 'order', 'text1', 'text2', 'similarity']


class ComparisonSerializer(serializers.ModelSerializer):
    document1 = serializers.SerializerMethodField()
    document2 = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    analysis_id = serializers.SerializerMethodField()
    ngram_size = serializers.SerializerMethodField()
    normalization = serializers.SerializerMethodField()
    threshold = serializers.SerializerMethodField()
    method = serializers.SerializerMethodField()
    passages = MatchingPassageSerializer(many=True, read_only=True)

    class Meta:
        model = Comparison
        fields = [
            'id', 'analysis_id', 'document1', 'document2', 'similarity',
            'common_ngrams', 'total_ngrams_doc1', 'total_ngrams_doc2',
            'matches', 'status', 'date', 'ngram_size', 'normalization',
            'threshold', 'method', 'passages',
        ]

    def get_document1(self, obj):
        return obj.document1.name

    def get_document2(self, obj):
        return obj.document2.name

    def get_date(self, obj):
        return obj.created_at.strftime('%d/%m/%Y')

    def get_analysis_id(self, obj):
        return obj.analysis.reference

    def get_ngram_size(self, obj):
        return obj.analysis.ngram_size

    def get_normalization(self, obj):
        return obj.analysis.get_normalization_display()

    def get_threshold(self, obj):
        return obj.analysis.alert_threshold

    def get_method(self, obj):
        return 'N-gram'


class AnalysisSerializer(serializers.ModelSerializer):
    reference = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    comparisons = ComparisonSerializer(many=True, read_only=True)

    class Meta:
        model = Analysis
        fields = [
            'id', 'reference', 'date', 'ngram_size', 'normalization',
            'alert_threshold', 'status', 'status_display', 'documents',
            'comparisons',
        ]

    def get_reference(self, obj):
        return obj.reference

    def get_date(self, obj):
        return obj.created_at.strftime('%d/%m/%Y')

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_documents(self, obj):
        return [doc.name for doc in obj.documents.all()]


class StartAnalysisSerializer(serializers.Serializer):
    documentIds = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)
    ngramSize = serializers.IntegerField(min_value=1, max_value=10, default=3)
    normalization = serializers.ChoiceField(
        choices=Analysis.NORMALIZATION_CHOICES, default='lowercase'
    )
    alertThreshold = serializers.IntegerField(min_value=0, max_value=100, default=70)


# =======================================================================
# Paramètres
# =======================================================================

class AnalysisSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisSettings
        fields = ['ngram_size', 'normalisation', 'alert_threshold']