# api/utils.py - NOUVEAU FICHIER À CRÉER
from collections import OrderedDict
import pandas as pd
from datetime import time

# Import tous tes modèles
from .models import (
    Societe, Departement, Circuit, Service, Grade,
    CreneauTravail, Equipement, Salarie,
    TypeAcces, OutilTravail, TypeApplicationAcces
)

# ============================================================================
# CONFIGURATION DES APIs IMPORTABLES
# ============================================================================

IMPORT_CONFIG = OrderedDict({
"departement": {
    "label": "Département",
    "model": Departement,
    "fields": [
        "numero", "nom", "region", "chef_lieu", "societe",
        "nombre_circuits", "actif",
    ],
    "required": ["numero", "nom", "societe"],
    "field_types": {
        "numero": "string",
        "nom": "string",
        "region": "string",
        "chef_lieu": "string",
        "nombre_circuits": "integer",
        "actif": "boolean",
    },

    },
    
    "circuit": {
        "label": "Circuit",
        "model": Circuit,
        "fields": [
            "nom", "departement", "description", "actif",
        ],
        "required": ["nom", "departement"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {
            "departement": Departement,
        },
        "fk_lookup": {
            "departement": "numero",
        },
    },
    
    "service": {
        "label": "Service",
        "model": Service,
        "fields": [
            "nom", "societe", "description", "responsable", "actif",
        ],
        "required": ["nom", "societe"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {
            "societe": Societe,
            "responsable": Salarie,
        },
        "fk_lookup": {
            "societe": "nom",
            "responsable": "matricule",
        },
    },
    
    "grade": {
        "label": "Grade",
        "model": Grade,
        "fields": ["nom", "societe", "ordre", "actif"],
        "required": ["nom", "societe"],
        "field_types": {
            "nom": "string",
            "ordre": "integer",
            "actif": "boolean",
        },
        "fk_fields": {
            "societe": Societe,
        },
        "fk_lookup": {
            "societe": "nom",
        },
    },
    
    "creneau_travail": {
        "label": "Créneau de travail",
        "model": CreneauTravail,
        "fields": [
            "nom", "societe",
            "heure_debut", "heure_fin",
            "heure_pause_debut", "heure_pause_fin",
            "description", "actif",
        ],
        "required": ["nom", "societe", "heure_debut", "heure_fin"],
        "field_types": {
            "nom": "string",
            "heure_debut": "time",
            "heure_fin": "time",
            "heure_pause_debut": "time",
            "heure_pause_fin": "time",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {
            "societe": Societe,
        },
        "fk_lookup": {
            "societe": "nom",
        },
    },
    
    "equipement": {
        "label": "Équipement",
        "model": Equipement,
        "fields": [
            "nom", "type_equipement",
            "description", "stock_total",
            "stock_disponible", "actif",
        ],
        "required": ["nom", "type_equipement"],
        "field_types": {
            "nom": "string",
            "type_equipement": "choice",
            "description": "string",
            "stock_total": "integer",
            "stock_disponible": "integer",
            "actif": "boolean",
        },
        "fk_fields": {},
        "fk_lookup": {},
        "choices": {
            "type_equipement": [
                "casque", "pc", "laptop", "souris", "telephone", 
                "carte_sim", "ecran", "clavier", "docking", "autre"
            ],
        },
    },
    
    "type_acces": {
        "label": "Type d'accès",
        "model": TypeAcces,
        "fields": ["nom", "description", "actif"],
        "required": ["nom"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {},
        "fk_lookup": {},
    },
    
    "outil_travail": {
        "label": "Outil de travail",
        "model": OutilTravail,
        "fields": ["nom", "description", "actif"],
        "required": ["nom"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {},
        "fk_lookup": {},
    },
    
    "type_application_acces": {
        "label": "Type d'application",
        "model": TypeApplicationAcces,
        "fields": ["nom", "description", "actif"],
        "required": ["nom"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {},
        "fk_lookup": {},
    },
})


# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def parse_value(value, field_type):
    """Parse une valeur selon son type"""
    if pd.isna(value) or value == "":
        return None
    
    value_str = str(value).strip()
    
    if field_type == "string":
        return value_str
    
    elif field_type == "integer":
        try:
            return int(value_str)
        except ValueError:
            raise ValueError(f"Impossible de convertir '{value_str}' en entier")
    
    elif field_type == "boolean":
        if value_str.lower() in ["true", "1", "oui", "yes", "o"]:
            return True
        elif value_str.lower() in ["false", "0", "non", "no", "n"]:
            return False
        else:
            raise ValueError(f"Impossible de convertir '{value_str}' en booléen (true/false, oui/non, 1/0)")
    
    elif field_type == "time":
        try:
            if ":" in value_str:
                parts = value_str.split(":")
                hour = int(parts[0])
                minute = int(parts[1])
                second = int(parts[2]) if len(parts) > 2 else 0
                return time(hour, minute, second)
            else:
                raise ValueError("Format attendu: HH:MM ou HH:MM:SS")
        except Exception as e:
            raise ValueError(f"Impossible de convertir '{value_str}' en heure: {e}")
    
    elif field_type == "choice":
        return value_str
    
    else:
        return value_str


def get_current_data(api_name):
    """Récupère la liste actuelle de l'API"""
    cfg = IMPORT_CONFIG.get(api_name)
    if not cfg:
        return None
    
    model = cfg["model"]
    objects = model.objects.all().values(*cfg["fields"])
    return list(objects)


def generate_template_dataframe(api_name):
    """Génère un DataFrame vide avec la structure de l'API"""
    cfg = IMPORT_CONFIG.get(api_name)
    if not cfg:
        return None
    
    # Créer une ligne d'exemple
    example_row = {}
    for field in cfg["fields"]:
        field_type = cfg["field_types"].get(field, "string")
        
        if field_type == "boolean":
            example_row[field] = "oui"
        elif field_type == "integer":
            example_row[field] = "0"
        elif field_type == "time":
            example_row[field] = "09:00:00"
        elif field_type == "choice":
            choices = cfg.get("choices", {}).get(field, [])
            example_row[field] = choices[0] if choices else ""
        else:
            example_row[field] = ""
    
    df = pd.DataFrame([example_row])
    return df

# ============================================================================
# JOURS FÉRIÉS FRANÇAIS - POUR DEMANDES DE CONGÉ
# ============================================================================

from datetime import datetime, timedelta

JOURS_FERIES_FRANCAIS_FIXES = [
    {"mois": 1, "jour": 1, "nom": "Jour de l'An"},
    {"mois": 5, "jour": 1, "nom": "Fête du Travail"},
    {"mois": 5, "jour": 8, "nom": "Victoire en Europe 1945"},
    {"mois": 7, "jour": 14, "nom": "Fête Nationale"},
    {"mois": 8, "jour": 15, "nom": "Assomption"},
    {"mois": 11, "jour": 1, "nom": "Toussaint"},
    {"mois": 11, "jour": 11, "nom": "Armistice 1918"},
    {"mois": 12, "jour": 25, "nom": "Noël"},
]

def calculer_jours_ouvrables(date_debut, date_fin):
    """
    Calcule les jours ouvrables (lun-sam) en excluant les jours fériés.
    
    Args:
        date_debut (date): Date de début
        date_fin (date): Date de fin
    
    Returns:
        dict: {'nombre_jours': int, 'jours_feries': [list]}
    """
    
    jours_feries = []
    nombre_jours = 0
    
    # Convertir en date si chaîne
    if isinstance(date_debut, str):
        date_debut = datetime.strptime(date_debut, '%Y-%m-%d').date()
    if isinstance(date_fin, str):
        date_fin = datetime.strptime(date_fin, '%Y-%m-%d').date()
    
    # Itérer chaque jour
    current = date_debut
    while current <= date_fin:
        jour_semaine = current.weekday()  # 0=lun, 6=dim
        
        if jour_semaine < 6:  # Lun-sam (exclure dim)
            is_ferie = False
            
            # Vérifier si jour férié
            for ferie in JOURS_FERIES_FRANCAIS_FIXES:
                if current.month == ferie['mois'] and current.day == ferie['jour']:
                    is_ferie = True
                    jours_feries.append({
                        'date': current.strftime('%Y-%m-%d'),
                        'nom': ferie['nom']
                    })
                    break
            
            # Compter si pas un jour férié
            if not is_ferie:
                nombre_jours += 1
        
        current += timedelta(days=1)
    
    return {
        'nombre_jours': nombre_jours,
        'jours_feries': jours_feries
    }


def est_jour_ouvrable(date_check):
    """Vérifie si une date est un jour ouvrable"""
    
    if isinstance(date_check, str):
        date_check = datetime.strptime(date_check, '%Y-%m-%d').date()
    
    # Dimanche = 6
    if date_check.weekday() >= 6:
        return False
    
    # Vérifier jour férié
    for ferie in JOURS_FERIES_FRANCAIS_FIXES:
        if date_check.month == ferie['mois'] and date_check.day == ferie['jour']:
            return False
    
    return True
# ============================================================================
# 📅 FONCTION CALCUL JOURS OUVRABLES (À AJOUTER À LA FIN DE utils.py)
# ============================================================================

def calculate_working_days(date_debut, date_fin):
    """
    Calcule le nombre de jours ouvrables entre deux dates
    
    Paramètres:
    - date_debut: date de début (date object)
    - date_fin: date de fin (date object)
    
    Retourne:
    - Nombre de jours ouvrables (lun-sam, moins jours fériés)
    
    Jours fériés français (fixes):
    - 1 janvier (Jour de l'an)
    - 1 mai (Fête du Travail)
    - 8 mai (Victoire 1945)
    - 14 juillet (Bastille)
    - 15 août (Assomption)
    - 1 novembre (Toussaint)
    - 11 novembre (Armistice)
    - 25 décembre (Noël)
    
    Jours fériés mobiles:
    - Pâques + 1 jour (Lundi de Pâques)
    - Ascension (Pâques + 39 jours)
    - Pentecôte (Pâques + 49 jours)
    """
    from datetime import timedelta, date as date_class
    
    # Jours fériés fixes français (mois, jour)
    jours_feries_fixes = [
        (1, 1),    # Jour de l'an
        (5, 1),    # Fête du Travail
        (5, 8),    # Victoire 1945
        (7, 14),   # Bastille
        (8, 15),   # Assomption
        (11, 1),   # Toussaint
        (11, 11),  # Armistice
        (12, 25),  # Noël
    ]
    
    # Créer la liste des jours fériés pour l'année
    jours_feries = set()
    
    # Ajouter les jours fériés fixes
    annee = date_debut.year
    for mois, jour in jours_feries_fixes:
        try:
            jours_feries.add(date_class(annee, mois, jour))
        except ValueError:
            pass  # Date invalide
    
    # Aussi vérifier l'année de fin_date
    if date_fin.year != annee:
        annee_fin = date_fin.year
        for mois, jour in jours_feries_fixes:
            try:
                jours_feries.add(date_class(annee_fin, mois, jour))
            except ValueError:
                pass
    
    # Compter les jours o
