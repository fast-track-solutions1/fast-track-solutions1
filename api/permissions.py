"""
Django REST Framework Permissions
Système d'autorisation basé sur les groups et permissions
"""

from rest_framework.permissions import BasePermission
from django.contrib.auth.models import Permission


class IsAuthenticated(BasePermission):
    """
    Vérifie que l'utilisateur est authentifié
    """
    message = "Authentification requise."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdmin(BasePermission):
    """
    Vérifie que l'utilisateur est admin ou staff
    """
    message = "Accès administrateur requis."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


# ============================================================================
# PERMISSIONS POUR LES SALAIRES
# ============================================================================

class CanViewAllSalaries(BasePermission):
    """
    Permission: view_all_salaries
    Permet de voir les salaires de tous les employés
    """
    message = "Vous n'avez pas la permission de voir tous les salaires."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_all_salaries')


class CanViewOwnSalary(BasePermission):
    """
    Permission: view_own_salary
    Permet de voir son propre salaire
    """
    message = "Vous n'avez pas la permission de voir votre salaire."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_own_salary')


class CanViewTeamSalaries(BasePermission):
    """
    Permission: view_team_salaries
    Permet de voir les salaires de son équipe
    """
    message = "Vous n'avez pas la permission de voir les salaires de l'équipe."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_team_salaries')


class CanEditAllSalaries(BasePermission):
    """
    Permission: edit_all_salaries
    Permet de modifier les salaires de tous les employés
    """
    message = "Vous n'avez pas la permission de modifier tous les salaires."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.edit_all_salaries')


class CanEditOwnSalary(BasePermission):
    """
    Permission: edit_own_salary
    Permet de modifier son propre salaire
    """
    message = "Vous n'avez pas la permission de modifier votre salaire."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.edit_own_salary')


class CanEditTeamSalaries(BasePermission):
    """
    Permission: edit_team_salaries
    Permet de modifier les salaires de son équipe
    """
    message = "Vous n'avez pas la permission de modifier les salaires de l'équipe."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.edit_team_salaries')


# ============================================================================
# PERMISSIONS POUR LES CONGÉS
# ============================================================================

class CanViewOwnLeaveRequests(BasePermission):
    """
    Permission: view_own_leave_requests
    Permet de voir ses propres demandes de congé
    """
    message = "Vous n'avez pas la permission de voir vos demandes de congé."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_own_leave_requests')


class CanViewAllLeaveRequests(BasePermission):
    """
    Permission: view_all_leave_requests
    Permet de voir toutes les demandes de congé
    """
    message = "Vous n'avez pas la permission de voir toutes les demandes de congé."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_all_leave_requests')


class CanCreateLeaveRequests(BasePermission):
    """
    Permission: create_leave_requests
    Permet de créer des demandes de congé
    """
    message = "Vous n'avez pas la permission de créer des demandes de congé."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.create_leave_requests')


class CanValidateLeaveRequestsDirect(BasePermission):
    """
    Permission: validate_leave_requests_direct
    Permet de valider les demandes de congé en tant que manager direct
    """
    message = "Vous n'avez pas la permission de valider les demandes de congé (manager direct)."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.validate_leave_requests_direct')


class CanValidateLeaveRequestsService(BasePermission):
    """
    Permission: validate_leave_requests_service
    Permet de valider les demandes de congé en tant que manager service
    """
    message = "Vous n'avez pas la permission de valider les demandes de congé (manager service)."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.validate_leave_requests_service')


# ============================================================================
# PERMISSIONS POUR L'ÉQUIPEMENT
# ============================================================================

class CanViewOwnEquipment(BasePermission):
    """
    Permission: view_own_equipment
    Permet de voir ses propres demandes d'équipement
    """
    message = "Vous n'avez pas la permission de voir vos demandes d'équipement."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_own_equipment')


class CanViewAllEquipment(BasePermission):
    """
    Permission: view_all_equipment
    Permet de voir toutes les demandes d'équipement
    """
    message = "Vous n'avez pas la permission de voir toutes les demandes d'équipement."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_all_equipment')


class CanCreateEquipmentRequests(BasePermission):
    """
    Permission: create_equipment_requests
    Permet de créer des demandes d'équipement
    """
    message = "Vous n'avez pas la permission de créer des demandes d'équipement."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.create_equipment_requests')


class CanValidateEquipmentRequests(BasePermission):
    """
    Permission: validate_equipment_requests
    Permet de valider les demandes d'équipement
    """
    message = "Vous n'avez pas la permission de valider les demandes d'équipement."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.validate_equipment_requests')


# ============================================================================
# PERMISSIONS POUR LES DOCUMENTS
# ============================================================================

class CanViewOwnDocuments(BasePermission):
    """
    Permission: view_own_documents
    Permet de voir ses propres documents
    """
    message = "Vous n'avez pas la permission de voir vos documents."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_own_documents')


class CanViewAllDocuments(BasePermission):
    """
    Permission: view_all_documents
    Permet de voir tous les documents
    """
    message = "Vous n'avez pas la permission de voir tous les documents."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_all_documents')


class CanManageDocuments(BasePermission):
    """
    Permission: manage_documents
    Permet de gérer les documents (upload/delete)
    """
    message = "Vous n'avez pas la permission de gérer les documents."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.manage_documents')


# ============================================================================
# PERMISSIONS POUR L'ÉVOLUTION PROFESSIONNELLE
# ============================================================================

class CanViewOwnJobEvolution(BasePermission):
    """
    Permission: view_own_job_evolution
    Permet de voir sa propre évolution professionnelle
    """
    message = "Vous n'avez pas la permission de voir votre évolution professionnelle."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_own_job_evolution')


class CanViewTeamJobEvolution(BasePermission):
    """
    Permission: view_team_job_evolution
    Permet de voir l'évolution professionnelle de son équipe
    """
    message = "Vous n'avez pas la permission de voir l'évolution professionnelle de l'équipe."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.view_team_job_evolution')


class CanManageJobEvolution(BasePermission):
    """
    Permission: manage_job_evolution
    Permet de gérer l'évolution professionnelle
    """
    message = "Vous n'avez pas la permission de gérer l'évolution professionnelle."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.manage_job_evolution')


# ============================================================================
# PERMISSIONS ADMINISTRATIVES
# ============================================================================

class CanAccessAdminPanel(BasePermission):
    """
    Permission: access_admin_panel
    Permet d'accéder au panneau d'administration
    """
    message = "Vous n'avez pas la permission d'accéder au panneau d'administration."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.access_admin_panel')


class CanExportData(BasePermission):
    """
    Permission: export_data
    Permet d'exporter les données
    """
    message = "Vous n'avez pas la permission d'exporter les données."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.export_data')


class CanManageAttendance(BasePermission):
    """
    Permission: manage_attendance
    Permet de gérer la présence
    """
    message = "Vous n'avez pas la permission de gérer la présence."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('api.manage_attendance')


# ============================================================================
# GROUPES DE PERMISSIONS (pour utilisation facile)
# ============================================================================

SALARY_PERMISSIONS = [
    CanViewAllSalaries,
    CanViewOwnSalary,
    CanViewTeamSalaries,
    CanEditAllSalaries,
    CanEditOwnSalary,
    CanEditTeamSalaries,
]

LEAVE_PERMISSIONS = [
    CanViewOwnLeaveRequests,
    CanViewAllLeaveRequests,
    CanCreateLeaveRequests,
    CanValidateLeaveRequestsDirect,
    CanValidateLeaveRequestsService,
]

EQUIPMENT_PERMISSIONS = [
    CanViewOwnEquipment,
    CanViewAllEquipment,
    CanCreateEquipmentRequests,
    CanValidateEquipmentRequests,
]

DOCUMENT_PERMISSIONS = [
    CanViewOwnDocuments,
    CanViewAllDocuments,
    CanManageDocuments,
]

JOB_EVOLUTION_PERMISSIONS = [
    CanViewOwnJobEvolution,
    CanViewTeamJobEvolution,
    CanManageJobEvolution,
]

ADMIN_PERMISSIONS = [
    CanAccessAdminPanel,
    CanExportData,
    CanManageAttendance,
]
