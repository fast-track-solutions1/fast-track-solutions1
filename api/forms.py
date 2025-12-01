from django import forms
from .models import ImportLog


class BulkImportForm(forms.Form):
    """Formulaire pour importer en masse"""
    
    API_CHOICES = [
        ('societe', '🏢 Sociétés'),
        ('departement', '📍 Départements'),
        ('circuit', '🔄 Circuits'),
        ('service', '💼 Services'),
        ('grade', '⭐ Grades'),
        ('typeacces', '🔐 Types d\'accès'),
        ('outiltravail', '🛠️ Outils de travail'),
        ('creneatravail', '⏰ Créneaux de travail'),
        ('equipement', '💻 Équipements'),
        ('salarie', '👤 Salariés'),
        ('typeapplicationacces', '📱 Types d\'applications'),
    ]
    
    api_name = forms.ChoiceField(
        choices=API_CHOICES,
        label='📊 Sélectionne le modèle à importer',
        widget=forms.Select(attrs={
            'class': 'form-control',
            'id': 'id_api_name',
        })
    )
    
    file = forms.FileField(
        label='📁 Fichier Excel à importer',
        required=True,
        help_text='Format: .xlsx ou .xls (Max 5 MB)',
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'id': 'id_file',
            'accept': '.xlsx,.xls',
        })
    )
    
    skip_errors = forms.BooleanField(
        label='⏭️ Ignorer les erreurs et continuer l\'import',
        required=False,
        initial=False,
        help_text='Si coché: importe les lignes valides, rapporte les erreurs. Sinon: tout s\'arrête à la première erreur.',
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input',
            'id': 'id_skip_errors',
        })
    )
    
    def clean_file(self):
        """Valide le fichier"""
        file = self.cleaned_data.get('file')
        
        if file:
            # Vérifier l'extension
            if not file.name.endswith(('.xlsx', '.xls')):
                raise forms.ValidationError('❌ Le fichier doit être en format Excel (.xlsx ou .xls)')
            
            # Vérifier la taille (5 MB max)
            if file.size > 5 * 1024 * 1024:
                raise forms.ValidationError('❌ Le fichier est trop volumineux (max 5 MB)')
        
        return file
