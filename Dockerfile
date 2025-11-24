FROM python:3.12-slim

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements.txt
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le projet
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p /app/staticfiles /app/media

# Exposer le port
EXPOSE 8000

# Commande de démarrage
CMD ["gunicorn", "msi_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
