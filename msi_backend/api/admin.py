"""
Admin.py - Configuration du panneau admin Django
Copier ce contenu dans smartflow-backend/api/admin.py
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Societe, Departement, Circuit, Service, Grade,
    TypeAcces, OutilTravail, CreneauTravail, Equipement,
    Salarie, HistoriqueSalarie, HoraireSalarie,
    EquipementInstance, TypeApplicationAcces,
    AccesApplication, AccesSalarie,
    DemandeConge, SoldeConge, DemandeAcompte,
    DemandeSortie, TravauxExceptionnels,
    DocumentSalarie, FichePoste, AmeliorationProposee,
    OutilFichePoste, FicheParametresUser, Role,
    ImportLog
)

# ============================================================================
# PERSONNALISATION DU SITE ADMIN
# ============================================================================

admin.site.site_header = "MSI TeamHub"
admin.site.site_title = "MSI TeamHub Admin"
admin.site.index_title = "Bienvenue dans MSI TeamHub"
admin.site.site_url = None


# ============================================================================
# IMPORT LOG ADMIN
# ============================================================================

@admin.register(ImportLog)
class ImportLogAdmin(admin.ModelAdmin):
    """Configuration admin pour les logs d'import en masse"""
    list_display = ('api_name', 'statut', 'total_lignes', 'lignes_succes', 'lignes_erreur', 'date_creation')
    list_filter = ('statut', 'api_name', 'date_creation')
    search_fields = ('api_name', 'fichier_nom')
    readonly_fields = ('date_creation', 'date_modification', 'formatted_taux_succes')
    
    fieldsets = (
        ('📋 Infos Import', {
            'fields': ('api_name', 'fichier_nom', 'cree_par')
        }),
        ('📊 Résultats', {
            'fields': ('total_lignes', 'lignes_succes', 'lignes_erreur', 'statut', 'formatted_taux_succes')
        }),
        ('⚠️ Détails Erreurs', {
            'fields': ('details_erreurs',),
            'classes': ('collapse',)
        }),
        ('🗓️ Dates', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
    
    def formatted_taux_succes(self, obj):
        """Affiche le taux de succès formaté"""
        return f"{obj.get_taux_succes()}%"
    formatted_taux_succes.short_description = "Taux de succès"


# ============================================================================
# SOCIETE ADMIN
# ============================================================================

@admin.register(Societe)
class SocieteAdmin(admin.ModelAdmin):
    list_display = ('nom', 'email', 'ville', 'actif', 'date_creation')
    list_filter = ('actif', 'date_creation')
    search_fields = ('nom', 'email', 'ville')
    readonly_fields = ('date_creation',)
    
    fieldsets = (
        ('Informations Principales', {
            'fields': ('nom', 'email', 'telephone', 'activite')
        }),
        ('Adresse', {
            'fields': ('adresse', 'code_postal', 'ville')
        }),
        ('Configuration', {
            'fields': ('clients', 'actif')
        }),
        ('Métadonnées', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# DEPARTEMENT ADMIN
# ============================================================================

@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('numero', 'nom', 'region', 'societe', 'nombre_circuits', 'actif')
    list_filter = ('actif', 'societe', 'region')
    search_fields = ('numero', 'nom', 'region')
    readonly_fields = ('date_creation',)


# ============================================================================
# CIRCUIT ADMIN
# ============================================================================

@admin.register(Circuit)
class CircuitAdmin(admin.ModelAdmin):
    list_display = ('nom', 'departement', 'actif', 'date_creation')
    list_filter = ('actif', 'departement')
    search_fields = ('nom', 'departement__nom')
    readonly_fields = ('date_creation',)


# ============================================================================
# SERVICE ADMIN
# ============================================================================

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'responsable', 'actif', 'date_creation')
    list_filter = ('actif', 'societe', 'date_creation')
    search_fields = ('nom', 'description')
    readonly_fields = ('date_creation',)
    
    fieldsets = (
        ('Informations', {
            'fields': ('nom', 'societe', 'responsable', 'description', 'actif')
        }),
        ('Métadonnées', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# GRADE ADMIN
# ============================================================================

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'ordre', 'actif', 'date_creation')
    list_filter = ('societe', 'actif')
    search_fields = ('nom',)
    readonly_fields = ('date_creation',)
    ordering = ('ordre',)


# ============================================================================
# TYPE ACCES ADMIN
# ============================================================================

@admin.register(TypeAcces)
class TypeAccesAdmin(admin.ModelAdmin):
    list_display = ('nom', 'actif')
    list_filter = ('actif',)
    search_fields = ('nom',)


# ============================================================================
# OUTIL TRAVAIL ADMIN
# ============================================================================

@admin.register(OutilTravail)
class OutilTravailAdmin(admin.ModelAdmin):
    list_display = ('nom', 'actif', 'date_creation')
    list_filter = ('actif',)
    search_fields = ('nom', 'description')
    readonly_fields = ('date_creation',)


# ============================================================================
# CRENEAU TRAVAIL ADMIN
# ============================================================================

@admin.register(CreneauTravail)
class CreneauTravailAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'heure_debut', 'heure_fin', 'actif')
    list_filter = ('actif', 'societe')
    search_fields = ('nom',)
    readonly_fields = ('date_creation',)


# ============================================================================
# EQUIPEMENT ADMIN
# ============================================================================

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type_equipement', 'stock_total', 'stock_disponible', 'actif')
    list_filter = ('type_equipement', 'actif')
    search_fields = ('nom', 'description')
    readonly_fields = ('date_creation',)


# ============================================================================
# SALARIE ADMIN
# ============================================================================

@admin.register(Salarie)
class SalarieAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'prenom', 'nom', 'societe', 'service', 'poste', 'statut', 'date_embauche')
    list_filter = ('statut', 'societe', 'service', 'grade', 'date_embauche')
    search_fields = ('matricule', 'nom', 'prenom', 'mail_professionnel', 'telephone')
    readonly_fields = ('date_creation', 'date_modification')
    
    fieldsets = (
        ('Informations Personnelles', {
            'fields': ('nom', 'prenom', 'matricule', 'genre', 'date_naissance', 'telephone')
        }),
        ('Contact', {
            'fields': ('mail_professionnel', 'telephone_professionnel', 'extension_3cx')
        }),
        ('Informations Professionnelles', {
            'fields': ('societe', 'service', 'grade', 'poste', 'responsable_direct', 'date_embauche', 'date_sortie')
        }),
        ('Localisation', {
            'fields': ('departement', 'circuit')
        }),
        ('Horaires', {
            'fields': ('creneau_travail', 'en_poste')
        }),
        ('Statut', {
            'fields': ('statut',)
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# HISTORIQUE SALARIE ADMIN
# ============================================================================

@admin.register(HistoriqueSalarie)
class HistoriqueSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'service_ancien', 'service_nouveau', 'date_changement')
    list_filter = ('date_changement',)
    search_fields = ('salarie__nom', 'salarie__prenom')
    readonly_fields = ('date_changement',)


# ============================================================================
# HORAIRE SALARIE ADMIN
# ============================================================================

@admin.register(HoraireSalarie)
class HoraireSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'date_debut', 'date_fin', 'heure_debut', 'heure_fin')
    list_filter = ('date_debut',)
    search_fields = ('salarie__nom',)
    readonly_fields = ('date_creation',)


# ============================================================================
# EQUIPEMENT INSTANCE ADMIN
# ============================================================================

@admin.register(EquipementInstance)
class EquipementInstanceAdmin(admin.ModelAdmin):
    list_display = ('equipement', 'numero_serie', 'salarie', 'etat', 'date_affectation')
    list_filter = ('etat', 'equipement__type_equipement', 'date_affectation')
    search_fields = ('numero_serie', 'salarie__nom', 'salarie__prenom')
    readonly_fields = ('date_creation',)


# ============================================================================
# TYPE APPLICATION ACCES ADMIN
# ============================================================================

@admin.register(TypeApplicationAcces)
class TypeApplicationAccesAdmin(admin.ModelAdmin):
    list_display = ('nom', 'actif')
    list_filter = ('actif',)
    search_fields = ('nom',)


# ============================================================================
# ACCES APPLICATION ADMIN
# ============================================================================

@admin.register(AccesApplication)
class AccesApplicationAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'application', 'type_application', 'date_debut', 'date_fin')
    list_filter = ('type_application', 'date_debut')
    search_fields = ('salarie__nom', 'application')
    readonly_fields = ('date_debut',)


# ============================================================================
# ACCES SALARIE ADMIN
# ============================================================================

@admin.register(AccesSalarie)
class AccesSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'type_acces', 'date_debut', 'date_fin')
    list_filter = ('type_acces', 'date_debut')
    search_fields = ('salarie__nom',)
    readonly_fields = ('date_debut',)


# ============================================================================
# DEMANDE CONGE ADMIN
# ============================================================================

@admin.register(DemandeConge)
class DemandeCongeAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'type_conge', 'date_debut', 'date_fin', 'nombre_jours', 'statut')
    list_filter = ('statut', 'type_conge', 'date_debut')
    search_fields = ('salarie__nom', 'salarie__prenom')
    readonly_fields = ('date_creation', 'date_modification')
    
    fieldsets = (
        ('Demande', {
            'fields': ('salarie', 'type_conge', 'date_debut', 'date_fin', 'nombre_jours', 'motif')
        }),
        ('Validation', {
            'fields': ('statut', 'valide_par_direct', 'date_validation_direct', 'commentaire_direct',
                      'valide_par_service', 'date_validation_service', 'commentaire_service')
        }),
        ('Rejet', {
            'fields': ('rejete', 'date_rejet', 'motif_rejet'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# SOLDE CONGE ADMIN
# ============================================================================

@admin.register(SoldeConge)
class SoldeCongeAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'conges_acquis', 'conges_utilises', 'conges_restants')
    search_fields = ('salarie__nom', 'salarie__prenom')
    readonly_fields = ('date_derniere_maj',)


# ============================================================================
# DEMANDE ACOMPTE ADMIN
# ============================================================================

@admin.register(DemandeAcompte)
class DemandeAcompteAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'montant', 'statut', 'date_demande', 'date_paiement')
    list_filter = ('statut', 'date_demande')
    search_fields = ('salarie__nom', 'salarie__prenom')
    readonly_fields = ('date_demande',)


# ============================================================================
# DEMANDE SORTIE ADMIN
# ============================================================================

@admin.register(DemandeSortie)
class DemandeSortieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'date_sortie', 'heure_debut', 'heure_fin', 'statut')
    list_filter = ('statut', 'date_sortie')
    search_fields = ('salarie__nom', 'salarie__prenom')


# ============================================================================
# TRAVAUX EXCEPTIONNELS ADMIN
# ============================================================================

@admin.register(TravauxExceptionnels)
class TravauxExceptionnelsAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'date_travail', 'nombre_heures', 'statut')
    list_filter = ('statut', 'date_travail')
    search_fields = ('salarie__nom', 'salarie__prenom')
    readonly_fields = ('date_creation',)


# ============================================================================
# DOCUMENT SALARIE ADMIN
# ============================================================================

@admin.register(DocumentSalarie)
class DocumentSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'type_document', 'titre', 'date_upload')
    list_filter = ('type_document', 'date_upload')
    search_fields = ('salarie__nom', 'titre')
    readonly_fields = ('date_upload',)


# ============================================================================
# FICHE POSTE ADMIN
# ============================================================================

@admin.register(FichePoste)
class FichePOsteAdmin(admin.ModelAdmin):
    list_display = ('titre', 'service', 'grade', 'statut', 'date_creation')
    list_filter = ('statut', 'service', 'grade', 'date_creation')
    search_fields = ('titre', 'description')
    readonly_fields = ('date_creation', 'date_modification')
    
    fieldsets = (
        ('Informations Générales', {
            'fields': ('titre', 'service', 'grade', 'responsable_service', 'statut')
        }),
        ('Description', {
            'fields': ('description', 'taches', 'competences_requises')
        }),
        ('Analyse', {
            'fields': ('moyens_correction', 'problemes', 'propositions', 'defauts')
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )


# ============================================================================
# AMELIORATION PROPOSEE ADMIN
# ============================================================================

@admin.register(AmeliorationProposee)
class AmeliorationProposeeAdmin(admin.ModelAdmin):
    list_display = ('titre', 'fiche_poste', 'statut', 'priorite', 'date_proposition')
    list_filter = ('statut', 'priorite', 'date_proposition')
    search_fields = ('titre', 'fiche_poste__titre')
    readonly_fields = ('date_proposition', 'date_examen', 'date_creation')


# ============================================================================
# OUTIL FICHE POSTE ADMIN
# ============================================================================

@admin.register(OutilFichePoste)
class OutilFichePOsteAdmin(admin.ModelAdmin):
    list_display = ('fiche_poste', 'outil_travail', 'obligatoire')
    list_filter = ('obligatoire',)
    search_fields = ('fiche_poste__titre', 'outil_travail__nom')


# ============================================================================
# FICHE PARAMETRES USER ADMIN
# ============================================================================

@admin.register(FicheParametresUser)
class FicheParametresUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'langue', 'notifications_actives')
    list_filter = ('theme', 'langue', 'notifications_actives')
    search_fields = ('user__username',)
    readonly_fields = ('date_creation', 'date_modification')


# ============================================================================
# ROLE ADMIN
# ============================================================================

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'can_view_salaries', 'can_edit_salaries', 'can_validate_requests', 'can_manage_it')
    list_filter = ('can_view_salaries', 'can_edit_salaries', 'can_validate_requests')
    search_fields = ('nom',)
    filter_horizontal = ('utilisateurs',)
    readonly_fields = ('date_creation',)
    
    fieldsets = (
        ('Information', {
            'fields': ('nom', 'description')
        }),
        ('Utilisateurs', {
            'fields': ('utilisateurs',)
        }),
        ('Permissions', {
            'fields': ('can_view_salaries', 'can_edit_salaries', 'can_validate_requests',
                      'can_view_financial', 'can_edit_financial', 'can_manage_it')
        }),
        ('Métadonnées', {
            'fields': ('date_creation',),
            'classes': ('collapse',)
        }),
    )
