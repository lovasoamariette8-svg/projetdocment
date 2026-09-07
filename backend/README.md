# TextSim — Backend Django

Backend de l'application **TextSim** (détection de similarité textuelle entre documents).
Développé avec **Django 6** + **Django REST Framework** + **SQLite**.

## Prérequis

- Python 3.12+ (testé avec Python 3.14)
- Node.js / Vite pour la partie frontend (optionnel)

## Installation

```bash
cd backend

# 1. Créer l'environnement virtuel
python -m venv venv

# 2. Activer l'environnement (Windows)
venv\Scripts\activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Appliquer les migrations
python manage.py migrate

# 5. (Option) Créer un superutilisateur
python manage.py createsuperuser

# 6. (Option) Données de démonstration (utilisateur admin + documents + analyse)
python manage.py seed_demo

# 7. Lancer le serveur
python manage.py runserver
```

Server URL: http://localhost:8000/api/

### Compte de démonstration (`seed_demo`)

- Utilisateur : `admin`
- Mot de passe : `admin123`

## Dépendances

Voir `requirements.txt` :

- `Django` — framework web
- `djangorestframework` — API REST
- `django-cors-headers` — autorise le frontend Vite (localhost:5173)
- `Pillow` — images (requis par Django)
- `python-docx` — extraction du texte des fichiers DOCX
- `pypdf` — extraction du texte des fichiers PDF

## Endpoints de l'API

Authentification par session (cookies). Pour les requêtes POST / PUT / DELETE,
renvoyer l'en-tête `X-CSRFToken` (lu depuis le cookie `csrftoken`).

| Méthode | URL | Description |
| --- | --- | --- |
| POST | `/api/auth/login/` | Connexion (`username`, `password`) |
| POST | `/api/auth/logout/` | Déconnexion |
| GET | `/api/auth/me/` | Utilisateur connecté + paramètres |
| GET | `/api/documents/` | Liste des documents importés |
| POST | `/api/documents/` | Import d'un document (multipart : `file`, `name` requis pour TXT/DOCX) |
| GET | `/api/documents/{id}/` | Détails (contient `content` pour TXT extraits) |
| GET | `/api/documents/{id}/?action=download` | Téléchargement du fichier |
| GET | `/api/documents/{id}/?action=preview` | Extrait de texte pour prévisualisation |
| DELETE | `/api/documents/{id}/` | Suppression du document |
| POST | `/api/analyses/` | Lancer une analyse (JSON : `documentIds`, `ngramSize`, `normalization`, `alertThreshold`) |
| GET | `/api/analyses/list/` | Historique des analyses |
| GET | `/api/analyses/{id}/` | Détail d'une analyse (comparaisons + passages communs) |
| GET | `/api/dashboard/` | Statistiques (totaux + série mensuelle + documents récents) |
| GET | `/api/settings/` | Paramètres de l'utilisateur |
| PUT | `/api/settings/` | Mise à jour des paramètres et du profil |

### Exemple : lancer une analyse

```bash
curl -X POST http://localhost:8000/api/analyses/ \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <jeton>" \
  -b cookies.txt \
  -d '{
    "documentIds": [1, 2],
    "ngramSize": 3,
    "normalization": "lowercase",
    "alertThreshold": 70
  }'
```

## Moteur d'analyse

`textsim/services.py` implémente :

- **Extraction de texte** : TXT (utf-8/latin-1), DOCX (`python-docx`), PDF (`pypdf`).
- **Normalisation** : `lowercase`, `accents` (suppression des accents), `spaces` (normalisation des espaces), `full`.
- **N-grammes de mots** : séquences de `n` mots consécutifs.
- **Similarité de Jaccard** : `|A ∩ B| / |A ∪ B| × 100`.
- **Passages communs** : regroupement des n-grammes partagés phrase par phrase, avec une similarité par passage.

Statuts d'une comparaison (selon le seuil d'alerte de l'analyse) :

- `plagiat` : similarité ≥ seuil
- `revision` : 40 % ≤ similarité < seuil
- `conforme` : similarité < 40 %

## Structure

```
backend/
├── config/            # Paramètres Django (settings, urls)
├── textsim/           # Application principale
│   ├── models.py      # Document, Analysis, Comparison, MatchingPassage, AnalysisSettings
│   ├── serializers.py # Sérialiseurs DRF
│   ├── services.py    # Extraction de texte + moteur n-grammes
│   ├── views.py       # Vues API
│   └── management/commands/seed_demo.py  # Données de démonstration
├── media/             # Fichiers importés (ignoré par git)
├── requirements.txt
└── db.sqlite3         # Base SQLite (ignorée par git)
```

## Connexion avec le frontend React

- Le frontend Vite tourne sur `http://localhost:5173` (déjà autorisé par CORS).
- Utiliser `credentials: "include"` sur toutes les requêtes `fetch` (`fetch(url, { credentials: "include" })`).
- Lire le jeton CSRF depuis le cookie `csrftoken` et l'envoyer en en-tête `X-CSRFToken` pour les requêtes d'écriture.