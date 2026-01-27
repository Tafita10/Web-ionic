# 🚀 Système d'Authentification Hybride Firebase/PostgreSQL

Ce projet implémente un système d'authentification qui bascule automatiquement entre Firebase (en ligne) et PostgreSQL (hors ligne).

## 📋 Fonctionnalités

✅ **Authentification en ligne** avec Firebase Authentication  
✅ **Authentification hors ligne** avec PostgreSQL + JWT  
✅ **Inscription** des nouveaux utilisateurs  
✅ **Modification** des informations utilisateur  
✅ **Basculement automatique** entre Firebase et base locale  
✅ **Profil utilisateur** stocké dans Firestore  
✅ **Mode hybride** pour haute disponibilité  

## 🏗️ Architecture

- **Backend**: Node.js + Express + PostgreSQL + Firebase Admin SDK
- **Mobile App**: Ionic + Angular + Firebase + Capacitor
- **Web App**: React + Firebase
- **Base de données**: PostgreSQL (local) + Firebase Firestore (cloud)

## 🔥 Configuration Firebase - Démarrage Rapide

**🎯 Votre projet est déjà prêt pour Firebase ! Il ne reste qu'à ajouter vos clés.**

### 📚 Guides Disponibles

- **🚀 [QUICK_START_FIREBASE.md](QUICK_START_FIREBASE.md)** - Démarrage rapide (5 minutes)
- **📖 [FIREBASE_CONFIG_GUIDE.md](FIREBASE_CONFIG_GUIDE.md)** - Guide complet détaillé
- **✅ [FIREBASE_CHECKLIST.md](FIREBASE_CHECKLIST.md)** - Checklist de configuration
- **🏗️ [ARCHITECTURE_FIREBASE.md](ARCHITECTURE_FIREBASE.md)** - Architecture et diagrammes
- **📋 [CONFIG_TEMPLATE.md](CONFIG_TEMPLATE.md)** - Templates de configuration

### ⚡ Configuration Express (3 étapes)

1. **Firebase Console**: Créez un projet sur https://console.firebase.google.com/
2. **Récupérez les clés**: Configuration Web + Clé privée Admin
3. **Configurez les fichiers**:
   - `mobile-app/src/environments/environment.ts` (+ `.prod.ts`)
   - `web-app/src/config/firebase.js`
   - `backend/src/config/firebase-service-account.json`

### ✅ Vérifier la Configuration

```bash
npm run check-firebase
```

### 🔄 Migrer les Données vers Firebase

Une fois Firebase configuré, vous pouvez migrer les données initiales :

```bash
cd backend
npm run migrate:firebase
```

📖 **Guide complet** : [backend/MIGRATION_GUIDE.md](backend/MIGRATION_GUIDE.md)

---

## 🔧 Installation et Configuration

### 1. Configuration Firebase

#### a) Créer un projet Firebase
1. Allez sur https://console.firebase.google.com/
2. Créez un nouveau projet
3. Activez **Authentication** → Email/Password
4. Activez **Firestore Database**

#### b) Configuration Backend
1. Téléchargez la clé privée (Service Account):
   - Paramètres du projet → Comptes de service
   - Générer une nouvelle clé privée
   - Sauvegardez dans: `backend/src/config/firebase-service-account.json`

#### c) Configuration Frontend (Mobile & Web)
1. Dans Firebase Console → Paramètres du projet → Applications
2. Ajoutez une application Web
3. Copiez la configuration et mettez-la dans:
   - Mobile: `mobile-app/src/environments/environment.ts`
   - Web: `web-app/src/config/firebase.js`

### 2. Installation des dépendances

#### Backend
```bash
cd backend
npm install
```

#### Mobile App
```bash
cd mobile-app
npm install
```

#### Web App
```bash
cd web-app
npm install
```

### 3. Configuration de la base de données PostgreSQL

#### Démarrer PostgreSQL avec Docker
```bash
# À la racine du projet
docker-compose up -d
```

Cela crée:
- Un conteneur PostgreSQL
- La base de données `ionic_db`
- La table `users` avec le schéma approprié

### 4. Configuration de l'environnement

Éditez le fichier `.env` à la racine:
```env
# Backend
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ionic_db
DB_USER=ionic_user
DB_PASSWORD=ionic_password

# Firebase (chemin vers le fichier de clé)
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this
```

## 🚀 Démarrage

### Backend
```bash
cd backend
npm start
# ou en mode développement avec auto-reload
npm run dev
```

Le serveur démarre sur http://localhost:3000

### Mobile App
```bash
cd mobile-app
npm start
```

L'app Ionic démarre sur http://localhost:8100

### Web App
```bash
cd web-app
npm start
```

L'app React démarre sur http://localhost:3000

## 📡 Fonctionnement du mode hybride

### Mode EN LIGNE (Firebase)
- Utilise Firebase Authentication
- Données stockées dans Firestore
- Synchronisation temps réel

### Mode HORS LIGNE (PostgreSQL)
- Utilise la base de données PostgreSQL locale
- Authentification par JWT
- Mots de passe hashés avec bcrypt

### Basculement automatique
Le système détecte automatiquement la connexion Internet:
- ✅ Connexion disponible → Firebase
- ❌ Pas de connexion → PostgreSQL local

## 🔐 API Endpoints (Backend)

### Authentification
```
POST /api/auth/register
Body: { email, password, displayName? }

POST /api/auth/login
Body: { email, password }

PUT /api/auth/:uid
Body: { displayName?, email?, password?, phoneNumber?, photoURL? }

GET /api/auth/:uid
```

### Statut du serveur
```
GET /api/status
Retourne: { online, firebase, mode }
```

## 📱 Pages de l'application

### Mobile App (Ionic)
- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/profile` - Page de profil utilisateur
- `/home` - Page d'accueil

### Web App (React)
- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/profile` - Page de profil utilisateur
- `/` - Page d'accueil

## 🧪 Test de l'application

### 1. Test en mode EN LIGNE
1. Assurez-vous d'avoir une connexion Internet
2. Démarrez le backend et l'app
3. Inscrivez-vous avec un email/password
4. Les données seront stockées dans Firebase

### 2. Test en mode HORS LIGNE
1. Désactivez votre connexion Internet (ou configurez le pare-feu)
2. L'app basculera automatiquement sur PostgreSQL
3. Les inscriptions/connexions utiliseront la base locale

### 3. Vérifier le basculement
```bash
# Vérifier le statut
curl http://localhost:3000/api/status
```

## 🗄️ Structure de la base de données

### PostgreSQL (Local)
```sql
Table: users
- id (SERIAL PRIMARY KEY)
- uid (VARCHAR UNIQUE)
- email (VARCHAR UNIQUE)
- password (VARCHAR, hashé avec bcrypt)
- display_name (VARCHAR)
- photo_url (TEXT)
- phone_number (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Firebase Firestore
```
Collection: users
Document ID: {uid}
- email
- displayName
- photoURL
- phoneNumber
- createdAt
- updatedAt
```

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- JWT pour l'authentification locale
- Tokens Firebase pour l'authentification cloud
- Validation des entrées côté client et serveur
- CORS configuré pour les origines autorisées

## 📝 Notes importantes

1. **Configuration Firebase** : N'oubliez pas de remplacer les valeurs de configuration par défaut
2. **Sécurité JWT** : Changez `JWT_SECRET` en production
3. **HTTPS** : Utilisez HTTPS en production pour Firebase et l'API
4. **Variables d'environnement** : Ne commitez jamais les fichiers `.env` ou les clés Firebase

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez que PostgreSQL est démarré: `docker ps`
- Vérifiez le fichier de clé Firebase
- Vérifiez les variables d'environnement dans `.env`

### Firebase ne fonctionne pas
- Vérifiez la configuration dans `environment.ts` / `firebase.js`
- Assurez-vous que l'authentification email/password est activée
- Vérifiez la console Firebase pour les erreurs

### La base locale ne fonctionne pas
- Vérifiez que Docker est démarré
- Testez la connexion: `docker exec -it ionic-postgres-db psql -U ionic_user -d ionic_db`
- Vérifiez les logs: `docker logs ionic-postgres-db`

## 📚 Ressources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Ionic Framework](https://ionicframework.com/docs)
- [React Documentation](https://react.dev)
- [PostgreSQL](https://www.postgresql.org/docs/)

## 👨‍💻 Support

Pour toute question ou problème, consultez la documentation ou créez une issue.

---

**Bon développement ! 🎉**
