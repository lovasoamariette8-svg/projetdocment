from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Folder(models.Model):
    """Dossier pour organiser les documents d'un utilisateur."""

    name = models.CharField(max_length=255, verbose_name="Nom du dossier")
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='folders',
        verbose_name="Créé par",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    class Meta:
        ordering = ['name']
        unique_together = ['name', 'created_by']

    def __str__(self):
        return self.name

    @property
    def document_count(self):
        return self.documents.count()


class Document(models.Model):
    """Fichier importé par un utilisateur (TXT, DOCX, PDF)."""

    STATUS_CHOICES = [
        ('ready', 'Prêt'),
        ('pending', 'À extraire'),
    ]

    name = models.CharField(max_length=255, verbose_name="Nom du document")
    file = models.FileField(upload_to='documents/%Y/%m/', verbose_name="Fichier")
    file_extension = models.CharField(max_length=10, verbose_name="Extension")
    size_bytes = models.PositiveBigIntegerField(default=0, verbose_name="Taille (octets)")
    word_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de mots")
    content = models.TextField(blank=True, verbose_name="Texte extrait")
    text_extracted = models.BooleanField(default=False, verbose_name="Texte extrait ?")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Statut",
    )
    folder = models.ForeignKey(
        Folder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
        verbose_name="Dossier",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'importation")
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Importé par",
    )

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.name

    @property
    def size_display(self):
        """Taille formatée lisible (Ko, Mo...)."""
        units = ['octets', 'Ko', 'Mo', 'Go']
        if self.size_bytes == 0:
            return '0 octet'
        index = min(int(len(str(self.size_bytes)) / 3), len(units) - 1)
        value = self.size_bytes / (1024 ** index)
        return f"{value:.2f} {units[index]}"

    @property
    def uploaded_at_display(self):
        return self.uploaded_at.strftime('%d/%m/%Y')


class Analysis(models.Model):
    """Analyse de similarité portant sur au moins deux documents."""

    STATUS_CHOICES = [
        ('pending', 'En cours'),
        ('completed', 'Terminée'),
        ('failed', 'Échouée'),
    ]

    NORMALIZATION_CHOICES = [
        ('lowercase', 'Minuscules'),
        ('accents', 'Suppression des accents'),
        ('spaces', 'Normalisation des espaces'),
        ('full', 'Normalisation complète'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='analyses',
        verbose_name="Utilisateur",
    )
    documents = models.ManyToManyField(Document, related_name='analyses', verbose_name="Documents")
    ngram_size = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name="Taille du n-gramme",
    )
    normalization = models.CharField(
        max_length=20,
        choices=NORMALIZATION_CHOICES,
        default='lowercase',
        verbose_name="Normalisation",
    )
    alert_threshold = models.IntegerField(
        default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Seuil d'alerte (%)",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Statut",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Analyses"

    def __str__(self):
        return f"Analyse #{self.pk} ({self.created_at:%d/%m/%Y})"

    @property
    def reference(self):
        return f"AN-{self.pk:03d}"


class Comparison(models.Model):
    """Résultat de comparaison entre deux documents d'une même analyse."""

    STATUS_CHOICES = [
        ('conforme', 'Conforme'),
        ('revision', 'À réviser'),
        ('plagiat', 'Plagiat'),
    ]

    analysis = models.ForeignKey(
        Analysis,
        on_delete=models.CASCADE,
        related_name='comparisons',
        verbose_name="Analyse",
    )
    document1 = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='+',
        verbose_name="Document 1",
    )
    document2 = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='+',
        verbose_name="Document 2",
    )
    similarity = models.FloatField(default=0.0, verbose_name="Similarité (%)")
    common_ngrams = models.IntegerField(default=0, verbose_name="N-grammes communs")
    total_ngrams_doc1 = models.IntegerField(default=0, verbose_name="Total n-grammes doc 1")
    total_ngrams_doc2 = models.IntegerField(default=0, verbose_name="Total n-grammes doc 2")
    matches = models.IntegerField(default=0, verbose_name="Correspondances")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='conforme',
        verbose_name="Statut",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date")

    class Meta:
        ordering = ['-similarity']

    def __str__(self):
        return f"{self.document1.name} VS {self.document2.name} ({self.similarity:.0f}%)"


class MatchingPassage(models.Model):
    """Passage de texte commun détecté entre deux documents."""

    comparison = models.ForeignKey(
        Comparison,
        on_delete=models.CASCADE,
        related_name='passages',
        verbose_name="Comparaison",
    )
    order = models.PositiveIntegerField(default=1, verbose_name="Ordre")
    text1 = models.TextField(blank=True, verbose_name="Texte doc 1")
    text2 = models.TextField(blank=True, verbose_name="Texte doc 2")
    similarity = models.FloatField(default=0.0, verbose_name="Similarité du passage (%)")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Passage #{self.order} ({self.similarity:.0f}%)"


class AnalysisSettings(models.Model):
    """Paramètres de profil et d'analyse enregistrés par un utilisateur."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='settings',
        verbose_name="Utilisateur",
    )
    ngram_size = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name="Taille du n-gramme",
    )
    normalisation = models.BooleanField(default=True, verbose_name="Normalisation du texte")
    alert_threshold = models.IntegerField(
        default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Seuil d'alerte (%)",
    )

    def __str__(self):
        return f"Paramètres de {self.user.username}"


class PasswordResetToken(models.Model):
    """Code de récupération de mot de passe, envoyé par e-mail."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
        verbose_name="Utilisateur",
    )
    code_hash = models.CharField(max_length=128, verbose_name="Code (empreinte SHA-256)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    expires_at = models.DateTimeField(verbose_name="Expiration")
    used = models.BooleanField(default=False, verbose_name="Utilisé ?")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Code de récupération"
        verbose_name_plural = "Codes de récupération"

    def __str__(self):
        return f"Code {self.user.username} ({self.created_at:%d/%m/%Y %H:%M})"

    @property
    def is_valid(self):
        return not self.used and self.expires_at > timezone.now()

    def matches(self, code):
        import hashlib
        import hmac
        computed = hashlib.sha256(code.strip().upper().encode()).hexdigest()
        return hmac.compare_digest(computed, self.code_hash)


class PendingRegistration(models.Model):
    """Inscription en attente de vérification par code e-mail."""

    email = models.EmailField(verbose_name="E-mail")
    username = models.CharField(max_length=150, verbose_name="Nom d'utilisateur")
    password_hash = models.CharField(max_length=255, verbose_name="Mot de passe (empreinte)")
    code_hash = models.CharField(max_length=128, verbose_name="Code (empreinte SHA-256)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    expires_at = models.DateTimeField(verbose_name="Expiration")
    used = models.BooleanField(default=False, verbose_name="Utilisé ?")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Inscription en attente"
        verbose_name_plural = "Inscriptions en attente"

    def __str__(self):
        return f"Inscription {self.username} ({self.email})"

    @property
    def is_valid(self):
        return not self.used and self.expires_at > timezone.now()

    def matches(self, code):
        import hashlib
        import hmac
        computed = hashlib.sha256(code.strip().upper().encode()).hexdigest()
        return hmac.compare_digest(computed, self.code_hash)