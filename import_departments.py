import requests

API_BASE_URL = "http://localhost:8000/api"
DEPARTEMENT_ENDPOINT = f"{API_BASE_URL}/departements/"
SOCIETE_ID = 1

DEPARTEMENTS = [
    (1, "Ain", "Bourg-en-Bresse", "Auvergne-Rhône-Alpes"),
    (2, "Aisne", "Laon", "Hauts-de-France"),
    (3, "Allier", "Moulins", "Auvergne-Rhône-Alpes"),
    (4, "Alpes-de-Haute-Provence", "Digne-les-Bains", "Provence-Alpes-Côte d'Azur"),
    (5, "Hautes-Alpes", "Gap", "Provence-Alpes-Côte d'Azur"),
    (6, "Alpes-Maritimes", "Nice", "Provence-Alpes-Côte d'Azur"),
    (7, "Ardèche", "Privas", "Auvergne-Rhône-Alpes"),
    (8, "Ardennes", "Charleville-Mézières", "Grand Est"),
    (9, "Ariège", "Foix", "Occitanie"),
    (10, "Aube", "Troyes", "Grand Est"),
    (11, "Aude", "Carcassonne", "Occitanie"),
    (12, "Aveyron", "Rodez", "Occitanie"),
    (13, "Bouches-du-Rhône", "Marseille", "Provence-Alpes-Côte d'Azur"),
    (14, "Calvados", "Caen", "Normandie"),
    (15, "Cantal", "Aurillac", "Auvergne-Rhône-Alpes"),
    (16, "Charente", "Angoulême", "Nouvelle-Aquitaine"),
    (17, "Charente-Maritime", "La Rochelle", "Nouvelle-Aquitaine"),
    (18, "Cher", "Bourges", "Centre-Val de Loire"),
    (19, "Corrèze", "Tulle", "Nouvelle-Aquitaine"),
    (21, "Côte-d'Or", "Dijon", "Bourgogne-Franche-Comté"),
    (22, "Côtes-d'Armor", "Saint-Brieuc", "Bretagne"),
    (23, "Creuse", "Guéret", "Nouvelle-Aquitaine"),
    (24, "Dordogne", "Périgueux", "Nouvelle-Aquitaine"),
    (25, "Doubs", "Besançon", "Bourgogne-Franche-Comté"),
    (26, "Drôme", "Valence", "Auvergne-Rhône-Alpes"),
    (27, "Eure", "Évreux", "Normandie"),
    (28, "Eure-et-Loir", "Chartres", "Centre-Val de Loire"),
    (29, "Finistère", "Quimper", "Bretagne"),
    (20, "Haute-Corse", "Bastia", "Corse"),
    (2, "Corse-du-Sud", "Ajaccio", "Corse"),
    (30, "Gard", "Nîmes", "Occitanie"),
    (31, "Haute-Garonne", "Toulouse", "Occitanie"),
    (32, "Gers", "Auch", "Occitanie"),
    (33, "Gironde", "Bordeaux", "Nouvelle-Aquitaine"),
    (34, "Hérault", "Montpellier", "Occitanie"),
    (35, "Ille-et-Vilaine", "Rennes", "Bretagne"),
    (36, "Indre", "Châteauroux", "Centre-Val de Loire"),
    (37, "Indre-et-Loire", "Tours", "Centre-Val de Loire"),
    (38, "Isère", "Grenoble", "Auvergne-Rhône-Alpes"),
    (39, "Jura", "Lons-le-Saunier", "Bourgogne-Franche-Comté"),
    (40, "Landes", "Mont-de-Marsan", "Nouvelle-Aquitaine"),
    (41, "Loir-et-Cher", "Blois", "Centre-Val de Loire"),
    (42, "Loire", "Saint-Étienne", "Auvergne-Rhône-Alpes"),
    (43, "Haute-Loire", "Le Puy-en-Velay", "Auvergne-Rhône-Alpes"),
    (44, "Loire-Atlantique", "Nantes", "Pays de la Loire"),
    (45, "Loiret", "Orléans", "Centre-Val de Loire"),
    (46, "Lot", "Cahors", "Occitanie"),
    (47, "Lot-et-Garonne", "Agen", "Nouvelle-Aquitaine"),
    (48, "Lozère", "Mende", "Occitanie"),
    (49, "Maine-et-Loire", "Angers", "Pays de la Loire"),
    (50, "Manche", "Saint-Lô", "Normandie"),
    (51, "Marne", "Châlons-en-Champagne", "Grand Est"),
    (52, "Haute-Marne", "Chaumont", "Grand Est"),
    (53, "Mayenne", "Laval", "Pays de la Loire"),
    (54, "Meurthe-et-Moselle", "Nancy", "Grand Est"),
    (55, "Meuse", "Bar-le-Duc", "Grand Est"),
    (56, "Morbihan", "Vannes", "Bretagne"),
    (57, "Moselle", "Metz", "Grand Est"),
    (58, "Nièvre", "Nevers", "Bourgogne-Franche-Comté"),
    (59, "Nord", "Lille", "Hauts-de-France"),
    (60, "Oise", "Beauvais", "Hauts-de-France"),
    (61, "Orne", "Alençon", "Normandie"),
    (62, "Pas-de-Calais", "Arras", "Hauts-de-France"),
    (63, "Puy-de-Dôme", "Clermont-Ferrand", "Auvergne-Rhône-Alpes"),
    (64, "Pyrénées-Atlantiques", "Pau", "Nouvelle-Aquitaine"),
    (65, "Hautes-Pyrénées", "Tarbes", "Occitanie"),
    (66, "Pyrénées-Orientales", "Perpignan", "Occitanie"),
    (67, "Bas-Rhin", "Strasbourg", "Grand Est"),
    (68, "Haut-Rhin", "Colmar", "Grand Est"),
    (69, "Rhône", "Lyon", "Auvergne-Rhône-Alpes"),
    (70, "Haute-Saône", "Vesoul", "Bourgogne-Franche-Comté"),
    (71, "Saône-et-Loire", "Mâcon", "Bourgogne-Franche-Comté"),
    (72, "Sarthe", "Le Mans", "Pays de la Loire"),
    (73, "Savoie", "Chambéry", "Auvergne-Rhône-Alpes"),
    (74, "Haute-Savoie", "Annecy", "Auvergne-Rhône-Alpes"),
    (75, "Paris", "Paris", "Île-de-France"),
    (76, "Seine-Maritime", "Rouen", "Normandie"),
    (77, "Seine-et-Marne", "Melun", "Île-de-France"),
    (78, "Yvelines", "Versailles", "Île-de-France"),
    (79, "Deux-Sèvres", "Niort", "Nouvelle-Aquitaine"),
    (80, "Somme", "Amiens", "Hauts-de-France"),
    (81, "Tarn", "Albi", "Occitanie"),
    (82, "Tarn-et-Garonne", "Montauban", "Occitanie"),
    (83, "Var", "Toulon", "Provence-Alpes-Côte d'Azur"),
    (84, "Vaucluse", "Avignon", "Provence-Alpes-Côte d'Azur"),
    (85, "Vendée", "La Roche-sur-Yon", "Pays de la Loire"),
    (86, "Vienne", "Poitiers", "Nouvelle-Aquitaine"),
    (87, "Haute-Vienne", "Limoges", "Nouvelle-Aquitaine"),
    (88, "Vosges", "Épinal", "Grand Est"),
    (89, "Yonne", "Auxerre", "Bourgogne-Franche-Comté"),
    (90, "Territoire de Belfort", "Belfort", "Bourgogne-Franche-Comté"),
    (91, "Essonne", "Évry", "Île-de-France"),
    (92, "Hauts-de-Seine", "Nanterre", "Île-de-France"),
    (93, "Seine-Saint-Denis", "Bobigny", "Île-de-France"),
    (94, "Val-de-Marne", "Créteil", "Île-de-France"),
    (95, "Val-d'Oise", "Pontoise", "Île-de-France"),
    (971, "Guadeloupe", "Basse-Terre", "Guadeloupe"),
    (972, "Martinique", "Fort-de-France", "Martinique"),
    (973, "Guyane", "Cayenne", "Guyane"),
    (974, "Réunion", "Saint-Denis", "Réunion"),
    (976, "Mayotte", "Mamoudzou", "Mayotte"),
]

def import_departements():
    print(f"🚀 Début de l'import de {len(DEPARTEMENTS)} départements...")
    print(f"📍 API: {DEPARTEMENT_ENDPOINT}")
    print(f"🏢 Société ID: {SOCIETE_ID}\n")
    success_count = 0
    error_count = 0
    for numero, nom, prefecture, region in DEPARTEMENTS:
        try:
            payload = {
                "numero": numero,
                "nom": nom,
                "prefecture": prefecture,
                "region": region,
                "actif": True,
                "nombre_circuits": 0,
                "date_activation": None,
                "societe": SOCIETE_ID,
            }
            response = requests.post(DEPARTEMENT_ENDPOINT, json=payload, timeout=10)
            if response.status_code == 201:
                print(f"✅ [{numero:3d}] {nom:30s} - OK")
                success_count += 1
            else:
                print(f"❌ [{numero:3d}] {nom:30s} - HTTP {response.status_code} {response.text}")
                error_count += 1
        except Exception as e:
            print(f"❌ [{numero:3d}] {nom:30s} - Erreur: {str(e)}")
            error_count += 1
    print(f"\n✅ Réussis: {success_count}")
    print(f"❌ Échoués: {error_count}")
    print(f"✨ Import terminé !")

if __name__ == "__main__":
    import_departements()
