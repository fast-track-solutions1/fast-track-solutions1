# ============================================================================
# VIEWS.PY - COMPLET AVEC ACTIONS NOUVELLES (mes-demandes, a-traiter, historique)
# ============================================================================

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from datetime import datetime, date
import io, json, pandas as pd
from django.http import HttpResponse
from django.utils.encoding import smart_str
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail, Circuit,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser, Role,
    DemandeAcompte, DemandeSortie, ImportLog
)

from .serializers import (
    SocieteSerializer, ServiceSerializer, GradeSerializer, DepartementSerializer,
    TypeAccesSerializer, OutilTravailSerializer, EquipementSerializer,
    SalarieDetailSerializer, SalarieListSerializer, EquipementInstanceSerializer,
    HistoriqueSalarieSerializer, DocumentSalarieSerializer, CreneauTravailSerializer,
    HoraireSalarieSerializer, DemandeCongeSerializer, SoldeCongeSerializer,
    AccesSalarieSerializer, TypeApplicationAccesSerializer, AccesApplicationSerializer,
    FicheParametresUserSerializer, CircuitSerializer, RoleSerializer,
    DemandeAcompteSerializer, DemandeSortieSerializer, TravauxExceptionnelsSerializer,
    FichePosteDetailSerializer, AmeliorationProposeeSerializer, ImportLogSerializer
)

from .permissions import (
    IsAdmin, IsRH, IsIT, IsDAF, IsComptable, IsResponsableService, IsSalarie,
    CanViewSalaries, CanEditSalaries, CanValidateRequests, CanManageDocuments,
    CanViewOwnData, CanManageEquipment, CanViewFinancial
)

from .utils import (
    IMPORT_CONFIG, parse_value, get_current_data,
    generate_template_dataframe,
    calculate_working_days
)

# ============================================================================
# VIEWSETS BASE - PARAMÉTRAGE
# ============================================================================

class SocieteViewSet(viewsets.ModelViewSet):
    """ViewSet pour Societes - Admin seulement"""
    queryset = Societe.objects.all()
    serializer_class = SocieteSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_fields = ['nom', 'actif']
    search_fields = ['nom', 'email', 'adresse']
    ordering_fields = ['nom', 'date_creation']
    ordering = ['nom']

class DepartementViewSet(viewsets.ModelViewSet):
    """ViewSet pour Departements"""
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['societe', 'numero', 'actif']
    search_fields = ['nom', 'numero', 'region']
    ordering_fields = ['numero', 'nom']
    ordering = ['numero']

class CircuitViewSet(viewsets.ModelViewSet):
    """ViewSet pour Circuits"""
    queryset = Circuit.objects.all()
    serializer_class = CircuitSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['departement', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom']

class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet pour Services"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, CanViewSalaries]
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom']

class GradeViewSet(viewsets.ModelViewSet):
    """ViewSet pour Grades"""
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated, CanViewSalaries]
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom']
    ordering_fields = ['ordre', 'nom']

class TypeAccesViewSet(viewsets.ModelViewSet):
    """ViewSet pour Types d'accès"""
    queryset = TypeAcces.objects.all()
    serializer_class = TypeAccesSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['actif']
    search_fields = ['nom']

class OutilTravailViewSet(viewsets.ModelViewSet):
    """ViewSet pour Outils de travail"""
    queryset = OutilTravail.objects.all()
    serializer_class = OutilTravailSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['actif']
    search_fields = ['nom', 'description']

class CreneauTravailViewSet(viewsets.ModelViewSet):
    """ViewSet pour Créneaux de travail"""
    queryset = CreneauTravail.objects.all()
    serializer_class = CreneauTravailSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom']

class EquipementViewSet(viewsets.ModelViewSet):
    """ViewSet pour Équipements"""
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    permission_classes = [IsAuthenticated, CanViewSalaries]
    filterset_fields = ['type_equipement', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'type_equipement']

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Retourne les statistiques des équipements"""
        from django.db.models import Count
        equipements = self.get_queryset()
        instances = EquipementInstance.objects.all()
        par_type = list(equipements.values('type_equipement').annotate(
            count=Count('id')
        ).order_by('-count'))
        par_etat = list(instances.values('etat').annotate(
            count=Count('id')
        ).order_by('etat'))
        total_equipements = equipements.count()
        total_instances = instances.count()
        instances_actives = instances.filter(etat='actif').count() if instances.exists() else 0
        return Response({
            'total_equipements': total_equipements,
            'total_instances': total_instances,
            'instances_actives': instances_actives,
            'par_type': par_type,
            'par_etat': par_etat,
        })

class TypeApplicationAccesViewSet(viewsets.ModelViewSet):
    """ViewSet pour Types d'applications"""
    queryset = TypeApplicationAcces.objects.all()
    serializer_class = TypeApplicationAccesSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['actif']
    search_fields = ['nom']

# ============================================================================
# VIEWSETS SALARIÉ
# ============================================================================

class SalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour Salariés - Avec permissions granulaires"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['societe', 'service', 'grade', 'statut']
    search_fields = ['nom', 'prenom', 'matricule', 'mail_professionnel']
    ordering_fields = ['nom', 'prenom', 'date_embauche', 'date_creation']
    ordering = ['nom', 'prenom']

    def get_queryset(self):
        """Filtre les salariés selon le rôle de l'utilisateur"""
        user = self.request.user
        if user.is_staff:
            return Salarie.objects.all()
        if hasattr(user, 'profil_salarie'):
            return Salarie.objects.filter(user=user)
        if user.roles.filter(nom__in=['rh', 'responsable_service']).exists():
            return Salarie.objects.all()
        if user.roles.filter(nom__in=['daf', 'comptable']).exists():
            return Salarie.objects.all()
        return Salarie.objects.none()

    def get_serializer_class(self):
        """Retourne serializer selon action"""
        if self.action in ['list', 'retrieve']:
            return SalarieDetailSerializer
        return SalarieListSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def ma_fiche(self, request):
        """Endpoint pour voir sa propre fiche"""
        if not hasattr(request.user, 'profil_salarie'):
            return Response({'error': 'Vous n\'avez pas de profil salarié'},
                          status=status.HTTP_403_FORBIDDEN)
        serializer = SalarieDetailSerializer(request.user.profil_salarie)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def equipements(self, request, pk=None):
        """Liste équipements du salarié"""
        salarie = self.get_object()
        equipements = EquipementInstance.objects.filter(salarie=salarie)
        serializer = EquipementInstanceSerializer(equipements, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def acces_applicatif(self, request, pk=None):
        """Liste accès applicatif"""
        salarie = self.get_object()
        acces = AccesApplication.objects.filter(salarie=salarie)
        serializer = AccesApplicationSerializer(acces, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statut_actuel(self, request, pk=None):
        """Retourne statut en poste/pause"""
        salarie = self.get_object()
        return Response({
            'statut_actuel': salarie.get_statut_actuel(),
            'anciennete': salarie.get_anciennete(),
            'jour_mois_naissance': salarie.jour_mois_naissance
        })

    @action(detail=False, methods=['get'])
    def annuaire(self, request):
        """Liste complète pour annuaire (infos publiques)"""
        salaries = self.get_queryset().filter(statut='actif')
        serializer = SalarieListSerializer(salaries, many=True)
        return Response(serializer.data)

class EquipementInstanceViewSet(viewsets.ModelViewSet):
    """ViewSet pour instances équipements affectés"""
    queryset = EquipementInstance.objects.all()
    serializer_class = EquipementInstanceSerializer
    permission_classes = [IsAuthenticated, CanViewSalaries]
    filterset_fields = ['equipement', 'salarie', 'etat']
    search_fields = ['numero_serie', 'model']
    ordering_fields = ['date_affectation', 'numero_serie']

class AccesApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet pour accès applicatifs"""
    queryset = AccesApplication.objects.all()
    serializer_class = AccesApplicationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'application']
    search_fields = ['application']

class AccesSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour accès physiques"""
    queryset = AccesSalarie.objects.all()
    serializer_class = AccesSalarieSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'type_acces']

class HoraireSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour horaires supplémentaires"""
    queryset = HoraireSalarie.objects.all()
    serializer_class = HoraireSalarieSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'date_debut']

class HistoriqueSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour historique salariés"""
    queryset = HistoriqueSalarie.objects.all()
    serializer_class = HistoriqueSalarieSerializer
    permission_classes = [IsAuthenticated, CanViewSalaries]
    filterset_fields = ['salarie']
    ordering_fields = ['date_changement']
    ordering = ['-date_changement']

# ============================================================================
# 📋 DEMANDE CONGÉ VIEWSET - VERSION COMPLÈTE AVEC TOUTES LES ACTIONS
# ============================================================================

class DemandeCongeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour demandes de congé
    
    Actions disponibles:
    - confirmer_jours(POST /demandes-conge/<id>/confirmer_jours/)
    - soumettre(POST /demandes-conge/<id>/soumettre/)
    - valider_direct(POST /demandes-conge/<id>/valider_direct/)
    - valider_service(POST /demandes-conge/<id>/valider_service/)
    - rejeter(POST /demandes-conge/<id>/rejeter/)
    - mes_demandes(GET /demandes-conge/mes_demandes/)
    - a_traiter(GET /demandes-conge/a_traiter/)
    - historique(GET /demandes-conge/historique/)
    """
    
    queryset = DemandeConge.objects.all()
    serializer_class = DemandeCongeSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['salarie', 'statut', 'type_conge']
    search_fields = ['salarie__nom', 'salarie__prenom']
    ordering_fields = ['date_debut', 'date_creation']
    ordering = ['-date_creation']
    
    def get_queryset(self):
    """Filtre les demandes selon le rôle de l'utilisateur"""
    user = self.request.user

    # Admin & RH voient tout
    if user.is_staff or user.roles.filter(nom__in=['rh', 'comptable', 'daf']).exists():
        return DemandeConge.objects.all()

    # Salarié : uniquement ses demandes
    if hasattr(user, 'profil_salarie'):
        return DemandeConge.objects.filter(salarie=user.profil_salarie)

    return DemandeConge.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
def mes_demandes(self, request):
    """
    Retourne les demandes soumises par l'utilisateur connecté.
    Utilisée par GET /demandes-conge/mes_demandes/
    """
    if not hasattr(request.user, 'profil_salarie'):
        return Response(
            {'error': "Vous n'avez pas de profil salarié"},
            status=status.HTTP_403_FORBIDDEN,
        )

    demandes = DemandeConge.objects.filter(
        salarie=request.user.profil_salarie
    ).order_by('-date_creation')
    serializer = self.get_serializer(demandes, many=True)
    return Response(serializer.data)

    # ========================================================================
    # 🆕 ACTION 1: CONFIRMER LES JOURS (Salarié confirme le calcul)
    # ========================================================================
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
def confirmer_jours(self, request, pk=None):
    """
    Confirme le nombre de jours calculé automatiquement.
    Endpoint: POST /demandes-conge/<id>/confirmer_jours/
    """
    demande = self.get_object()

    # Vérifier que c'est bien le salarié propriétaire
    if not hasattr(request.user, 'profil_salarie') or request.user.profil_salarie != demande.salarie:
        return Response(
            {'error': 'Vous ne pouvez confirmer que vos propres demandes'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if not demande.date_debut or not demande.date_fin:
        return Response(
            {'error': 'Dates début/fin manquantes'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Calcul des jours ouvrables via utils.calculate_working_days
    nombre_jours = calculate_working_days(demande.date_debut, demande.date_fin)

    if nombre_jours <= 0:
        return Response(
            {'error': 'La date de fin doit être après la date de début'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    demande.nombre_jours = nombre_jours
    demande.statut = 'soumise'  # on passe en 'soumise' après confirmation
    demande.save()

    serializer = self.get_serializer(demande)
    return Response(
        {
            'status': 'Jours confirmés',
            'nombre_jours': float(demande.nombre_jours),
            'demande': serializer.data,
        },
        status=status.HTTP_200_OK,
    )

    
    # ========================================================================
    # 🆕 ACTION 2: SOUMETTRE LA DEMANDE (Salarié soumet après confirmation)
    # ========================================================================
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def soumettre(self, request, pk=None):
        """
        Soumet la demande au workflow de validation
        
        Endpoint: POST /demandes-conge/<id>/soumettre/
        
        Affecte automatiquement à:
        - Responsable direct (pour validation niveau 1)
        - Responsable service (pour validation niveau 2)
        - Admin (pour supervision)
        """
        demande = self.get_object()
        
        # Vérifier que c'est le salarié
        if not hasattr(request.user, 'profilsalarie') or request.user.profilsalarie != demande.salarie:
            return Response(
                {'error': 'Vous ne pouvez soumettre que vos propres demandes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier que les jours ont été confirmés
        if not demande.jours_confirmes_par_salarie:
            return Response(
                {'error': 'Vous devez d\'abord confirmer le nombre de jours'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que la demande n'a pas déjà été soumise
        if demande.statut != 'en_attente_confirmation':
            return Response(
                {'error': f'La demande est déjà dans le statut: {demande.statut}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✅ Assigner automatiquement aux responsables
        demande.assign_to_managers()  # Méthode du model
        
        # Marquer comme soumise
        demande.date_soumission = datetime.now()
        demande.statut = 'en_attente_validation'  # ✅ En attente de validation direct
        
        demande.save()
        
        serializer = self.get_serializer(demande)
        return Response({
            'status': 'Demande soumise avec succès',
            'message': f'Affectée à {demande.salarie.responsable_direct} (responsable direct)',
            'demande': serializer.data
        }, status=status.HTTP_200_OK)
    
    # ========================================================================
    # ✅ ACTION 3: VALIDER PAR RESPONSABLE DIRECT (Validation niveau 1)
    # ========================================================================
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_direct(self, request, pk=None):
        """
        Valide la demande par le responsable direct
        
        Endpoint: POST /demandes-conge/<id>/valider_direct/
        Body: { "commentaire": "Approuvé" }
        """
        demande = self.get_object()
        
        # Vérifier que la demande est en attente de validation
        if demande.statut != 'en_attente_validation':
            return Response(
                {'error': f'La demande n\'est pas en attente. Statut actuel: {demande.statut}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marquer comme validé par responsable direct
        demande.valide_par_responsable_direct = True
        demande.date_validation_responsable_direct = datetime.now()
        demande.commentaire_responsable_direct = request.data.get('commentaire', '')
        demande.statut = 'en_attente_service'  # ✅ En attente de validation service
        
        demande.save()
        
        serializer = self.get_serializer(demande)
        return Response({
            'status': 'Validée par responsable direct',
            'message': f'En attente de validation par {demande.salarie.responsable_service}',
            'demande': serializer.data
        }, status=status.HTTP_200_OK)
    
    # ========================================================================
    # ✅ ACTION 4: VALIDER PAR RESPONSABLE SERVICE (Validation niveau 2)
    # ========================================================================
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_service(self, request, pk=None):
        """
        Valide la demande par le responsable service
        
        Endpoint: POST /demandes-conge/<id>/valider_service/
        Body: { "commentaire": "Approuvé par service" }
        """
        demande = self.get_object()
        
        # Vérifier que le responsable direct a déjà validé
        if not demande.valide_par_responsable_direct:
            return Response(
                {'error': 'Doit être validée par responsable direct d\'abord'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que la demande est en attente de validation service
        if demande.statut != 'en_attente_service':
            return Response(
                {'error': f'Statut actuel: {demande.statut}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marquer comme validé par responsable service
        demande.valide_par_responsable_service = True
        demande.date_validation_responsable_service = datetime.now()
        demande.commentaire_responsable_service = request.data.get('commentaire', '')
        demande.statut = 'approuvee'  # ✅ APPROUVÉE FINALEMENT
        
        demande.save()
        
        serializer = self.get_serializer(demande)
        return Response({
            'status': 'Approuvée par responsable service',
            'message': 'Demande approuvée et finalisée',
            'demande': serializer.data
        }, status=status.HTTP_200_OK)
    
    # ========================================================================
    # ✅ ACTION 5: REJETER LA DEMANDE
    # ========================================================================
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def rejeter(self, request, pk=None):
        """
        Rejette la demande de congé
        
        Endpoint: POST /demandes-conge/<id>/rejeter/
        Body: { "motif_rejet": "Raison du rejet" }
        """
        demande = self.get_object()
        
        # Vérifier que la demande peut encore être rejetée
        if demande.statut in ['approuvee', 'rejetee']:
            return Response(
                {'error': f'Impossible de rejeter. Statut: {demande.statut}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marquer comme rejetée
        demande.rejetee = True
        demande.date_rejet = datetime.now()
        demande.motif_rejet = request.data.get('motif_rejet', '')
        demande.statut = 'rejetee'
        
        demande.save()
        
        serializer = self.get_serializer(demande)
        return Response({
            'status': 'Demande rejetée',
            'motif': demande.motif_rejet,
            'demande': serializer.data
        }, status=status.HTTP_200_OK)
    
    # ========================================================================
    # 📖 ACTION 6: MES DEMANDES (Salarié voit ses propres demandes)
    # ========================================================================
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_demandes(self, request):
        """
        Retourne les demandes soumises par l'utilisateur connecté
        
        Endpoint: GET /demandes-conge/mes_demandes/
        """
        if not hasattr(request.user, 'profilsalarie'):
            return Response(
                {'error': 'Vous n\'avez pas de profil salarié'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        demandes = DemandeConge.objects.filter(
            salarie=request.user.profilsalarie
        ).order_by('-date_creation')
        
        serializer = self.get_serializer(demandes, many=True)
        return Response({
            'count': len(demandes),
            'demandes': serializer.data
        })
    
    # ========================================================================
    # ⏳ ACTION 7: À TRAITER (Demandes en attente de validation)
    # ========================================================================
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def a_traiter(self, request):
        """
        Retourne les demandes que l'utilisateur doit valider
        
        Endpoint: GET /demandes-conge/a_traiter/
        """
        demandes = DemandeConge.objects.filter(
            statut__in=['en_attente_validation', 'en_attente_service']
        ).exclude(
            valide_par_responsable_direct=True,
            valide_par_responsable_service=True
        ).order_by('-date_creation')
        
        serializer = self.get_serializer(demandes, many=True)
        return Response({
            'count': len(demandes),
            'demandes': serializer.data
        })
    
    # ========================================================================
    # 📋 ACTION 8: HISTORIQUE (Demandes traitées/finalisées)
    # ========================================================================
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def historique(self, request):
        """
        Retourne les demandes déjà validées ou rejetées
        
        Endpoint: GET /demandes-conge/historique/
        """
        demandes = DemandeConge.objects.filter(
            statut__in=['approuvee', 'rejetee']
        ).order_by('-date_creation')
        
        serializer = self.get_serializer(demandes, many=True)
        return Response({
            'count': len(demandes),
            'demandes': serializer.data
        })

class SoldeCongeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet lecture-seule pour solde congés"""
    queryset = SoldeConge.objects.all()
    serializer_class = SoldeCongeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie']

class DemandeAcompteViewSet(viewsets.ModelViewSet):
    """ViewSet pour demandes d'acompte"""
    queryset = DemandeAcompte.objects.all()
    serializer_class = DemandeAcompteSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'statut']
    ordering_fields = ['date_demande']
    ordering = ['-date_demande']

    def get_queryset(self):
        """Filtre selon rôle"""
        user = self.request.user
        if user.is_staff or user.roles.filter(nom__in=['rh', 'comptable', 'daf']).exists():
            return DemandeAcompte.objects.all()
        if hasattr(user, 'profil_salarie'):
            return DemandeAcompte.objects.filter(salarie=user.profil_salarie)
        return DemandeAcompte.objects.none()

    # 🎯 Mes demandes
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_demandes(self, request):
        """Retourne les demandes soumises par l'utilisateur"""
        if not hasattr(request.user, 'profil_salarie'):
            return Response({'error': 'Pas de profil salarié'}, status=status.HTTP_403_FORBIDDEN)
        
        demandes = DemandeAcompte.objects.filter(
            salarie=request.user.profil_salarie
        ).order_by('-date_demande')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)

    # 🎯 À traiter
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def a_traiter(self, request):
        """Demandes en attente de validation"""
        demandes = DemandeAcompte.objects.filter(
            statut__in=['soumise', 'validée_direct']
        ).exclude(valide_par_service=True).order_by('-date_demande')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)

    # 🎯 Historique
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def historique(self, request):
        """Demandes traitées"""
        demandes = DemandeAcompte.objects.filter(
            statut__in=['approuvée', 'rejetée', 'payée']
        ).order_by('-date_demande')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_direct(self, request, pk=None):
        """Valider par responsable direct"""
        demande = self.get_object()
        demande.valide_par_direct = True
        demande.date_validation_direct = datetime.now()
        demande.statut = 'validée_direct'
        demande.save()
        return Response({'status': 'Validée par responsable direct'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_service(self, request, pk=None):
        """Valider par responsable service"""
        demande = self.get_object()
        demande.valide_par_service = True
        demande.date_validation_service = datetime.now()
        demande.statut = 'approuvée'
        demande.save()
        return Response({'status': 'Approuvée par responsable service'})

class DemandeSortieViewSet(viewsets.ModelViewSet):
    """ViewSet pour demandes de sortie"""
    queryset = DemandeSortie.objects.all()
    serializer_class = DemandeSortieSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'statut']
    ordering_fields = ['date_sortie']
    ordering = ['-date_sortie']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.roles.filter(nom__in=['rh', 'comptable', 'daf']).exists():
            return DemandeSortie.objects.all()
        if hasattr(user, 'profil_salarie'):
            return DemandeSortie.objects.filter(salarie=user.profil_salarie)
        return DemandeSortie.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_demandes(self, request):
        if not hasattr(request.user, 'profil_salarie'):
            return Response({'error': 'Pas de profil salarié'}, status=status.HTTP_403_FORBIDDEN)
        demandes = DemandeSortie.objects.filter(salarie=request.user.profil_salarie).order_by('-date_sortie')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def a_traiter(self, request):
        demandes = DemandeSortie.objects.filter(statut__in=['soumise', 'validée_direct']).order_by('-date_sortie')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def historique(self, request):
        demandes = DemandeSortie.objects.filter(statut__in=['approuvée', 'rejetée']).order_by('-date_sortie')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_direct(self, request, pk=None):
        demande = self.get_object()
        demande.valide_par_direct = True
        demande.date_validation_direct = datetime.now()
        demande.statut = 'validée_direct'
        demande.save()
        return Response({'status': 'Validée par responsable direct'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_service(self, request, pk=None):
        demande = self.get_object()
        demande.valide_par_service = True
        demande.date_validation_service = datetime.now()
        demande.statut = 'approuvée'
        demande.save()
        return Response({'status': 'Approuvée par responsable service'})

class TravauxExceptionnelsViewSet(viewsets.ModelViewSet):
    """ViewSet pour travaux exceptionnels"""
    queryset = TravauxExceptionnels.objects.all()
    serializer_class = TravauxExceptionnelsSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'statut']
    ordering_fields = ['date_travail']
    ordering = ['-date_travail']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.roles.filter(nom__in=['rh', 'comptable', 'daf']).exists():
            return TravauxExceptionnels.objects.all()
        if hasattr(user, 'profil_salarie'):
            return TravauxExceptionnels.objects.filter(salarie=user.profil_salarie)
        return TravauxExceptionnels.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_demandes(self, request):
        if not hasattr(request.user, 'profil_salarie'):
            return Response({'error': 'Pas de profil salarié'}, status=status.HTTP_403_FORBIDDEN)
        demandes = TravauxExceptionnels.objects.filter(salarie=request.user.profil_salarie).order_by('-date_travail')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def a_traiter(self, request):
        demandes = TravauxExceptionnels.objects.filter(statut__in=['soumise', 'validée_direct']).order_by('-date_travail')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def historique(self, request):
        demandes = TravauxExceptionnels.objects.filter(statut__in=['approuvée', 'rejetée']).order_by('-date_travail')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_direct(self, request, pk=None):
        demande = self.get_object()
        demande.valide_par_direct = True
        demande.date_validation_direct = datetime.now()
        demande.statut = 'validée_direct'
        demande.save()
        return Response({'status': 'Validée par responsable direct'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_service(self, request, pk=None):
        demande = self.get_object()
        demande.valide_par_service = True
        demande.date_validation_service = datetime.now()
        demande.statut = 'approuvée'
        demande.save()
        return Response({'status': 'Approuvée par responsable service'})

# ============================================================================
# VIEWSETS DOCUMENTS
# ============================================================================

class DocumentSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour documents - Avec permissions de visibilité"""
    queryset = DocumentSalarie.objects.all()
    serializer_class = DocumentSalarieSerializer
    permission_classes = [IsAuthenticated, CanManageDocuments]
    filterset_fields = ['salarie', 'type_document']
    ordering_fields = ['date_upload']
    ordering = ['-date_upload']

# ============================================================================
# VIEWSETS FICHES DE POSTE
# ============================================================================

class FichePosteViewSet(viewsets.ModelViewSet):
    """ViewSet pour fiches de poste"""
    queryset = FichePoste.objects.all()
    serializer_class = FichePosteDetailSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['service', 'grade', 'statut']
    search_fields = ['titre', 'description']
    ordering_fields = ['titre', 'service']

class AmeliorationProposeeViewSet(viewsets.ModelViewSet):
    """ViewSet pour améliorations proposées"""
    queryset = AmeliorationProposee.objects.all()
    serializer_class = AmeliorationProposeeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['fiche_poste', 'salarie_proposant', 'statut']
    ordering_fields = ['date_proposition', 'priorite']
    ordering = ['-priorite', '-date_proposition']

# ============================================================================
# VIEWSETS PARAMÉTRAGE
# ============================================================================

class FicheParametresUserViewSet(viewsets.ModelViewSet):
    """ViewSet pour paramètres utilisateur"""
    queryset = FicheParametresUser.objects.all()
    serializer_class = FicheParametresUserSerializer
    permission_classes = [IsAuthenticated]

class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet lecture-seule pour rôles"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

# ============================================================================
# VIEWSET IMPORTLOG
# ============================================================================

class ImportLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour logs d'import - Lecture seule"""
    queryset = ImportLog.objects.all()
    serializer_class = ImportLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_fields = ['api_name', 'statut']
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']
