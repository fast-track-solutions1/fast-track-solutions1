from django.core.management.base import BaseCommand
from api.models import Departement, Societe

class Command(BaseCommand):
    help = "Importe tous les 101 departements francais"

    DEPARTEMENTS = [
        (1, "Ain", "Bourg-en-Bresse", "Auvergne-Rhone-Alpes"),
        (2, "Aisne", "Laon", "Hauts-de-France"),
        (3, "Allier", "Moulins", "Auvergne-Rhone-Alpes"),
        (4, "Alpes-de-Haute-Provence", "Digne-les-Bains", "Provence-Alpes-Cote d'Azur"),
        (5, "Hautes-Alpes", "Gap", "Provence-Alpes-Cote d'Azur"),
        (6, "Alpes-Maritimes", "Nice", "Provence-Alpes-Cote d'Azur"),
        (7, "Ardèche", "Privas", "Auvergne-Rhone-Alpes"),
        (8, "Ardennes", "Charleville-Mezieres", "Grand Est"),
        (9, "Ariège", "Foix", "Occitanie"),
        (10, "Aube", "Troyes", "Grand Est"),
        (11, "Aude", "Carcassonne", "Occitanie"),
        (12, "Aveyron", "Rodez", "Occitanie"),
        (13, "Bouches-du-Rhone", "Marseille", "Provence-Alpes-Cote d'Azur"),
        (14, "Calvados", "Caen", "Normandie"),
        (15, "Cantal", "Aurillac", "Auvergne-Rhone-Alpes"),
        (16, "Charente", "Angouleme", "Nouvelle-Aquitaine"),
        (17, "Charente-Maritime", "La Rochelle", "Nouvelle-Aquitaine"),
        (18, "Cher", "Bourges", "Centre-Val de Loire"),
        (19, "Corrèze", "Tulle", "Nouvelle-Aquitaine"),
        (20, "Haute-Corse", "Bastia", "Corse"),
        (21, "Cote-d'Or", "Dijon", "Bourgogne-Franche-Comte"),
        (22, "Cotes-d'Armor", "Saint-Brieuc", "Bretagne"),
        (23, "Creuse", "Gueret", "Nouvelle-Aquitaine"),
        (24, "Dordogne", "Perigueux", "Nouvelle-Aquitaine"),
        (25, "Doubs", "Besancon", "Bourgogne-Franche-Comte"),
        (26, "Drome", "Valence", "Auvergne-Rhone-Alpes"),
        (27, "Eure", "Evreux", "Normandie"),
        (28, "Eure-et-Loir", "Chartres", "Centre-Val de Loire"),
        (29, "Finistère", "Quimper", "Bretagne"),
        (2, "Corse-du-Sud", "Ajaccio", "Corse"),
        (30, "Gard", "Nimes", "Occitanie"),
        (31, "Haute-Garonne", "Toulouse", "Occitanie"),
        (32, "Gers", "Auch", "Occitanie"),
        (33, "Gironde", "Bordeaux", "Nouvelle-Aquitaine"),
        (34, "Herault", "Montpellier", "Occitanie"),
        (35, "Ille-et-Vilaine", "Rennes", "Bretagne"),
        (36, "Indre", "Chateauroux", "Centre-Val de Loire"),
        (37, "Indre-et-Loire", "Tours", "Centre-Val de Loire"),
        (38, "Isère", "Grenoble", "Auvergne-Rhone-Alpes"),
        (39, "Jura", "Lons-le-Saunier", "Bourgogne-Franche-Comte"),
        (40, "Landes", "Mont-de-Marsan", "Nouvelle-Aquitaine"),
        (41, "Loir-et-Cher", "Blois", "Centre-Val de Loire"),
        (42, "Loire", "Saint-Etienne", "Auvergne-Rhone-Alpes"),
        (43, "Haute-Loire", "Le Puy-en-Velay", "Auvergne-Rhone-Alpes"),
        (44, "Loire-Atlantique", "Nantes", "Pays de la Loire"),
        (45, "Loiret", "Orleans", "Centre-Val de Loire"),
        (46, "Lot", "Cahors", "Occitanie"),
        (47, "Lot-et-Garonne", "Agen", "Nouvelle-Aquitaine"),
        (48, "Lozère", "Mende", "Occitanie"),
        (49, "Maine-et-Loire", "Angers", "Pays de la Loire"),
        (50, "Manche", "Saint-Lo", "Normandie"),
        (51, "Marne", "Chalons-en-Champagne", "Grand Est"),
        (52, "Haute-Marne", "Chaumont", "Grand Est"),
        (53, "Mayenne", "Laval", "Pays de la Loire"),
        (54, "Meurthe-et-Moselle", "Nancy", "Grand Est"),
        (55, "Meuse", "Bar-le-Duc", "Grand Est"),
        (56, "Morbihan", "Vannes", "Bretagne"),
        (57, "Moselle", "Metz", "Grand Est"),
        (58, "Nièvre", "Nevers", "Bourgogne-Franche-Comte"),
        (59, "Nord", "Lille", "Hauts-de-France"),
        (60, "Oise", "Beauvais", "Hauts-de-France"),
        (61, "Orne", "Alencon", "Normandie"),
        (62, "Pas-de-Calais", "Arras", "Hauts-de-France"),
        (63, "Puy-de-Dome", "Clermont-Ferrand", "Auvergne-Rhone-Alpes"),
        (64, "Pyrenees-Atlantiques", "Pau", "Nouvelle-Aquitaine"),
        (65, "Hautes-Pyrenees", "Tarbes", "Occitanie"),
        (66, "Pyrenees-Orientales", "Perpignan", "Occitanie"),
        (67, "Bas-Rhin", "Strasbourg", "Grand Est"),
        (68, "Haut-Rhin", "Colmar", "Grand Est"),
        (69, "Rhone", "Lyon", "Auvergne-Rhone-Alpes"),
        (70, "Haute-Saone", "Vesoul", "Bourgogne-Franche-Comte"),
        (71, "Saone-et-Loire", "Macon", "Bourgogne-Franche-Comte"),
        (72, "Sarthe", "Le Mans", "Pays de la Loire"),
        (73, "Savoie", "Chambery", "Auvergne-Rhone-Alpes"),
        (74, "Haute-Savoie", "Annecy", "Auvergne-Rhone-Alpes"),
        (75, "Paris", "Paris", "Ile-de-France"),
        (76, "Seine-Maritime", "Rouen", "Normandie"),
        (77, "Seine-et-Marne", "Melun", "Ile-de-France"),
        (78, "Yvelines", "Versailles", "Ile-de-France"),
        (79, "Deux-Sèvres", "Niort", "Nouvelle-Aquitaine"),
        (80, "Somme", "Amiens", "Hauts-de-France"),
        (81, "Tarn", "Albi", "Occitanie"),
        (82, "Tarn-et-Garonne", "Montauban", "Occitanie"),
        (83, "Var", "Toulon", "Provence-Alpes-Cote d'Azur"),
        (84, "Vaucluse", "Avignon", "Provence-Alpes-Cote d'Azur"),
        (85, "Vendee", "La Roche-sur-Yon", "Pays de la Loire"),
        (86, "Vienne", "Poitiers", "Nouvelle-Aquitaine"),
        (87, "Haute-Vienne", "Limoges", "Nouvelle-Aquitaine"),
        (88, "Vosges", "Epinal", "Grand Est"),
        (89, "Yonne", "Auxerre", "Bourgogne-Franche-Comte"),
        (90, "Territoire de Belfort", "Belfort", "Bourgogne-Franche-Comte"),
        (91, "Essonne", "Evry", "Ile-de-France"),
        (92, "Hauts-de-Seine", "Nanterre", "Ile-de-France"),
        (93, "Seine-Saint-Denis", "Bobigny", "Ile-de-France"),
        (94, "Val-de-Marne", "Creteil", "Ile-de-France"),
        (95, "Val-d'Oise", "Pontoise", "Ile-de-France"),
        (971, "Guadeloupe", "Basse-Terre", "Guadeloupe"),
        (972, "Martinique", "Fort-de-France", "Martinique"),
        (973, "Guyane", "Cayenne", "Guyane"),
        (974, "Reunion", "Saint-Denis", "Reunion"),
        (976, "Mayotte", "Mamoudzou", "Mayotte"),
    ]

    def handle(self, *args, **options):
        try:
            societe = Societe.objects.get(id=1)
        except Societe.DoesNotExist:
            self.stdout.write(self.style.ERROR("Societe MSI non trouvee"))
            return

        inserted = 0
        skipped = 0

        self.stdout.write(self.style.SUCCESS(f"Import de {len(self.DEPARTEMENTS)} departements..."))

        for numero, nom, prefecture, region in self.DEPARTEMENTS:
            try:
                obj, created = Departement.objects.get_or_create(
                    numero=numero,
                    societe=societe,
                    defaults={
                        "nom": nom,
                        "region": region,
                        "prefecture": prefecture,
                        "actif": True,
                        "nombre_circuits": 0,
                    }
                )
                if created:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Erreur: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f"Importes: {inserted}, Deja presents: {skipped}"))