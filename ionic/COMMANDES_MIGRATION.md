# 🎯 COMMANDES À EXÉCUTER - Firebase Migration

Suivez ces commandes dans l'ordre pour configurer Firebase et migrer vos données.

---

## 📋 ÉTAPE 1 : Configuration Firebase (Web Console)

### Créer le projet Firebase

```
1. Ouvrir: https://console.firebase.google.com/
2. Cliquer: "Ajouter un projet"
3. Nom: "Cloud P17 Signalement Routier"
4. Continuer → Créer le projet
```

### Activer Authentication

```
Firebase Console → Authentication → Commencer
→ Sign-in method → Email/Password → Activer
```

### Activer Firestore

```
Firebase Console → Firestore Database → Créer une base de données
→ Mode: Test → Sélectionner une région → Activer
```

### Récupérer la configuration Web

```
Firebase Console → ⚙️ Paramètres du projet → Général
→ Vos applications → Ajouter une application → Web
→ Copier firebaseConfig { apiKey, authDomain, projectId, ... }
```

### Télécharger la clé Admin

```
Firebase Console → ⚙️ Paramètres du projet → Comptes de service
→ Générer une nouvelle clé privée → Télécharger JSON
```

---

## 💻 ÉTAPE 2 : Configuration Locale (Terminal)

### PowerShell - Windows

```powershell
# Naviguer vers le projet
cd d:\S5\WEb\ionic

# Vérifier la structure
dir

# Aller dans le backend
cd backend

# Créer le dossier config si nécessaire
New-Item -ItemType Directory -Force -Path "src\config"

# Copier la clé Firebase téléchargée
# Renommer en: firebase-service-account.json
# Placer dans: backend\src\config\firebase-service-account.json
Copy-Item "C:\Users\VotreNom\Downloads\votre-projet-firebase-adminsdk-xxxxx.json" -Destination "src\config\firebase-service-account.json"

# Installer les dépendances
npm install

# Vérifier que firebase-admin est installé
npm list firebase-admin
```

---

## 📝 ÉTAPE 3 : Éditer les fichiers de configuration

### Mobile App - environment.ts

```powershell
# Ouvrir avec votre éditeur
code ..\mobile-app\src\environments\environment.ts
```

**Remplacer par :**
```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "VOTRE_VRAIE_API_KEY",
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet-id",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  },
  apiUrl: 'http://localhost:3000/api'
};
```

### Mobile App - environment.prod.ts

```powershell
code ..\mobile-app\src\environments\environment.prod.ts
```

**Même configuration que ci-dessus mais avec `production: true`**

### Web App - firebase.js

```powershell
code ..\web-app\src\config\firebase.js
```

**Remplacer par :**
```javascript
export const firebaseConfig = {
  apiKey: "VOTRE_VRAIE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

export const API_URL = 'http://localhost:3000/api';
```

---

## ✅ ÉTAPE 4 : Vérifier la configuration

```powershell
# Retour à la racine
cd ..

# Vérifier la configuration Firebase
npm run check-firebase
```

**Résultat attendu :**
```
✅ Backend Service Account
✅ Mobile App Config (Dev)
✅ Mobile App Config (Prod)
✅ Web App Config
```

---

## 🚀 ÉTAPE 5 : Migrer les données vers Firebase

```powershell
# Aller dans le backend
cd backend

# Exécuter la migration
npm run migrate:firebase
```

**Résultat attendu :**
```
🔥 Connexion à Firebase réussie
📊 Démarrage de la migration...

📦 Migration de la collection "type_users"...
   ✅ 3/3 documents insérés

📦 Migration de la collection "status"...
   ✅ 3/3 documents insérés

📦 Migration de la collection "villes"...
   ✅ 3/3 documents insérés

📦 Migration de la collection "routes"...
   ✅ 5/5 documents insérés

📦 Migration de la collection "entreprises"...
   ✅ 4/4 documents insérés

👤 Création des utilisateurs Firebase Authentication...
   ✅ Utilisateur créé: manager@example.com
   ✅ Utilisateur créé: user1@example.com
   ✅ Utilisateur créé: user2@example.com
   ✅ Utilisateur créé: user3@example.com

📍 Migration des signalements...
   ✅ 5/5 signalements insérés

═══════════════════════════════════════════════════════
📊 RÉSUMÉ DE LA MIGRATION
═══════════════════════════════════════════════════════
✅ Total documents: 27
✅ Succès: 27
❌ Erreurs: 0
⏱️  Durée: 3.24s
═══════════════════════════════════════════════════════

🎉 Migration terminée avec succès !
```

---

## 🔍 ÉTAPE 6 : Vérifier dans Firebase Console

```powershell
# Ouvrir dans le navigateur
Start-Process "https://console.firebase.google.com/"
```

### Vérifier Authentication

```
Navigation: Votre projet → Authentication → Utilisateurs
→ Devrait afficher 4 utilisateurs
```

### Vérifier Firestore

```
Navigation: Votre projet → Firestore Database → Data
→ Devrait afficher 7 collections:
   • type_users (3 docs)
   • status (3 docs)
   • villes (3 docs)
   • routes (5 docs)
   • entreprises (4 docs)
   • users (4 docs)
   • signalements (5 docs)
```

---

## 🧪 ÉTAPE 7 : Tester l'application

### Démarrer le Backend (Terminal 1)

```powershell
cd backend
npm start
```

**Sortie attendue :**
```
✅ Firebase Admin SDK initialisé avec succès
🚀 Serveur démarré sur http://localhost:3000
```

### Démarrer Web App (Terminal 2)

```powershell
cd web-app
npm install
npm start
```

**Ouvre :** http://localhost:3000

### Démarrer Mobile App (Terminal 3)

```powershell
cd mobile-app
npm install
ionic serve
```

**Ouvre :** http://localhost:8100

---

## 👤 ÉTAPE 8 : Tester la connexion

### Via Web App

```
1. Aller sur: http://localhost:3000/login
2. Email: user1@example.com
3. Mot de passe: User123!
4. Cliquer: Se connecter
```

✅ **Résultat attendu :** Redirection vers la page d'accueil

### Via Mobile App

```
1. Aller sur: http://localhost:8100/login
2. Email: user1@example.com
3. Mot de passe: User123!
4. Cliquer: Se connecter
```

✅ **Résultat attendu :** Redirection vers la page d'accueil

### Via API (curl)

```powershell
# Tester l'inscription
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"user1@example.com\",\"password\":\"User123!\"}'
```

✅ **Résultat attendu :** Token JWT + profil utilisateur

---

## 📊 RÉSUMÉ FINAL

### ✅ Ce qui a été fait

- [x] Projet Firebase créé
- [x] Authentication activée (Email/Password)
- [x] Firestore Database activée
- [x] Configuration récupérée
- [x] Fichiers locaux configurés
- [x] Migration exécutée
- [x] 27 documents créés dans Firestore
- [x] 4 utilisateurs créés dans Firebase Auth
- [x] Applications testées

### 📋 Utilisateurs créés

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| manager@example.com | Manager123! | manager |
| user1@example.com | User123! | user |
| user2@example.com | User123! | user |
| user3@example.com | User123! | user |

### 📦 Collections créées

| Collection | Documents |
|------------|-----------|
| type_users | 3 |
| status | 3 |
| villes | 3 |
| routes | 5 |
| entreprises | 4 |
| users | 4 |
| signalements | 5 |

---

## 🎯 Commandes Utiles

```powershell
# Vérifier la config Firebase
npm run check-firebase

# Migrer les données
cd backend
npm run migrate:firebase

# Démarrer tout en une fois (3 terminaux)
# Terminal 1
cd backend && npm start

# Terminal 2
cd web-app && npm start

# Terminal 3
cd mobile-app && ionic serve

# Voir les logs du backend
cd backend && npm start

# Réinstaller les dépendances
cd backend && Remove-Item -Recurse -Force node_modules && npm install
cd web-app && Remove-Item -Recurse -Force node_modules && npm install
cd mobile-app && Remove-Item -Recurse -Force node_modules && npm install
```

---

## 🔗 Liens Utiles

- **Firebase Console:** https://console.firebase.google.com/
- **Backend API:** http://localhost:3000
- **Web App:** http://localhost:3000 (après npm start)
- **Mobile App:** http://localhost:8100 (après ionic serve)

---

## 📚 Documentation

- [QUICK_START_FIREBASE.md](QUICK_START_FIREBASE.md) - Démarrage rapide
- [FIREBASE_CONFIG_GUIDE.md](FIREBASE_CONFIG_GUIDE.md) - Guide complet
- [backend/MIGRATION_GUIDE.md](backend/MIGRATION_GUIDE.md) - Guide de migration
- [FIREBASE_MIGRATION_SUMMARY.md](FIREBASE_MIGRATION_SUMMARY.md) - Résumé complet

---

**🎉 Félicitations ! Votre application est maintenant connectée à Firebase ! 🚀**
