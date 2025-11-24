from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SocieteViewSet, ServiceViewSet, GradeViewSet, DepartementViewSet,
    TypeAccesViewSet, OutilTravailViewSet, EquipementViewSet,
    SalarieViewSet, EquipementInstanceViewSet, HistoriqueSalarieViewSet,
    DocumentSalarieViewSet, CreneauTravailViewSet, HoraireSalarieViewSet,
    DemandeCongeViewSet, SoldeCongeViewSet, AccesSalarieViewSet,
    TypeApplicationAccesViewSet, AccesApplicationViewSet, FicheParametresUserViewSet,
    FichePosteViewSet, OutilFichePosteViewSet, AmeliorationProposeeViewSet,
    TravauxExceptionnelsViewSet
)

# ============================================================================
# ROUTER CONFIGURATION
# ============================================================================

router = DefaultRouter()

# Modèles de base
router.register(r'societes', SocieteViewSet, basename='societe')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'departements', DepartementViewSet, basename='departement')
router.register(r'types-acces', TypeAccesViewSet, basename='type-acces')
router.register(r'outils-travail', OutilTravailViewSet, basename='outil-travail')
router.register(r'equipements', EquipementViewSet, basename='equipement')

# Salariés
router.register(r'salaries', SalarieViewSet, basename='salarie')
router.register(r'equipement-instances', EquipementInstanceViewSet, basename='equipement-instance')
router.register(r'historique-salaries', HistoriqueSalarieViewSet, basename='historique-salarie')
router.register(r'documents-salaries', DocumentSalarieViewSet, basename='document-salarie')

# Horaires et congés
router.register(r'creneaux-travail', CreneauTravailViewSet, basename='creneaux-travail')
router.register(r'horaires-salaries', HoraireSalarieViewSet, basename='horaire-salarie')
router.register(r'demandes-conge', DemandeCongeViewSet, basename='demande-conge')
router.register(r'soldes-conge', SoldeCongeViewSet, basename='solde-conge')

# Accès et autorisations
router.register(r'acces-salaries', AccesSalarieViewSet, basename='acces-salarie')
router.register(r'types-application-acces', TypeApplicationAccesViewSet, basename='type-application-acces')
router.register(r'acces-applications', AccesApplicationViewSet, basename='acces-application')
router.register(r'fiches-parametres-user', FicheParametresUserViewSet, basename='fiche-parametres-user')

# Fiches de poste
router.register(r'fiches-poste', FichePosteViewSet, basename='fiche-poste')
router.register(r'outils-fiche-poste', OutilFichePosteViewSet, basename='outil-fiche-poste')

# Améliorations et travaux exceptionnels
router.register(r'ameliorations-proposees', AmeliorationProposeeViewSet, basename='amelioration-proposee')
router.register(r'travaux-exceptionnels', TravauxExceptionnelsViewSet, basename='travaux-exceptionnels')

# ============================================================================
# URL PATTERNS
# ============================================================================

urlpatterns = [
    path('', include(router.urls)),
]
