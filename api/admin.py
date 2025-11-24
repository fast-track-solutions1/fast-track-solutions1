from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser
)

# ============================================================================
# SOCIETE & STRUCTURE
# ============================================================================

@admin.register(Societe)
class SocieteAdmin(admin.ModelAdmin):
    list_display = ('nom', 'email', 'ville', 'actif', 'date_creation')
    list_filter = ('actif', 'date_creation')
    search_fields = ('nom', 'email', 'ville')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'email', 'telephone', 'actif')
        }),
        ('Adresse', {
            'fields': ('adresse', 'ville', 'code_postal')
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'actif', 'date_creation')
    list_filter = ('societe', 'actif', 'date_creation')
    search_fields = ('nom', 'societe__nom')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Service', {
            'fields': ('nom', 'societe', 'description', 'actif')
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('intitule', 'societe', 'actif', 'date_creation')
    list_filter = ('societe', 'actif', 'date_creation')
    search_fields = ('intitule', 'societe__nom')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Grade', {
            'fields': ('intitule', 'societe', 'description', 'actif')
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('numero', 'nom', 'actif', 'date_creation')
    list_filter = ('actif', 'date_creation')
    search_fields = ('numero', 'nom')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Département', {
            'fields': ('numero', 'nom', 'description', 'actif')
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(TypeAcces)
class TypeAccesAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'date_creation')
    list_filter = ('societe', 'date_creation')
    search_fields = ('nom', 'societe__nom')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Type d\'accès', {
            'fields': ('nom', 'societe', 'description')
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# OUTILS & EQUIPEMENTS
# ============================================================================

@admin.register(OutilTravail)
class OutilTravailAdmin(admin.ModelAdmin):
    list_display = ('nom', 'categorie', 'url_acces', 'date_creation')
    list_filter = ('categorie', 'date_creation')
    search_fields = ('nom', 'categorie')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Outil de travail', {
            'fields': ('nom', 'categorie', 'description', 'url_acces')
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type_equipement', 'marque', 'modele', 'numero_serie')
    list_filter = ('type_equipement', 'marque', 'date_creation')
    search_fields = ('nom', 'numero_serie', 'marque', 'modele')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Équipement', {
            'fields': ('nom', 'type_equipement', 'marque', 'modele')
        }),
        ('Identification', {
            'fields': ('numero_serie',)
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(EquipementInstance)
class EquipementInstanceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'salarié', 'equipement', 'etat', 'date_attribution')
    list_filter = ('etat', 'equipement', 'date_attribution')
    search_fields = ('nom', 'salarié__prenom', 'salarié__nom')
    readonly_fields = ('date_attribution',)
    fieldsets = (
        ('Instance d\'équipement', {
            'fields': ('nom', 'equipement', 'salarié', 'etat')
        }),
        ('Dates', {
            'fields': ('date_attribution', 'date_fin')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )


# ============================================================================
# SALARIES
# ============================================================================

@admin.register(Salarie)
class SalarieAdmin(admin.ModelAdmin):
    list_display = ('prenom', 'nom', 'email_professionnel', 'societe', 'service', 'statut', 'actif')
    list_filter = ('societe', 'service', 'statut', 'actif', 'date_embauche')
    search_fields = ('prenom', 'nom', 'email_professionnel', 'numero_professionnel')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('prenom', 'nom', 'genre', 'adresse')
        }),
        ('Emails', {
            'fields': ('email_professionnel', 'email_personnel')
        }),
        ('Téléphones', {
            'fields': ('telephone_professionnel', 'telephone_personnel')
        }),
        ('Professionnel', {
            'fields': ('numero_professionnel', 'societe', 'service', 'grade', 'statut')
        }),
        ('Dates', {
            'fields': ('date_embauche', 'date_sortie')
        }),
        ('Statut', {
            'fields': ('actif',)
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(HistoriqueSalarie)
class HistoriqueSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarié', 'type_modification', 'utilisateur', 'date_modification')
    list_filter = ('type_modification', 'date_modification')
    search_fields = ('salarié__prenom', 'salarié__nom', 'description')
    readonly_fields = ('date_modification', 'salarié', 'type_modification', 'description', 'utilisateur')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(DocumentSalarie)
class DocumentSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarié', 'type_document', 'nom', 'date_creation')
    list_filter = ('type_document', 'date_creation')
    search_fields = ('salarié__prenom', 'salarié__nom', 'nom')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Document', {
            'fields': ('salarié', 'type_document', 'nom')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# HORAIRES & CONGES
# ============================================================================

@admin.register(CreneauTravail)
class CreneauTravailAdmin(admin.ModelAdmin):
    list_display = ('nom', 'heure_debut', 'heure_fin')
    search_fields = ('nom',)
    fieldsets = (
        ('Créneau', {
            'fields': ('nom', 'heure_debut', 'heure_fin', 'description')
        }),
    )


@admin.register(HoraireSalarie)
class HoraireSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarié', 'type_horaire', 'date_debut', 'date_fin')
    list_filter = ('type_horaire', 'date_debut')
    search_fields = ('salarié__prenom', 'salarié__nom')
    readonly_fields = ('date_debut',)
    fieldsets = (
        ('Horaire', {
            'fields': ('salarié', 'type_horaire')
        }),
        ('Créneaux', {
            'fields': ('creneaux',)
        }),
        ('Dates', {
            'fields': ('date_debut', 'date_fin')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )


@admin.register(DemandeConge)
class DemandeCongeAdmin(admin.ModelAdmin):
    list_display = ('salarié', 'date_debut', 'date_fin', 'statut', 'date_demande')
    list_filter = ('statut', 'date_demande', 'date_debut')
    search_fields = ('salarié__prenom', 'salarié__nom')
    readonly_fields = ('date_demande',)
    fieldsets = (
        ('Demande', {
            'fields': ('salarié', 'date_debut', 'date_fin', 'statut')
        }),
        ('Détails', {
            'fields': ('motif',)
        }),
        ('Dates', {
            'fields': ('date_demande', 'date_decision')
        }),
    )


@admin.register(SoldeConge)
class SoldeCongeAdmin(admin.ModelAdmin):
    list_display = ('salarié', 'annee', 'jours_acquis', 'jours_utilises', 'jours_restants')
    list_filter = ('annee', 'date_maj')
    search_fields = ('salarié__prenom', 'salarié__nom')
    readonly_fields = ('date_maj',)
    fieldsets = (
        ('Solde', {
            'fields': ('salarié', 'annee')
        }),
        ('Détails', {
            'fields': ('jours_acquis', 'jours_utilises', 'jours_restants')
        }),
        ('Audit', {
            'fields': ('date_maj',),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# ACCES & AUTORISATIONS
# ============================================================================

@admin.register(AccesSalarie)
class AccesSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarié', 'outil', 'type_acces', 'date_debut', 'date_fin')
    list_filter = ('outil', 'type_acces', 'date_debut')
    search_fields = ('salarié__prenom', 'salarié__nom', 'outil__nom')
    readonly_fields = ('date_debut', 'date_creation')
    fieldsets = (
        ('Accès', {
            'fields': ('salarié', 'outil', 'type_acces')
        }),
        ('Dates', {
            'fields': ('date_debut', 'date_fin')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(TypeApplicationAcces)
class TypeApplicationAccesAdmin(admin.ModelAdmin):
    list_display = ('nom', 'categorie', 'date_creation')
    list_filter = ('categorie', 'date_creation')
    search_fields = ('nom', 'categorie')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Application', {
            'fields': ('nom', 'categorie', 'description')
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(AccesApplication)
class AccesApplicationAdmin(admin.ModelAdmin):
    list_display = ('salarié', 'application', 'date_debut', 'date_fin')
    list_filter = ('application', 'date_debut')
    search_fields = ('salarié__prenom', 'salarié__nom', 'application__nom')
    readonly_fields = ('date_debut',)
    fieldsets = (
        ('Accès', {
            'fields': ('salarié', 'application')
        }),
        ('Dates', {
            'fields': ('date_debut', 'date_fin')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )


@admin.register(FicheParametresUser)
class FicheParametresUserAdmin(admin.ModelAdmin):
    list_display = ('salarié', 'theme_couleur', 'langue', 'notifications_activees')
    list_filter = ('theme_couleur', 'langue', 'notifications_activees')
    search_fields = ('salarié__prenom', 'salarié__nom')
    readonly_fields = ('date_creation', 'date_modification')
    fieldsets = (
        ('Paramètres', {
            'fields': ('salarié', 'theme_couleur', 'langue', 'notifications_activees')
        }),
        ('Audit', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# FICHES DE POSTE
# ============================================================================

@admin.register(FichePoste)
class FichePosteAdmin(admin.ModelAdmin):
    list_display = ('titre', 'service', 'grade', 'salaire_min', 'salaire_max', 'date_creation')
    list_filter = ('service', 'grade', 'date_creation')
    search_fields = ('titre', 'service__nom', 'grade__intitule')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Fiche de poste', {
            'fields': ('titre', 'service', 'grade')
        }),
        ('Description', {
            'fields': ('description', 'competences_requises', 'responsabilites')
        }),
        ('Rémunération', {
            'fields': ('salaire_min', 'salaire_max')
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


@admin.register(OutilFichePoste)
class OutilFichePosteAdmin(admin.ModelAdmin):
    list_display = ('fiche_poste', 'outil_travail', 'type_acces_requis', 'date_creation')
    list_filter = ('fiche_poste', 'outil_travail', 'date_creation')
    search_fields = ('fiche_poste__titre', 'outil_travail__nom')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Outil', {
            'fields': ('fiche_poste', 'outil_travail', 'type_acces_requis')
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# AMELIORATIONS
# ============================================================================

@admin.register(AmeliorationProposee)
class AmeliorationProposeeAdmin(admin.ModelAdmin):
    list_display = ('titre', 'salarié', 'priorite', 'statut_projet', 'date_proposition')
    list_filter = ('statut_projet', 'priorite', 'date_proposition')
    search_fields = ('titre', 'salarié__prenom', 'salarié__nom', 'description')
    readonly_fields = ('date_proposition',)
    fieldsets = (
        ('Amélioration', {
            'fields': ('titre', 'salarié', 'fiche_poste', 'description')
        }),
        ('Priorité', {
            'fields': ('priorite', 'statut_projet')
        }),
        ('Dates', {
            'fields': ('date_proposition', 'date_implementation')
        }),
    )


# ============================================================================
# TRAVAUX EXCEPTIONNELS
# ============================================================================

@admin.register(TravauxExceptionnels)
class TravauxExceptionnelsAdmin(admin.ModelAdmin):
    list_display = ('salarié', 'date_travail', 'heures', 'type_travail', 'statut', 'date_creation')
    list_filter = ('statut', 'type_travail', 'date_travail')
    search_fields = ('salarié__prenom', 'salarié__nom', 'type_travail')
    readonly_fields = ('date_creation',)
    fieldsets = (
        ('Travail exceptionnel', {
            'fields': ('salarié', 'date_travail', 'heures', 'type_travail', 'statut')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Audit', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )
