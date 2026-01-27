# 🔥 Guide de Configuration Firebase - Étape par Étape

## 📌 Vue d'ensemble

Votre projet est déjà configuré pour Firebase. Il vous suffit maintenant d'ajouter vos clés Firebase.

## 🔑 Étape 1 : Obtenir vos clés Firebase

### A. Créer un projet Firebase (si pas encore fait)

1. Allez sur https://console.firebase.google.com/
2. Cliquez sur **"Ajouter un projet"**
3. Donnez un nom à votre projet (ex: "MonAppIonic")
4. Suivez les étapes de configuration

### B. Activer l'authentification

1. Dans votre projet Firebase, cliquez sur **Authentication** dans le menu
2. Cliquez sur **"Commencer"**
3. Dans l'onglet **"Sign-in method"**:
   - Activez **"E-mail/Mot de passe"**
   - Cliquez sur **"Enregistrer"**

### C. Activer Firestore Database

1. Cliquez sur **"Firestore Database"** dans le menu
2. Cliquez sur **"Créer une base de données"**
3. Choisissez **"Démarrer en mode test"** (pour le développement)
4. Sélectionnez une région proche de vous
5. Cliquez sur **"Activer"**

## 📱 Étape 2 : Configuration pour les applications (Mobile + Web)

### A. Obtenir la configuration Web

1. Dans Firebase Console, cliquez sur ⚙️ **"Paramètres du projet"**
2. Descendez jusqu'à **"Vos applications"**
3. Cliquez sur l'icône **Web** (</>) ou **"Ajouter une application"**
4. Donnez un nom (ex: "Web App" ou "Mobile App")
5. Cochez **"Configurer également Firebase Hosting"** (optionnel)
6. Cliquez sur **"Enregistrer l'application"**
7. **Copiez la configuration** qui ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### B. Configurer l'application Mobile (Ionic)

Éditez le fichier : **`mobile-app/src/environments/environment.ts`**

Remplacez les valeurs par celles que vous avez copiées :

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "VOTRE_VRAIE_API_KEY",
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet-id",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
  },
  apiUrl: 'http://localhost:3000/api'
};
```

**Important** : Faites la même chose pour **`mobile-app/src/environments/environment.prod.ts`** !

### C. Configurer l'application Web (React)

Éditez le fichier : **`web-app/src/config/firebase.js`**

```javascript
// Configuration Firebase pour l'application Web
export const firebaseConfig = {
  apiKey: "VOTRE_VRAIE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

## 🔒 Étape 3 : Configuration du Backend (Node.js)

### A. Télécharger la clé privée

1. Dans Firebase Console, cliquez sur ⚙️ **"Paramètres du projet"**
2. Allez dans l'onglet **"Comptes de service"**
3. Assurez-vous que **"Firebase Admin SDK"** est sélectionné
4. Cliquez sur **"Générer une nouvelle clé privée"**
5. Confirmez en cliquant sur **"Générer la clé"**
6. Un fichier JSON sera téléchargé sur votre ordinateur

### B. Installer le fichier de clé

1. **Renommez** le fichier téléchargé en **`firebase-service-account.json`**
2. **Copiez** ce fichier dans : **`backend/src/config/`**
3. Le chemin final doit être : **`backend/src/config/firebase-service-account.json`**

⚠️ **SÉCURITÉ** : Ce fichier contient des informations sensibles !
- Il est déjà dans `.gitignore`, ne le committez JAMAIS
- Ne le partagez jamais publiquement
- Ne le mettez pas sur GitHub

## 🚀 Étape 4 : Tester la configuration

### A. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Web App
cd ../web-app
npm install

# Mobile App
cd ../mobile-app
npm install
```

### B. Démarrer le backend

```bash
cd backend
npm start
```

Vous devriez voir : ✅ **Firebase Admin SDK initialisé avec succès**

### C. Tester l'application Web

```bash
cd web-app
npm start
```

Allez sur http://localhost:3000 et essayez de vous inscrire !

### D. Tester l'application Mobile

```bash
cd mobile-app
ionic serve
```

Allez sur http://localhost:8100 et essayez de vous inscrire !

## 🔍 Vérification dans Firebase Console

Après une inscription réussie :

1. Allez dans **Authentication** → **Utilisateurs**
2. Vous devriez voir le nouvel utilisateur
3. Allez dans **Firestore Database** → **Data**
4. Vous devriez voir une collection **"users"** avec les profils

## 🐛 Résolution de problèmes

### Erreur : "Firebase not configured"
➡️ Vérifiez que le fichier `firebase-service-account.json` est bien dans `backend/src/config/`

### Erreur : "API key not valid"
➡️ Vérifiez que vous avez copié la bonne API key dans les fichiers environment

### Erreur : "Network error"
➡️ Assurez-vous que le backend tourne sur http://localhost:3000

### Utilisateurs ne s'affichent pas dans Firebase Console
➡️ Vérifiez que Firestore est bien activé et en mode "test"

## 📚 Fichiers à configurer (Récapitulatif)

1. ✅ **`mobile-app/src/environments/environment.ts`** - Config Firebase Mobile (dev)
2. ✅ **`mobile-app/src/environments/environment.prod.ts`** - Config Firebase Mobile (prod)
3. ✅ **`web-app/src/config/firebase.js`** - Config Firebase Web
4. ✅ **`backend/src/config/firebase-service-account.json`** - Clé privée Backend (créer)

## ✨ Fonctionnalités disponibles

Une fois configuré, votre application supporte :

- ✅ Inscription avec email/mot de passe
- ✅ Connexion avec email/mot de passe
- ✅ Déconnexion
- ✅ Mise à jour du profil
- ✅ Mode hors ligne (fallback sur PostgreSQL)
- ✅ Synchronisation automatique

## 🎯 Prochaines étapes

- Ajouter d'autres méthodes d'authentification (Google, Facebook, etc.)
- Configurer les règles de sécurité Firestore
- Activer Firebase Storage pour les photos de profil
- Configurer les notifications push avec Firebase Cloud Messaging

---

**Besoin d'aide ?** Consultez la documentation officielle : https://firebase.google.com/docs
