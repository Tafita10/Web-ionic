# 🔥 Firebase Online Authentication - Quick Start

## ✅ Ce qui est déjà fait

Votre projet est **déjà configuré** pour utiliser Firebase ! Il ne reste plus qu'à ajouter vos clés.

### Fichiers déjà en place :

- ✅ **Backend**: Firebase Admin SDK configuré ([backend/src/config/firebase.js](backend/src/config/firebase.js))
- ✅ **Mobile App**: Service d'authentification prêt ([mobile-app/src/app/services/auth.service.ts](mobile-app/src/app/services/auth.service.ts))
- ✅ **Web App**: Service d'authentification prêt ([web-app/src/services/authService.js](web-app/src/services/authService.js))
- ✅ **Fonctionnalités**: Inscription, connexion, déconnexion, profil

---

## 🚀 Configuration en 3 étapes

### 📍 Étape 1 : Firebase Console

1. Allez sur https://console.firebase.google.com/
2. Créez un projet (ou utilisez un existant)
3. Activez **Authentication** → Email/Password
4. Activez **Firestore Database**

### 🔑 Étape 2 : Récupérer les clés

#### Pour Mobile + Web :
- Firebase Console → ⚙️ Paramètres → Applications → Ajouter une app Web
- Copiez la configuration (apiKey, authDomain, etc.)

#### Pour Backend :
- Firebase Console → ⚙️ Paramètres → Comptes de service
- Cliquez "Générer une nouvelle clé privée"
- Téléchargez le fichier JSON

### 📝 Étape 3 : Configurer les fichiers

#### A. Mobile App

Éditez [mobile-app/src/environments/environment.ts](mobile-app/src/environments/environment.ts):

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSy...",              // ← Collez votre vraie clé ici
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet-id",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  },
  apiUrl: 'http://localhost:3000/api'
};
```

**Important**: Faites la même chose pour [mobile-app/src/environments/environment.prod.ts](mobile-app/src/environments/environment.prod.ts)

#### B. Web App

Éditez [web-app/src/config/firebase.js](web-app/src/config/firebase.js):

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSy...",              // ← Collez votre vraie clé ici
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

#### C. Backend

1. Renommez le fichier téléchargé en `firebase-service-account.json`
2. Copiez-le dans `backend/src/config/`
3. Chemin final: `backend/src/config/firebase-service-account.json`

⚠️ **Ce fichier est dans .gitignore, ne le committez JAMAIS !**

---

## ✅ Vérifier la configuration

Exécutez le script de vérification :

```bash
npm run check-firebase
```

Ou manuellement :

```bash
node check-firebase-config.js
```

---

## 🧪 Tester

### 1. Démarrer le Backend

```bash
cd backend
npm install
npm start
```

✅ Vous devriez voir : "Firebase Admin SDK initialisé avec succès"

### 2. Tester l'application Web

```bash
cd web-app
npm install
npm start
```

Allez sur http://localhost:3000 → Inscrivez-vous !

### 3. Tester l'application Mobile

```bash
cd mobile-app
npm install
ionic serve
```

Allez sur http://localhost:8100 → Inscrivez-vous !

---

## 🔍 Vérifier dans Firebase

Après inscription :
1. Firebase Console → **Authentication** → Utilisateurs ✅
2. Firebase Console → **Firestore** → Data → Collection "users" ✅

---

## 📚 Documentation complète

- 📖 Guide détaillé: [FIREBASE_CONFIG_GUIDE.md](FIREBASE_CONFIG_GUIDE.md)
- 📋 Template de config: [CONFIG_TEMPLATE.md](CONFIG_TEMPLATE.md)
- 🔧 Setup Backend: [backend/src/config/FIREBASE_SETUP.md](backend/src/config/FIREBASE_SETUP.md)

---

## 🎯 Fonctionnalités disponibles

Une fois configuré :

✅ **Inscription** en ligne avec Firebase  
✅ **Connexion** en ligne avec Firebase  
✅ **Profil utilisateur** dans Firestore  
✅ **Mode hors ligne** (fallback PostgreSQL)  
✅ **Synchronisation automatique**  

---

## 🐛 Problèmes ?

### ❌ "Firebase non configuré"
➡️ Vérifiez que `firebase-service-account.json` est dans `backend/src/config/`

### ❌ "Invalid API key"
➡️ Vérifiez que vous avez copié la bonne clé dans les fichiers environment

### ❌ "Network error"
➡️ Assurez-vous que le backend tourne sur http://localhost:3000

---

## 💡 Aide rapide

**Où trouver vos clés ?**
- Console Firebase → ⚙️ Paramètres du projet

**Fichiers à modifier :**
1. `mobile-app/src/environments/environment.ts`
2. `mobile-app/src/environments/environment.prod.ts`
3. `web-app/src/config/firebase.js`
4. `backend/src/config/firebase-service-account.json` (créer)

**Commandes utiles :**
```bash
npm run check-firebase  # Vérifier la config
cd backend && npm start  # Démarrer le backend
cd web-app && npm start  # Démarrer le web
cd mobile-app && ionic serve  # Démarrer le mobile
```

---

**🎉 Bon développement !**
