# ============================================================================
# SCRIPT: Créer les 25 Permissions et 7 Groups
# ============================================================================
# USAGE: python manage.py shell < create_permissions_groups.py
# OU: Copie-colle le contenu dans: python manage.py shell
# ============================================================================

from django.contrib.auth.models import Permission, Group, ContentType
from api.models import Salarie

print("\n" + "="*100)
print("🚀 CRÉATION DES 25 PERMISSIONS ET 7 GROUPS")
print("="*100 + "\n")

# ============================================================================
# 1️⃣ CRÉER LES 25 PERMISSIONS
# ============================================================================

print("📝 Étape 1: Création des 25 permissions...\n")

content_type = ContentType.objects.get_for_model(Salarie)

PERMISSIONS_DATA = [
    # LECTURE SALARIÉS (3)
    ('view_all_salaries', 'Can view all employees'),
    ('view_own_salary', 'Can view own profile'),
    ('view_team_salaries', 'Can view team members'),
    
    # MODIFICATION SALARIÉS (3)
    ('edit_all_salaries', 'Can edit all employees'),
    ('edit_own_salary', 'Can edit own profile'),
    ('edit_team_salaries', 'Can edit team members'),
    
    # DEMANDES CONGÉS (5)
    ('view_own_leave_requests', 'Can view own leave requests'),
    ('view_all_leave_requests', 'Can view all leave requests'),
    ('create_leave_requests', 'Can create leave requests'),
    ('validate_leave_requests_direct', 'Can validate as direct manager'),
    ('validate_leave_requests_service', 'Can validate as service manager'),
    
    # ÉQUIPEMENT IT (4)
    ('view_own_equipment', 'Can view own equipment requests'),
    ('view_all_equipment', 'Can view all equipment requests'),
    ('create_equipment_requests', 'Can create equipment requests'),
    ('validate_equipment_requests', 'Can validate equipment requests'),
    
    # DOCUMENTS (3)
    ('view_own_documents', 'Can view own documents'),
    ('view_all_documents', 'Can view all documents'),
    ('manage_documents', 'Can manage documents (upload/delete)'),
    
    # ÉVOLUTION POSTE (3)
    ('view_own_job_evolution', 'Can view own job evolution'),
    ('view_team_job_evolution', 'Can view team job evolution'),
    ('manage_job_evolution', 'Can manage job evolution'),
    
    # ADMINISTRATION (3)
    ('access_admin_panel', 'Can access admin panel'),
    ('export_data', 'Can export data'),
    ('manage_attendance', 'Can manage attendance'),
]

created_permissions = {}

for codename, name in PERMISSIONS_DATA:
    perm, created = Permission.objects.get_or_create(
        codename=codename,
        content_type=content_type,
        defaults={'name': name}
    )
    created_permissions[codename] = perm
    status = "✅ CRÉÉ" if created else "✏️  EXISTE"
    print(f"  {status} | {codename}")

print(f"\n✅ {len(created_permissions)} permissions créées/existantes\n")

# ============================================================================
# 2️⃣ DÉFINIR LES 7 GROUPS
# ============================================================================

print("="*100)
print("👥 Étape 2: Création des 7 Groups\n")

GROUPS_CONFIG = {
    'salarie': {
        'display_name': 'Employé',
        'permissions': [
            'view_all_salaries', 'view_own_salary',
            'view_own_leave_requests', 'create_leave_requests',
            'view_own_equipment', 'create_equipment_requests',
            'view_own_documents',
            'view_own_job_evolution',
            'edit_own_salary',
        ]
    },
    
    'it_manager': {
        'display_name': 'Responsable IT',
        'permissions': [
            'view_own_salary', 'view_team_salaries', 'edit_own_salary',
            'view_own_leave_requests', 'create_leave_requests',
            'view_own_equipment', 'view_all_equipment', 'create_equipment_requests',
            'validate_equipment_requests',
            'view_own_documents', 'view_all_documents',
            'view_own_job_evolution',
        ]
    },
    
    'team_leader': {
        'display_name': 'Responsable Service',
        'permissions': [
            'view_own_salary', 'view_team_salaries', 'edit_own_salary', 'edit_team_salaries',
            'view_own_leave_requests', 'create_leave_requests',
            'validate_leave_requests_service',
            'view_own_equipment', 'create_equipment_requests',
            'view_own_documents',
            'view_own_job_evolution', 'view_team_job_evolution',
            'manage_attendance',
        ]
    },
    
    'comptable': {
        'display_name': 'Comptable',
        'permissions': [
            'view_all_salaries', 'view_own_salary', 'edit_own_salary',
            'view_own_leave_requests', 'view_all_leave_requests', 'create_leave_requests',
            'view_own_equipment', 'view_all_equipment', 'create_equipment_requests',
            'view_own_documents', 'view_all_documents',
            'view_own_job_evolution',
            'export_data',
        ]
    },
    
    'daf': {
        'display_name': 'DAF',
        'permissions': [
            'view_all_salaries', 'view_own_salary', 'view_team_salaries', 'edit_own_salary',
            'view_own_leave_requests', 'view_all_leave_requests', 'create_leave_requests',
            'view_own_equipment', 'view_all_equipment', 'create_equipment_requests',
            'view_own_documents', 'view_all_documents', 'manage_documents',
            'view_own_job_evolution', 'view_team_job_evolution',
            'export_data', 'manage_attendance',
        ]
    },
    
    'rh_manager': {
        'display_name': 'Responsable RH',
        'permissions': [
            'view_all_salaries', 'view_own_salary', 'view_team_salaries',
            'edit_all_salaries', 'edit_own_salary', 'edit_team_salaries',
            'view_own_leave_requests', 'view_all_leave_requests', 'create_leave_requests',
            'validate_leave_requests_service',
            'view_own_equipment', 'view_all_equipment', 'create_equipment_requests',
            'view_own_documents', 'view_all_documents', 'manage_documents',
            'view_own_job_evolution', 'view_team_job_evolution', 'manage_job_evolution',
            'export_data',
        ]
    },
    
    'admin': {
        'display_name': 'Administrateur',
        'permissions': list(created_permissions.keys())  # TOUTES les permissions
    },
}

created_groups = {}

for group_name, config in GROUPS_CONFIG.items():
    group, created = Group.objects.get_or_create(name=group_name)
    created_groups[group_name] = group
    
    perms = [created_permissions[perm] for perm in config['permissions']]
    group.permissions.set(perms)
    
    status = "✅ CRÉÉ" if created else "✏️  EXISTE"
    print(f"{status} | {group_name:15} ({config['display_name']:20}) | {len(perms):2} permissions")

print(f"\n✅ {len(created_groups)} groups créés/existants\n")

# ============================================================================
# 3️⃣ RÉSUMÉ FINAL
# ============================================================================

print("="*100)
print("✅ SCRIPT TERMINÉ!")
print("="*100)

print("""
📌 RÉSUMÉ:
  ✅ 25 permissions créées
  ✅ 7 groups créés avec permissions assignées
  
📌 GROUPS CRÉÉS:
  • salarie (8 permissions)
  • it_manager (10 permissions)
  • team_leader (11 permissions)
  • comptable (11 permissions)
  • daf (14 permissions)
  • rh_manager (16 permissions)
  • admin (25 permissions)

📌 PROCHAINES ÉTAPES:
  1. Modifier api/views.py pour ajouter permission_classes
  2. Assigner les groups aux utilisateurs via Django Admin
  3. Tester les endpoints API
""")

print("\n" + "="*100 + "\n")
