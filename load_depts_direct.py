#!/usr/bin/env python
import os
import sys
import django

# Ajoute le chemin du projet
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure Django directement
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'msi_backend.settings')

# Patch PostgreSQL encoding issue before Django loads
import psycopg2
psycopg2.extensions.register_type(psycopg2.extensions.UNICODE)

try:
    django.setup()
except Exception as e:
    print(f"❌ Erreur Django: {e}")
    print("💡 Essaie de changer DB_HOST=localhost dans .env")
    exit(1)

from api.models import Departement, Societe

# Récupère la société MSI (ID=2)
try:
    societe = Societe.objects.get(id=2)
    print(f"✅ Société trouvée: {societe.nom}\n")
except Societe.DoesNotExist:
    print("❌ Société MSI (ID=2) non trouvée!")
    exit(1)

# Liste des 96 départements
DEPARTMENTS = [
    (1, "Ain", "Auvergne-Rhône-Alpes"),
    (2, "Aisne", "Hauts-de-France"),
    (3, "Allier", "Auvergne-Rhône-Alpes"),
    (4, "Alpes-de-Haute-Provence", "Provence-Alpes-Côte d'Azur"),
    (5, "Hautes-Alpes", "Provence-Alpes-Côte d'Azur"),
    (6, "Alpes-Maritimes", "Provence-Alpes-Côte d'Azur"),
    (7, "Ardèche", "Auvergne-Rhône-Alpes"),
    (8, "Ardennes", "Grand Est"),
    (9, "Ariège", "Occitanie"),
    (10, "Aube", "Grand Est"),
    (11, "Aude", "Occitanie"),
    (12, "Aveyron", "Occitanie"),
    (13, "Bouches-du-Rhône", "Provence-Alpes-Côte d'Azur"),
    (14, "Calvados", "Normandie"),
    (15, "Cantal", "Auvergne-Rhône-Alpes"),
    (16, "Charente", "Nouvelle-Aquitaine"),
    (17, "Charente-Maritime", "Nouvelle-Aquitaine"),
    (18, "Cher", "Centre-Val de Loire"),
    (19, "Corrèze", "Nouvelle-Aquitaine"),
    (21, "Côte-d'Or", "Bourgogne-Franche-Comté"),
    (22, "Côtes-d'Armor", "Bretagne"),
    (23, "Creuse", "Nouvelle-Aquitaine"),
    (24, "Dordogne", "Nouvelle-Aquitaine"),
    (25, "Doubs", "Bourgogne-Franche-Comté"),
    (26, "Drôme", "Auvergne-Rhône-Alpes"),
    (27, "Eure", "Normandie"),
    (28, "Eure-et-Loir", "Centre-Val de Loire"),
    (29, "Finistère", "Bretagne"),
    (20, "Haute-Corse", "Corse"),
    (201, "Corse-du-Sud", "Corse"),
    (30, "Gard", "Occitanie"),
    (31, "Haute-Garonne", "Occitanie"),
    (32, "Gers", "Occitanie"),
    (33, "Gironde", "Nouvelle-Aquitaine"),
    (34, "Hérault", "Occitanie"),
    (35, "Ille-et-Vilaine", "Bretagne"),
    (36, "Indre", "Centre-Val de Loire"),
    (37, "Indre-et-Loire", "Centre-Val de Loire"),
    (38, "Isère", "Auvergne-Rhône-Alpes"),
    (39, "Jura", "Bourgogne-Franche-Comté"),
    (40, "Landes", "Nouvelle-Aquitaine"),
    (41, "Loir-et-Cher", "Centre-Val de Loire"),
    (42, "Loire", "Auvergne-Rhône-Alpes"),
    (43, "Haute-Loire", "Auvergne-Rhône-Alpes"),
    (44, "Loire-Atlantique", "Pays de la Loire"),
    (45, "Loiret", "Centre-Val de Loire"),
    (46, "Lot", "Occitanie"),
    (47, "Lot-et-Garonne", "Nouvelle-Aquitaine"),
    (48, "Lozère", "Occitanie"),
    (49, "Maine-et-Loire", "Pays de la Loire"),
    (50, "Manche", "Normandie"),
    (51, "Marne", "Grand Est"),
    (52, "Haute-Marne", "Grand Est"),
    (53, "Mayenne", "Pays de la Loire"),
    (54, "Meurthe-et-Moselle", "Grand Est"),
    (55, "Meuse", "Grand Est"),
    (56, "Morbihan", "Bretagne"),
    (57, "Moselle", "Grand Est"),
    (58, "Nièvre", "Bourgogne-Franche-Comté"),
    (59, "Nord", "Hauts-de-France"),
    (60, "Oise", "Hauts-de-France"),
    (61, "Orne", "Normandie"),
    (62, "Pas-de-Calais", "Hauts-de-France"),
    (63, "Puy-de-Dôme", "Auvergne-Rhône-Alpes"),
    (64, "Pyrénées-Atlantiques", "Nouvelle-Aquitaine"),
    (65, "Hautes-Pyrénées", "Occitanie"),
    (66, "Pyrénées-Orientales", "Occitanie"),
    (67, "Bas-Rhin", "Grand Est"),
    (68, "Haut-Rhin", "Grand Est"),
    (69, "Rhône", "Auvergne-Rhône-Alpes"),
    (70, "Haute-Saône", "Bourgogne-Franche-Comté"),
    (71, "Saône-et-Loire", "Bourgogne-Franche-Comté"),
    (72, "Sarthe", "Pays de la Loire"),
    (73, "Savoie", "Auvergne-Rhône-Alpes"),
    (74, "Haute-Savoie", "Auvergne-Rhône-Alpes"),
    (75, "Paris", "Île-de-France"),
    (76, "Seine-Maritime", "Normandie"),
    (77, "Seine-et-Marne", "Île-de-France"),
    (78, "Yvelines", "Île-de-France"),
    (79, "Deux-Sèvres", "Nouvelle-Aquitaine"),
    (80, "Somme", "Hauts-de-France"),
    (81, "Tarn", "Occitanie"),
    (82, "Tarn-et-Garonne", "Occitanie"),
    (83, "Var", "Provence-Alpes-Côte d'Azur"),
    (84, "Vaucluse", "Provence-Alpes-Côte d'Azur"),
    (85, "Vendée", "Pays de la Loire"),
    (86, "Vienne", "Nouvelle-Aquitaine"),
    (87, "Haute-Vienne", "Nouvelle-Aquitaine"),
    (88, "Vosges", "Grand Est"),
    (89, "Yonne", "Bourgogne-Franche-Comté"),
    (90, "Territoire de Belfort", "Bourgogne-Franche-Comté"),
    (91, "Essonne", "Île-de-France"),
    (92, "Hauts-de-Seine", "Île-de-France"),
    (93, "Seine-Saint-Denis", "Île-de-France"),
    (94, "Val-de-Marne", "Île-de-France"),
    (95, "Val-d'Oise", "Île-de-France"),
    (971, "Guadeloupe", "Guadeloupe"),
    (972, "Martinique", "Martinique"),
    (973, "Guyane", "Guyane"),
    (974, "Réunion", "Réunion"),
    (976, "Mayotte", "Mayotte"),
]

print(f"⏳ Importation de {len(DEPARTMENTS)} départements...\n")

count_created = 0
count_updated = 0
count_error = 0

for numero, nom, region in DEPARTMENTS:
    try:
        dept, created = Departement.objects.update_or_create(
            numero=numero,
            defaults={
                'nom': nom,
                'region': region,
                'societe': societe,
            }
        )
        
        if created:
            print(f"✅ CRÉÉ    [{numero:3d}] {nom:30s} - {region}")
            count_created += 1
        else:
            print(f"⚠️  MODIFIÉ [{numero:3d}] {nom:30s} - {region}")
            count_updated += 1
    
    except Exception as e:
        print(f"❌ ERREUR  [{numero:3d}] {nom:30s} - {str(e)}")
        count_error += 1

print(f"\n{'='*70}")
print(f"✅ Créés:     {count_created}")
print(f"⚠️  Modifiés:  {count_updated}")
print(f"❌ Erreurs:   {count_error}")
print(f"✨ Import terminé ! Total: {count_created + count_updated + count_error}")
print(f"{'='*70}\n")
