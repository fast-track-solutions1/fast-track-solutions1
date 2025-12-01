from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Importation de tous les ViewSets
from .views import (
    SocieteViewSet, DepartementViewSet, CircuitViewSet, ServiceViewSet,
    GradeViewSet, TypeAccesViewSet, OutilTravailViewSet, CreneauTravailViewSet,
    EquipementViewSet, TypeApplicationAccesViewSet,
    SalarieViewSet, EquipementInstanceViewSet, AccesApplicationViewSet,
    AccesSalarieViewSet, HoraireSalarieViewSet, HistoriqueSalarieViewSet,
    DemandeCongeViewSet, SoldeCongeViewSet, DemandeAcompteViewSet,
    DemandeSortieViewSet, TravauxExceptionnelsViewSet,
    DocumentSalarieViewSet,
    FichePosteViewSet, AmeliorationProposeeViewSet,
    FicheParametresUserViewSet, RoleViewSet,
    ImportLogViewSet,
    # ✅ IMPORT DES FONCTIONS D'IMPORT
    import_list_apis,
    import_get_structure,
    import_download_template,
    import_upload_file,
    import_get_history,
    import_get_details,
)

# Créer le routeur
router = DefaultRouter()

# ============================================================================
# ROUTES PARAMÉTRAGES
# ============================================================================
router.register(r'societes', SocieteViewSet, basename='societe')
router.register(r'departements', DepartementViewSet, basename='departement')
router.register(r'circuits', CircuitViewSet, basename='circuit')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'types-acces', TypeAccesViewSet, basename='type-acces')
router.register(r'outils-travail', OutilTravailViewSet, basename='outil-travail')
router.register(r'creneaux-travail', CreneauTravailViewSet, basename='creneau-travail')
router.register(r'equipements', EquipementViewSet, basename='equipement')
router.register(r'types-application-acces', TypeApplicationAccesViewSet, basename='type-application-acces')

# ============================================================================
# ROUTES SALARIÉS
# ============================================================================
router.register(r'salaries', SalarieViewSet, basename='salarie')
router.register(r'equipement-instances', EquipementInstanceViewSet, basename='equipement-instance')
router.register(r'acces-application', AccesApplicationViewSet, basename='acces-application')
router.register(r'acces-salarie', AccesSalarieViewSet, basename='acces-salarie')
router.register(r'horaires-salarie', HoraireSalarieViewSet, basename='horaire-salarie')
router.register(r'historique-salarie', HistoriqueSalarieViewSet, basename='historique-salarie')

# ============================================================================
# ROUTES DEMANDES
# ============================================================================
router.register(r'demandes-conge', DemandeCongeViewSet, basename='demande-conge')
router.register(r'solde-conge', SoldeCongeViewSet, basename='solde-conge')
router.register(r'demandes-acompte', DemandeAcompteViewSet, basename='demande-acompte')
router.register(r'demandes-sortie', DemandeSortieViewSet, basename='demande-sortie')
router.register(r'travaux-exceptionnels', TravauxExceptionnelsViewSet, basename='travaux-exceptionnels')

# ============================================================================
# ROUTES DOCUMENTS
# ============================================================================
router.register(r'documents-salarie', DocumentSalarieViewSet, basename='document-salarie')

# ============================================================================
# ROUTES FICHES DE POSTE
# ============================================================================
router.register(r'fiches-poste', FichePosteViewSet, basename='fiche-poste')
router.register(r'ameliorations-proposees', AmeliorationProposeeViewSet, basename='amelioration-proposee')

# ============================================================================
# ROUTES PARAMÉTRAGE USER
# ============================================================================
router.register(r'fiche-parametres-user', FicheParametresUserViewSet, basename='fiche-parametres-user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'import-logs', ImportLogViewSet, basename='import-logs')

# ============================================================================
# URL PATTERNS
# ============================================================================
urlpatterns = [
    # Routes du router (inclut toutes les routes enregistrées)
    path('', include(router.urls)),

    # ============================================================================
    # ✅ ENDPOINTS D'IMPORT EN MASSE - ROUTES DIRECTES (CORRIGÉES)
    # ============================================================================
    
    # Liste tous les modèles
    path('import/list/', import_list_apis, name='import-list-apis'),
    
    # Récupère structure d'un modèle avec l'api_name en URL
    path('import/structure/<str:api_name>/', import_get_structure, name='import-get-structure'),
    
    # Télécharge template Excel avec l'api_name en URL
    path('import/template/<str:api_name>/', import_download_template, name='import-download-template'),
    
    # Upload et importe fichier avec l'api_name en URL
    path('import/upload/<str:api_name>/', import_upload_file, name='import-upload-file'),
    
    # Historique des imports
    path('import/history/', import_get_history, name='import-get-history'),
    
    # Détails d'un import avec log_id en URL
    path('import/details/<int:log_id>/', import_get_details, name='import-get-details'),
]
