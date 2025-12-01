# api/import_views.py - VIEWSETS D'IMPORTATION

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
import logging
import json

from .import_utils import GenericImporter, get_importable_models
from .models import ImportLog
from .serializers import ImportLogSerializer

logger = logging.getLogger(__name__)


class ImportViewSet(viewsets.ViewSet):
    """ViewSet pour gérer l'importation générique de modèles"""
    
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=['get'])
    def models(self, request):
        """
        GET /api/import/models/
        Liste tous les modèles importables avec dropdown
        """
        try:
            models = get_importable_models()
            return Response({
                'success': True,
                'models': [{'key': k, 'name': v['name']} for k, v in models.items()]
            })
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des modèles: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def structure(self, request):
        """
        GET /api/import/structure/?model=salarie
        Récupère la structure d'un modèle (champs, types, etc.)
        """
        try:
            model_name = request.query_params.get('model')
            if not model_name:
                return Response({
                    'success': False,
                    'error': 'Paramètre "model" requis'
                }, status=status.HTTP_400_BAD_REQUEST)

            importer = GenericImporter(model_name)
            structure = importer.get_model_structure()
            
            return Response({
                'success': True,
                'structure': structure
            })
        except ValueError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Erreur structure: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def template(self, request):
        """
        GET /api/import/template/?model=salarie
        Télécharge le fichier Excel template pour un modèle
        """
        try:
            model_name = request.query_params.get('model')
            if not model_name:
                return Response({
                    'success': False,
                    'error': 'Paramètre "model" requis'
                }, status=status.HTTP_400_BAD_REQUEST)

            importer = GenericImporter(model_name)
            template_bytes = importer.generate_template()

            response = HttpResponse(
                template_bytes,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="{model_name}_template.xlsx"'
            return response

        except ValueError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Erreur template: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """
        POST /api/import/upload/
        Charge et importe un fichier Excel
        
        Body: FormData avec:
        - model: nom du modèle (ex: 'salarie')
        - file: fichier Excel
        """
        try:
            model_name = request.data.get('model')
            file = request.FILES.get('file')

            if not model_name or not file:
                return Response({
                    'success': False,
                    'error': 'Paramètres "model" et "file" requis'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Créer l'importeur
            importer = GenericImporter(model_name)
            
            # Importer les données
            results = importer.import_from_excel(file)

            # Enregistrer le log d'import
            total = results['inserted'] + results['updated']
            status_log = 'succes' if not results['errors'] else ('partiel' if total > 0 else 'erreur')
            
            import_log = ImportLog.objects.create(
                api_name=model_name,
                fichier_nom=file.name,
                total_lignes=total + len(results['errors']),
                lignes_succes=results['inserted'] + results['updated'],
                lignes_erreur=len(results['errors']),
                statut=status_log,
                details_erreurs=results['errors'],
                cree_par=request.user
            )

            logger.info(f"Import {model_name} terminé: {results['inserted']} insérés, {results['updated']} mis à jour, {len(results['errors'])} erreurs")

            return Response({
                'success': True,
                'inserted': results['inserted'],
                'updated': results['updated'],
                'errors': results['errors'],
                'warnings': results['warnings'],
                'log_id': import_log.id
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Erreur upload: {str(e)}")
            return Response({
                'success': False,
                'error': f"Erreur serveur: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        GET /api/import/history/
        Récupère l'historique de tous les imports
        """
        try:
            logs = ImportLog.objects.all().order_by('-date_creation')[:50]
            serializer = ImportLogSerializer(logs, many=True)
            
            return Response({
                'success': True,
                'count': len(logs),
                'logs': serializer.data
            })
        except Exception as e:
            logger.error(f"Erreur historique: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def history_detail(self, request):
        """
        GET /api/import/history_detail/?log_id=1
        Récupère les détails complets d'un import
        """
        try:
            log_id = request.query_params.get('log_id')
            if not log_id:
                return Response({
                    'success': False,
                    'error': 'Paramètre "log_id" requis'
                }, status=status.HTTP_400_BAD_REQUEST)

            log = ImportLog.objects.get(id=log_id)
            serializer = ImportLogSerializer(log)
            
            return Response({
                'success': True,
                'log': serializer.data
            })
        except ImportLog.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Log d\'import non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Erreur détail historique: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# SERIALIZER POUR IMPORTLOG (si pas déjà dans serializers.py)
# ============================================================================

from rest_framework import serializers

class ImportLogSerializer(serializers.ModelSerializer):
    """Sérializer pour les logs d'import"""
    cree_par_username = serializers.CharField(source='cree_par.username', read_only=True)
    taux_succes = serializers.SerializerMethodField()
    
    class Meta:
        model = ImportLog
        fields = (
            'id', 'api_name', 'fichier_nom', 'total_lignes', 
            'lignes_succes', 'lignes_erreur', 'statut', 
            'taux_succes', 'details_erreurs', 'cree_par', 'cree_par_username',
            'date_creation', 'date_modification'
        )
        read_only_fields = (
            'id', 'date_creation', 'date_modification', 'taux_succes'
        )
    
    def get_taux_succes(self, obj):
        """Calcule et retourne le taux de succès en %"""
        return obj.get_taux_succes()
