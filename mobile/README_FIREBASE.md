# Application Mobile - Signalement Route (Madagascar)

Application mobile Ionic Vue.js pour le signalement des problèmes routiers à Madagascar avec support Firebase (en ligne) et PostgreSQL local (hors ligne).

## 🎯 Architecture

### Mode En Ligne (avec connexion Internet)
- **Authentification** : Firebase Authentication
- **Base de données** : Cloud Firestore
- **Cartes** : Leaflet + OpenStreetMap en ligne

### Mode Hors Ligne (sans connexion Internet)
- **Authentification** : API REST → PostgreSQL local (Docker)
- **Base de données** : PostgreSQL local (Docker)
- **Synchronisation** : Automatique vers Firebase lors de la reconnexion

## 📋 Fonctionnalités

### Utilisateurs
- ✅ Connexion uniquement (pas d'inscription - gérée par le manager web)
- ✅ Signaler les problèmes routiers depuis la carte interactive
- ✅ Prendre une photo avec la caméra
- ✅ Géolocalisation automatique (GPS)
- ✅ Afficher la carte avec tous les signalements
- ✅ Filtre : "Afficher mes signalements uniquement"
- ✅ Voir le récapitulatif des signalements

## 🚀 Installation

### 1. Prérequis
```bash
Node.js >= 18
npm >= 9
Docker Desktop (pour PostgreSQL local)
```

### 2. Cloner et installer les dépendances
```bash
cd mobile
npm install
```

### 3. Configuration Firebase

Créez un fichier `.env` à la racine du dossier `mobile` :

```env
# API backend PostgreSQL local (Docker) - Mode hors ligne
VITE_API_URL=http://localhost:3000/api

# Configuration Firebase - Mode en ligne (REQUIS)
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

**Comment obtenir la configuration Firebase ?**
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Aller dans Paramètres du projet > Général
4. Dans "Vos applications", ajouter une application Web
5. Copier la configuration fournie

### 4. Activer Firebase Authentication
1. Dans Firebase Console → Authentication
2. Activer "Email/Password" comme méthode de connexion

### 5. Créer la base Firestore
1. Dans Firebase Console → Firestore Database
2. Créer une base de données (mode production)
3. Règles de sécurité à appliquer :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Signalements - authentifié requis
    match /signalements/{signalementId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                     request.resource.data.user_id == request.auth.uid;
      allow update, delete: if request.auth != null && 
                              resource.data.user_id == request.auth.uid;
    }
  }
}
```

### 6. Démarrer PostgreSQL local (Docker)

Créez un fichier `docker-compose.yml` à la racine du projet :

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: signalement_route_db
    environment:
      POSTGRES_DB: signalement_route
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - ./script.sql:/docker-entrypoint-initdb.d/script.sql
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Lancer Docker :
```bash
docker-compose up -d
```

## 🏃 Lancer l'application

### Mode Développement (navigateur)
```bash
npm run dev
```

### Build pour production
```bash
npm run build
```

### Sur appareil Android
```bash
npm run build
npx cap sync android
npx cap open android
```

### Sur appareil iOS
```bash
npm run build
npx cap sync ios
npx cap open ios
```

## 📱 Utilisation

### 1. Connexion
- Ouvrir l'application
- Saisir email et mot de passe (créés par le manager sur le web)
- **Note** : L'inscription n'est PAS disponible sur mobile

### 2. Signaler un problème
- Aller dans l'onglet "Carte"
- Cliquer sur la carte à l'endroit du problème
- Remplir le formulaire :
  - Titre du signalement
  - Description
  - Priorité (Faible / Moyenne / Haute)
  - Photo (optionnel)
- Les coordonnées GPS sont automatiquement récupérées
- Envoyer le signalement

### 3. Voir mes signalements
- Onglet "Carte" ou "Liste"
- Activer le filtre "Mes signalements uniquement"
- Affiche uniquement vos signalements

### 4. Mode hors ligne
- L'application détecte automatiquement la perte de connexion
- Les signalements créés hors ligne sont stockés localement
- Synchronisation automatique lors de la reconnexion

## 🔧 Structure des fichiers

```
mobile/
├── src/
│   ├── services/
│   │   ├── firebase.service.ts    # Service Firebase (auth + Firestore)
│   │   ├── sync.service.ts        # Service de synchronisation
│   │   ├── api.service.ts         # Service API REST (PostgreSQL local)
│   │   └── storage.service.ts     # Stockage local (Capacitor Preferences)
│   ├── stores/
│   │   ├── auth.firebase.ts       # Store authentification Firebase
│   │   └── signalement.firebase.ts # Store signalements avec sync
│   ├── views/
│   │   ├── auth/LoginPage.vue     # Page de connexion (sans inscription)
│   │   ├── MapPage.vue            # Carte interactive Leaflet
│   │   └── ...
│   ├── config/
│   │   └── constants.ts           # Configuration Firebase + API
│   └── main.ts                    # Point d'entrée (init Firebase)
├── .env                           # Variables d'environnement
├── capacitor.config.ts
├── ionic.config.json
└── package.json
```

## 🔐 Sécurité

- ✅ Authentification requise pour toutes les actions
- ✅ JWT tokens pour l'API REST
- ✅ Firebase Authentication pour le mode en ligne
- ✅ Règles Firestore pour protéger les données
- ✅ Pas d'inscription possible depuis le mobile (sécurité renforcée)

## 📊 Synchronisation

Le système de synchronisation fonctionne ainsi :

1. **Mode en ligne** : Toutes les opérations vont directement sur Firebase
2. **Mode hors ligne** : 
   - Les opérations sont stockées dans PostgreSQL local
   - Une file d'attente de synchronisation est créée
3. **Reconnexion** :
   - Détection automatique
   - Synchronisation de la file d'attente vers Firebase
   - Nettoyage de la file après succès

## 🗺️ Cartes et Géolocalisation

- **Librairie** : Leaflet.js
- **Tuiles** : OpenStreetMap (en ligne)
- **Géolocalisation** : Capacitor Geolocation plugin
- **Permissions** : Demandées automatiquement lors de la première utilisation

## ⚙️ Configuration Capacitor

Les plugins natifs utilisés :
- `@capacitor/camera` : Prendre des photos
- `@capacitor/geolocation` : GPS
- `@capacitor/network` : Détecter la connexion Internet
- `@capacitor/preferences` : Stockage local
- `@capacitor/status-bar` : Barre de statut
- `@capacitor/haptics` : Vibrations

## 🐛 Dépannage

### Erreur "Firebase not initialized"
→ Vérifiez que votre fichier `.env` contient toutes les clés Firebase

### Erreur "Cannot connect to local database"
→ Vérifiez que Docker est lancé et que PostgreSQL écoute sur le port 5432

### Géolocalisation ne fonctionne pas
→ Vérifiez les permissions dans les paramètres de l'appareil

### Photos ne s'affichent pas
→ Vérifiez les permissions de la caméra

## 📝 Notes importantes

1. **Pas d'inscription mobile** : Les comptes sont créés uniquement par le manager sur l'application web
2. **OpenStreetMap** : Nécessite une connexion Internet pour charger les tuiles de carte
3. **Synchronisation** : Les données créées hors ligne seront envoyées à Firebase lors de la reconnexion
4. **Docker** : Indispensable pour le mode hors ligne (PostgreSQL local)

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez que Docker est lancé
2. Vérifiez votre configuration Firebase dans `.env`
3. Consultez les logs de l'application
4. Contactez l'administrateur système

## 📄 Licence

Projet Rojo S5 - ITU Madagascar
