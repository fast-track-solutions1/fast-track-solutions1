# ============================================================================
# SIGNALS.PY - CRÉER USER AUTOMATIQUEMENT QUAND ON CRÉE UN SALARIE
# ============================================================================

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from .models import Salarie, FicheParametresUser

@receiver(post_save, sender=Salarie)
def create_user_for_salarie(sender, instance, created, **kwargs):
    """
    Signal: Crée automatiquement un User quand on crée un Salarie
    
    ✅ Username = matricule du salarié
    ✅ Email = email professionnel du salarié
    ✅ Password = aléatoire (à changer)
    ✅ Group = 'salarie' par défaut
    ✅ Assigne les paramètres utilisateur
    """
    if created and not instance.user:  # Si nouveau salarié ET pas de user
        try:
            # 1️⃣ CRÉER LE USER
            user = User.objects.create_user(
                username=instance.matricule,  # Unique!
                email=instance.mail_professionnel or f"{instance.matricule}@msi.tn",
                first_name=instance.prenom,
                last_name=instance.nom,
                password='TempPassword2026!'  # À CHANGER!
            )
            
            # 2️⃣ ASSIGNER LE GROUP 'salarie' PAR DÉFAUT
            try:
                salarie_group = Group.objects.get(name='salarie')
                user.groups.add(salarie_group)
                print(f"✅ {user.username} assigné au group 'salarie'")
            except Group.DoesNotExist:
                print(f"⚠️  Group 'salarie' n'existe pas! Crée-le d'abord.")
            
            # 3️⃣ LIER LE USER AU SALARIE
            instance.user = user
            instance.save(update_fields=['user'])
            
            # 4️⃣ CRÉER LES PARAMÈTRES UTILISATEUR
            FicheParametresUser.objects.get_or_create(
                user=user,
                defaults={
                    'theme': 'light',
                    'langue': 'fr',
                    'notifications_actives': True
                }
            )
            
            print(f"✅ User créé pour {instance.prenom} {instance.nom}")
            print(f"   📧 Email: {user.email}")
            print(f"   🔑 Password temporaire: TempPassword2026! (À CHANGER!)")
            
        except Exception as e:
            print(f"❌ ERREUR lors de la création du user pour {instance.matricule}: {str(e)}")


@receiver(post_save, sender=Salarie)
def update_user_for_salarie(sender, instance, created, **kwargs):
    """
    Signal: Met à jour le User quand on modifie un Salarie
    """
    if not created and instance.user:  # Si modification + user existe
        instance.user.first_name = instance.prenom
        instance.user.last_name = instance.nom
        instance.user.email = instance.mail_professionnel or instance.user.email
        instance.user.save()
        print(f"✅ User {instance.matricule} mis à jour")
