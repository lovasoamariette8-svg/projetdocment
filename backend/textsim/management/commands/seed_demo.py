"""Commande de démonstration : utilisateur + documents + analyse d'exemple.

Usage : python manage.py seed_demo
"""

from datetime import timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from textsim.models import Analysis, AnalysisSettings, Comparison, Document, MatchingPassage
from textsim.services import analyze_pair, count_words, get_status, normalize_text


SAMPLE_TEXTS = [
    (
        "rapport_stage.txt",
        (
            "L'analyse des données permet d'identifier les principales tendances du document. "
            "Cette méthode permet de comparer efficacement les contenus textuels. "
            "Les résultats obtenus sont ensuite présentés sous forme de statistiques. "
            "Le système permet d'automatiser le traitement et l'analyse des documents. "
            "La comparaison des documents permet de mesurer leur niveau de similarité. "
            "Les données sont ensuite analysées afin de produire un résultat. "
            "Cette étude porte sur l'utilisation d'algorithmes de détection de similarité textuelle. "
            "Nous avons évalué plusieurs approches, notamment les n-grammes de mots."
        ),
    ),
    (
        "memoire.txt",
        (
            "L'analyse des données permet d'identifier les tendances principales du rapport. "
            "Cette méthode permet une comparaison efficace des contenus textuels. "
            "Les résultats sont présentés ensuite sous forme de statistiques. "
            "Le système permet d'automatiser l'analyse et le traitement des documents. "
            "La comparaison permet de mesurer le niveau de similarité entre les documents. "
            "Les données sont analysées afin de produire les résultats. "
            "Nous étudions la détection de similarité entre documents académiques. "
            "Plusieurs techniques ont été comparées pour évaluer leur précision."
        ),
    ),
    (
        "note_de_synthese.txt",
        (
            "Le soleil se lève sur la vallée et les oiseaux chantent dans les arbres. "
            "La réunion de rentrée aura lieu lundi à neuf heures dans la salle principale. "
            "Le budget du projet a été approuvé par le comité de direction. "
            "Les employés seront informés des nouvelles procédures par courrier électronique. "
            "La cafétéria propose chaque jour un menu différent à prix réduit. "
            "Le parking de l'entreprise sera agrandi au cours du prochain trimestre. "
            "Les horaires d'ouverture sont affichés à l'entrée du bâtiment. "
            "Un nouveau logiciel de gestion sera déployé en fin d'année."
        ),
    ),
]


class Command(BaseCommand):
    help = "Crée un utilisateur démo, des documents d'exemple et une analyse."

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@entreprise.com',
                'first_name': 'Admin',
                'last_name': 'TextSim',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created:
            user.set_password('admin123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Utilisateur "admin" créé (mot de passe : admin123)'))
        else:
            self.stdout.write('Utilisateur "admin" déjà présent.')

        AnalysisSettings.objects.get_or_create(
            user=user,
            defaults={'ngram_size': 3, 'normalisation': True, 'alert_threshold': 70},
        )

        documents = []
        for name, content in SAMPLE_TEXTS:
            # Pas de vrai fichier stocké : on crée l'enregistrement avec le
            # texte directement injecté (démonstration hors chargement fichier).
            doc = Document.objects.filter(uploaded_by=user, name__iexact=name).first()
            if not doc:
                doc = Document(
                    name=name,
                    file_extension='txt',
                    size_bytes=len(content.encode('utf-8')),
                    word_count=count_words(content),
                    content=content,
                    text_extracted=True,
                    status='ready',
                    uploaded_by=user,
                )
                doc.save()
                documents.append(doc)
                self.stdout.write(f'Document créé : {name}')

        created_docs = Document.objects.filter(uploaded_by=user, content__gt='')
        documents = list(created_docs)

        if len(documents) >= 2:
            recent = Analysis.objects.filter(user=user).first()
            latest = created_docs.order_by('-uploaded_at').first()
            if latest:
                latest.uploaded_at = timezone.now() - timedelta(days=2)
                latest.save()

            if not Analysis.objects.filter(user=user).exists():
                analysis = Analysis.objects.create(
                    user=user,
                    ngram_size=3,
                    normalization='lowercase',
                    alert_threshold=70,
                    status='completed',
                )
                analysis.documents.set(documents)

                for i in range(len(documents)):
                    for j in range(i + 1, len(documents)):
                        doc1, doc2 = documents[i], documents[j]
                        result = analyze_pair(
                            normalize_text(doc1.content),
                            normalize_text(doc2.content),
                            3,
                        )
                        comparison = Comparison.objects.create(
                            analysis=analysis,
                            document1=doc1,
                            document2=doc2,
                            similarity=result['similarity'],
                            common_ngrams=result['common_ngrams'],
                            total_ngrams_doc1=result['total_ngrams_doc1'],
                            total_ngrams_doc2=result['total_ngrams_doc2'],
                            matches=len(result['passages']),
                            status=get_status(result['similarity'],
                                               analysis.alert_threshold),
                        )
                        for order, passage in enumerate(result['passages'], start=1):
                            MatchingPassage.objects.create(
                                comparison=comparison,
                                order=order,
                                text1=passage['text1'],
                                text2=passage['text2'],
                                similarity=passage['similarity'],
                            )
                self.stdout.write(self.style.SUCCESS('Analyse de démonstration créée.'))

        self.stdout.write(self.style.SUCCESS('Seed terminé.'))