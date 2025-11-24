from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import datetime, date

# ============================================================================
# MODELES DE BASE
# ============================================================================

class Societe(models.Model):
    """Représente une société/entreprise"""
    nom = models.CharField(max_length=255, unique=True)
    email = models.EmailField(null=True, blank=True)
    telephone = models.CharField(max_length=20, null=True, blank=True)
    adresse = models.TextField(null=True, blank=True)
    ville = models.CharField(max_length=100, null=True, blank=True)
    code_postal = models.CharField(max_length=10, null=True, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Sociétés"
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Service(models.Model):
    """Représente un service au sein d'une société"""
    nom = models.CharField(max_length=255)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='services')
    description = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('nom', 'societe')
        verbose_name_plural = "Services"
        ordering = ['nom']

    def __str__(self):
        return f"{self.nom} - {self.societe.nom}"


class Grade(models.Model):
    """Représente un grade/niveau hiérarchique"""
    intitule = models.CharField(max_length=255)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='grades')
    description = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('intitule', 'societe')
        verbose_name_plural = "Grades"
        ordering = ['intitule']

    def __str__(self):
        return self.intitule


class Departement(models.Model):
    """Représente un département"""
    numero = models.CharField(max_length=50)
    nom = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Départements"
        ordering = ['numero']

    def __str__(self):
        return f"{self.numero} - {self.nom}"


class TypeAcces(models.Model):
    """Représente un type d'accès (lecture, écriture, admin, etc.)"""
    nom = models.CharField(max_length=255)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='types_acces')
    description = models.TextField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('nom', 'societe')
        verbose_name_plural = "Types d'accès"
        ordering = ['nom']

    def __str__(self):
        return self.nom


class OutilTravail(models.Model):
    """Représente un outil/logiciel de travail"""
    nom = models.CharField(max_length=255, unique=True)
    categorie = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    url_acces = models.URLField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Outils de travail"
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Equipement(models.Model):
    """Représente un équipement (ordinateur, téléphone, etc.)"""
    nom = models.CharField(max_length=255)
    type_equipement = models.CharField(max_length=100)
    numero_serie = models.CharField(max_length=100, unique=True, null=True, blank=True)
    marque = models.CharField(max_length=100, null=True, blank=True)
    modele = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Équipements"
        ordering = ['nom']

    def __str__(self):
        return f"{self.nom} ({self.type_equipement})"


# ============================================================================
# MODELES POUR SALARIES
# ============================================================================

class Salarie(models.Model):
    """Représente un salarié"""
    STATUT_CHOICES = [
        ('CDI', 'CDI'),
        ('CDD', 'CDD'),
        ('STAGE', 'Stage'),
        ('ALTERNANCE', 'Alternance'),
        ('CONSULTANT', 'Consultant'),
    ]
    GENRE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
        ('AUTRE', 'Autre'),
    ]

    prenom = models.CharField(max_length=100)
    nom = models.CharField(max_length=100)
    email_professionnel = models.EmailField(unique=True)
    email_personnel = models.EmailField(null=True, blank=True)
    telephone_professionnel = models.CharField(max_length=20, null=True, blank=True)
    telephone_personnel = models.CharField(max_length=20, null=True, blank=True)
    numero_professionnel = models.CharField(max_length=50, unique=True, null=True, blank=True)
    date_embauche = models.DateField(null=True, blank=True)
    date_sortie = models.DateField(null=True, blank=True)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='salaries')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='CDI')
    genre = models.CharField(max_length=10, choices=GENRE_CHOICES, null=True, blank=True)
    adresse = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Salariés"
        ordering = ['prenom', 'nom']
        unique_together = ('email_professionnel',)

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class EquipementInstance(models.Model):
    """Représente une instance d'équipement assignée à un salarié"""
    ETAT_CHOICES = [
        ('NEUF', 'Neuf'),
        ('BON', 'Bon état'),
        ('USURE', 'Usure'),
        ('ENREPARATION', 'En réparation'),
        ('HORS_SERVICE', 'Hors service'),
    ]

    nom = models.CharField(max_length=255)
    equipement = models.ForeignKey(Equipement, on_delete=models.CASCADE)
    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='equipements')
    etat = models.CharField(max_length=50, choices=ETAT_CHOICES, default='BON')
    date_attribution = models.DateField(auto_now_add=True)
    date_fin = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Instances d'équipement"
        ordering = ['-date_attribution']

    def __str__(self):
        return f"{self.nom} - {self.salarié}"


# ============================================================================
# MODELES POUR HORAIRES ET CONGES
# ============================================================================

class CreneauTravail(models.Model):
    """Représente un créneau horaire de travail"""
    nom = models.CharField(max_length=255, unique=True)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    description = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Créneaux de travail"
        ordering = ['heure_debut']

    def __str__(self):
        return f"{self.nom} ({self.heure_debut}-{self.heure_fin})"


class HoraireSalarie(models.Model):
    """Représente l'horaire d'un salarié"""
    TYPE_CHOICES = [
        ('TEMPS_PLEIN', 'Temps plein'),
        ('TEMPS_PARTIEL', 'Temps partiel'),
        ('FLEXIBILITE', 'Flexibilité'),
    ]

    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='horaires')
    type_horaire = models.CharField(max_length=50, choices=TYPE_CHOICES, default='TEMPS_PLEIN')
    creneaux = models.ManyToManyField(CreneauTravail, blank=True)
    date_debut = models.DateField(auto_now_add=True)
    date_fin = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Horaires des salariés"
        ordering = ['-date_debut']

    def __str__(self):
        return f"{self.salarié} - {self.type_horaire}"


class DemandeConge(models.Model):
    """Représente une demande de congé"""
    STATUT_CHOICES = [
        ('PENDING', 'En attente'),
        ('APPROVED', 'Approuvé'),
        ('REJECTED', 'Rejeté'),
        ('CANCELLED', 'Annulé'),
    ]

    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='demandes_conge')
    date_debut = models.DateField()
    date_fin = models.DateField()
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='PENDING')
    motif = models.TextField(null=True, blank=True)
    date_demande = models.DateTimeField(auto_now_add=True)
    date_decision = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Demandes de congé"
        ordering = ['-date_demande']

    def __str__(self):
        return f"{self.salarié} - {self.date_debut} à {self.date_fin}"


class SoldeConge(models.Model):
    """Représente le solde de congés d'un salarié"""
    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='soldes_conge')
    annee = models.IntegerField()
    jours_acquis = models.FloatField(default=25)
    jours_utilises = models.FloatField(default=0)
    jours_restants = models.FloatField(default=25)
    date_maj = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('salarié', 'annee')
        verbose_name_plural = "Soldes de congé"
        ordering = ['-annee']

    def __str__(self):
        return f"{self.salarié} - {self.annee}"


# ============================================================================
# MODELES POUR ACCES ET OUTILS
# ============================================================================

class AccesSalarie(models.Model):
    """Représente un accès d'un salarié à un outil"""
    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='acces_outils')
    outil = models.ForeignKey(OutilTravail, on_delete=models.CASCADE)
    type_acces = models.ForeignKey(TypeAcces, on_delete=models.SET_NULL, null=True, blank=True)
    date_debut = models.DateTimeField(auto_now_add=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_fin = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('salarié', 'outil')
        verbose_name_plural = "Accès des salariés"
        ordering = ['-date_debut']

    def __str__(self):
        return f"{self.salarié} - {self.outil}"


class HistoriqueSalarie(models.Model):
    """Représente l'historique des modifications d'un salarié"""
    TYPE_CHOICES = [
        ('CREATION', 'Création'),
        ('MODIFICATION', 'Modification'),
        ('SUPPRESSION', 'Suppression'),
        ('CHANGEMENT_POSTE', 'Changement de poste'),
    ]

    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='historique')
    type_modification = models.CharField(max_length=50, choices=TYPE_CHOICES)
    description = models.TextField()
    date_modification = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Historique des salariés"
        ordering = ['-date_modification']

    def __str__(self):
        return f"{self.salarié} - {self.type_modification}"


class DocumentSalarie(models.Model):
    """Représente un document associé à un salarié"""
    TYPE_CHOICES = [
        ('CONTRAT', 'Contrat'),
        ('FICHE_POSTE', 'Fiche de poste'),
        ('ATTESTATION', 'Attestation'),
        ('AUTRE', 'Autre'),
    ]

    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='documents')
    type_document = models.CharField(max_length=50, choices=TYPE_CHOICES)
    nom = models.CharField(max_length=255)
    date_creation = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Documents des salariés"
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.salarié} - {self.type_document}"


# ============================================================================
# MODELES POUR FICHES DE POSTE
# ============================================================================

class FichePoste(models.Model):
    """Représente une fiche de poste"""
    titre = models.CharField(max_length=255)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    competences_requises = models.TextField(null=True, blank=True)
    responsabilites = models.TextField(null=True, blank=True)
    salaire_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salaire_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Fiches de poste"
        ordering = ['titre']

    def __str__(self):
        return self.titre


class OutilFichePoste(models.Model):
    """Représente les outils requis pour une fiche de poste"""
    fiche_poste = models.ForeignKey(FichePoste, on_delete=models.CASCADE, related_name='outils')
    outil_travail = models.ForeignKey(OutilTravail, on_delete=models.CASCADE)
    type_acces_requis = models.ForeignKey(TypeAcces, on_delete=models.SET_NULL, null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('fiche_poste', 'outil_travail')
        verbose_name_plural = "Outils des fiches de poste"
        ordering = ['fiche_poste']

    def __str__(self):
        return f"{self.fiche_poste} - {self.outil_travail}"


# ============================================================================
# MODELES POUR APPLICATIONS ET TRAVAUX EXCEPTIONNELS
# ============================================================================

class TypeApplicationAcces(models.Model):
    """Représente un type d'application"""
    nom = models.CharField(max_length=255, unique=True)
    categorie = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Types d'application d'accès"
        ordering = ['nom']

    def __str__(self):
        return self.nom


class AccesApplication(models.Model):
    """Représente l'accès d'un salarié à une application"""
    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='acces_applications')
    application = models.ForeignKey(TypeApplicationAcces, on_delete=models.CASCADE)
    date_debut = models.DateField(auto_now_add=True)
    date_fin = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('salarié', 'application')
        verbose_name_plural = "Accès aux applications"
        ordering = ['-date_debut']

    def __str__(self):
        return f"{self.salarié} - {self.application}"


class TravauxExceptionnels(models.Model):
    """Représente un travail exceptionnel (WE, nuit, jours fériés)"""
    STATUT_CHOICES = [
        ('PENDING', 'En attente'),
        ('APPROVED', 'Approuvé'),
        ('REJECTED', 'Rejeté'),
        ('COMPENSATED', 'Compensé'),
    ]

    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='travaux_exceptionnels')
    date_travail = models.DateField()
    heures = models.FloatField()
    type_travail = models.CharField(max_length=50)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='PENDING')
    notes = models.TextField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Travaux exceptionnels"
        ordering = ['-date_travail']

    def __str__(self):
        return f"{self.salarié} - {self.date_travail}"


class FicheParametresUser(models.Model):
    """Représente les paramètres utilisateur d'un salarié"""
    salarié = models.OneToOneField(Salarie, on_delete=models.CASCADE, related_name='parametres')
    theme_couleur = models.CharField(max_length=50, default='light')
    langue = models.CharField(max_length=10, default='fr')
    notifications_activees = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Fiches de paramètres utilisateur"

    def __str__(self):
        return f"Paramètres de {self.salarié}"


class AmeliorationProposee(models.Model):
    """Représente une amélioration proposée"""
    STATUT_CHOICES = [
        ('PROPOSEE', 'Proposée'),
        ('EVALUEE', 'Évaluée'),
        ('APPROUVEE', 'Approuvée'),
        ('REJETEE', 'Rejetée'),
        ('IMPLEMENTEE', 'Implémentée'),
    ]

    titre = models.CharField(max_length=255)
    fiche_poste = models.ForeignKey(FichePoste, on_delete=models.SET_NULL, null=True, blank=True, related_name='ameliorations')
    salarié = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='ameliorations_proposees')
    description = models.TextField()
    priorite = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(5)])
    statut_projet = models.CharField(max_length=50, choices=STATUT_CHOICES, default='PROPOSEE')
    date_proposition = models.DateTimeField(auto_now_add=True)
    date_implementation = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Améliorations proposées"
        ordering = ['-priorite', '-date_proposition']

    def __str__(self):
        return f"{self.titre} - {self.salarié}"
