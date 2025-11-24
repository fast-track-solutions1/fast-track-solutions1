"""
Admin.py - Configuration du panneau admin Django
Copier ce contenu dans msi_backend/api/admin.py
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee
)

# ============================================================================
# INLINES
# ============================================================================

class ServiceInline(admin.TabularInline):
    model = Service
    extra = 1

class GradeInline(admin.TabularInline):
    model = Grade
    extra = 1

class DepartementInline(admin.TabularInline):
    model = Departement
    extra = 1

class OutilTravailInline(admin.TabularInline):
    model = OutilTravail
    extra = 1

# ============================================================================
# SOCIETE ADMIN
# ============================================================================

@admin.register(Societe)
class SocieteAdmin(admin.ModelAdmin):
    list_display = ('nom', 'client', 'ville', 'email', 'date_creation')
    search_fields = ('nom', 'email', 'ville')
    readonly_fields = ('date_creation', 'date_modification')
    
    fieldsets = (
        ('Informations Principales', {
            'fields': ('nom', 'client', 'activite', 'email', 'telephone')
        }),
        ('Adresse', {
            'fields': ('adresse', 'code_postal', 'ville', 'pays')
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )

# ============================================================================
# SERVICE ADMIN
# ============================================================================

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'get_responsable', 'actif', 'date_creation')
    list_filter = ('societe', 'actif', 'date_creation')
    search_fields = ('nom', 'description')
    readonly_fields = ('date_creation', 'date_modification')
    
    fieldsets = (
        ('Informations', {
            'fields': ('societe', 'nom', 'description', 'responsable', 'actif')
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
    
    def get_responsable(self, obj):
        return obj.responsable.nom_complet if obj.responsable else "-"
    get_responsable.short_description = "Responsable"

# ============================================================================
# GRADE ADMIN
# ============================================================================

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('intitule', 'societe', 'niveau_hierarchique', 'actif')
    list_filter = ('societe', 'actif', 'niveau_hierarchique')
    search_fields = ('intitule',)
    ordering = ('-niveau_hierarchique',)
    
    fieldsets = (
        ('Informations', {
            'fields': ('societe', 'intitule', 'niveau_hierarchique', 'description', 'actif')
        }),
    )

# ============================================================================
# DEPARTEMENT ADMIN
# ============================================================================

@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('numero', 'nom', 'region', 'get_status', 'nombre_circuits', 'date_activation')
    list_filter = ('region', 'actif', 'societe')
    search_fields = ('numero', 'nom', 'region', 'prefecture')
    ordering = ('numero',)
    
    fieldsets = (
        ('Informations Principales', {
            'fields': ('societe', 'numero', 'nom', 'prefecture', 'region')
        }),
        ('Configuration', {
            'fields': ('actif', 'nombre_circuits', 'date_activation')
        }),
    )
    
    def get_status(self, obj):
        if obj.actif:
            return format_html('<span style="color: green;">✓ Actif</span>')
        return format_html('<span style="color: red;">✗ Inactif</span>')
    get_status.short_description = "Statut"

# ============================================================================
# TYPE ACCES ADMIN
# ============================================================================

@admin.register(TypeAcces)
class TypeAccesAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'niveau_privilege')
    list_filter = ('societe', 'niveau_privilege')
    search_fields = ('nom',)

# ============================================================================
# OUTIL TRAVAIL ADMIN
# ============================================================================

@admin.register(OutilTravail)
class OutilTravailAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'categorie', 'actif', 'date_creation')
    list_filter = ('societe', 'categorie', 'actif')
    search_fields = ('nom', 'description')
    filter_horizontal = ('services_autorises', 'grades_autorises')
    readonly_fields = ('date_creation', 'date_modification')

# ============================================================================
# EQUIPEMENT ADMIN
# ============================================================================

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'type_equipement')
    list_filter = ('societe', 'type_equipement')
    search_fields = ('nom',)

# ============================================================================
# SALARIE ADMIN
# ============================================================================

@admin.register(Salarie)
class SalarieAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'get_nom_complet', 'get_genre_badge', 'service', 'grade', 'get_statut', 'date_entree')
    list_filter = ('service', 'grade', 'statut', 'genre', 'type_contrat', 'date_entree')
    search_fields = ('matricule', 'nom', 'prenom', 'email_professionnel')
    readonly_fields = ('date_creation', 'date_modification', 'age')
    filter_horizontal = ('zones_geographiques',)
    
    fieldsets = (
        ('Informations Personnelles', {
            'fields': ('matricule', 'nom', 'prenom', 'genre', 'date_naissance', 'lieu_naissance', 'nationalite', 'age')
        }),
        ('Contact Personnel', {
            'fields': ('adresse', 'code_postal', 'ville', 'telephone_personnel', 'email_personnel')
        }),
        ('Informations Professionnelles', {
            'fields': ('email_professionnel', 'date_entree', 'poste', 'service', 'grade', 'responsable_direct', 'zones_geographiques')
        }),
        ('Équipements', {
            'fields': ('a_laptop', 'numero_serie_laptop', 'a_telephone', 'numero_telephone_service', 'extension_3cx')
        }),
        ('Contrat', {
            'fields': ('type_contrat', 'statut', 'salaire_base', 'primes')
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification', 'actif'),
            'classes': ('collapse',)
        }),
    )
    
    def get_nom_complet(self, obj):
        return obj.nom_complet
    get_nom_complet.short_description = "Nom Complet"
    
    def get_genre_badge(self, obj):
        colors = {'M': 'blue', 'F': 'pink', 'Autre': 'gray'}
        color = colors.get(obj.genre, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_genre_display()
        )
    get_genre_badge.short_description = "Genre"
    
    def get_statut(self, obj):
        colors = {'actif': 'green', 'inactif': 'red', 'en_conge': 'orange', 'suspendu': 'purple'}
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_statut_display()
        )
    get_statut.short_description = "Statut"

# ============================================================================
# ACCES SALARIE ADMIN
# ============================================================================

@admin.register(AccesSalarie)
class AccesSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'outil', 'type_acces', 'actif', 'date_activation')
    list_filter = ('outil', 'type_acces', 'actif', 'date_activation')
    search_fields = ('salarie__nom', 'salarie__prenom', 'outil__nom')
    readonly_fields = ('date_activation', 'date_desactivation')

# ============================================================================
# HISTORIQUE SALARIE ADMIN
# ============================================================================

@admin.register(HistoriqueSalarie)
class HistoriqueSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'date_changement', 'type_changement', 'date_creation')
    list_filter = ('type_changement', 'date_changement')
    search_fields = ('salarie__nom', 'salarie__prenom', 'raison')
    readonly_fields = ('date_creation',)
    ordering = ('-date_changement',)

# ============================================================================
# FICHE POSTE ADMIN
# ============================================================================

@admin.register(FichePoste)
class FichePosteAdmin(admin.ModelAdmin):
    list_display = ('code_fiche', 'intitule', 'service', 'grade', 'get_statut', 'date_creation')
    list_filter = ('service', 'grade', 'statut', 'date_creation')
    search_fields = ('code_fiche', 'intitule', 'description')
    readonly_fields = ('code_fiche', 'date_creation', 'date_modification')
    filter_horizontal = ('outils_utilises',)
    
    fieldsets = (
        ('Informations Générales', {
            'fields': ('code_fiche', 'intitule', 'service', 'grade', 'responsable_hierarchique', 'statut')
        }),
        ('Description', {
            'fields': ('description', 'objectifs', 'missions_principales')
        }),
        ('Contenu', {
            'fields': ('taches_recurrentes', 'anomalies_detectees', 'problemes_identifies', 'outils_utilises')
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
    
    def get_statut(self, obj):
        colors = {'actif': 'green', 'inactif': 'red', 'en_revision': 'orange'}
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_statut_display()
        )
    get_statut.short_description = "Statut"

# ============================================================================
# OUTIL FICHE POSTE ADMIN
# ============================================================================

@admin.register(OutilFichePoste)
class OutilFichePosteAdmin(admin.ModelAdmin):
    list_display = ('fiche_poste', 'outil', 'type_acces_requis')
    list_filter = ('fiche_poste__service', 'outil', 'type_acces_requis')
    search_fields = ('fiche_poste__intitule', 'outil__nom')

# ============================================================================
# AMELIORATION PROPOSEE ADMIN
# ============================================================================

@admin.register(AmeliorationProposee)
class AmeliorationProposeeAdmin(admin.ModelAdmin):
    list_display = ('fiche_poste', 'description_short', 'priorite', 'get_priorite_badge', 'statut_projet', 'date_creation')
    list_filter = ('priorite', 'statut_projet', 'service_concerne', 'date_creation')
    search_fields = ('fiche_poste__intitule', 'description', 'nom_projet')
    readonly_fields = ('date_creation', 'date_modification')
    ordering = ('-priorite', '-date_creation')
    
    def description_short(self, obj):
        return obj.description[:50] + "..." if len(obj.description) > 50 else obj.description
    description_short.short_description = "Description"
    
    def get_priorite_badge(self, obj):
        colors = {
            'basse': 'blue',
            'moyenne': 'green',
            'haute': 'orange',
            'critique': 'red'
        }
        color = colors.get(obj.priorite, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_priorite_display()
        )
    get_priorite_badge.short_description = "Priorité"
