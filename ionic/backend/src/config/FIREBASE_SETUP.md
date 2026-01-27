# Guide de Configuration Firebase

## Étapes pour configurer Firebase

1. **Créer un projet Firebase**
   - Allez sur https://console.firebase.google.com/
   - Cliquez sur "Ajouter un projet"
   - Suivez les étapes de création

2. **Activer l'authentification par email/password**
   - Dans votre projet Firebase, allez dans "Authentication"
   - Cliquez sur "Commencer"
   - Dans l'onglet "Sign-in method", activez "Email/Password"

3. **Activer Firestore**
   - Allez dans "Firestore Database"
   - Cliquez sur "Créer une base de données"
   - Choisissez le mode (production ou test)

4. **Télécharger la clé privée pour le backend**
   - Allez dans "Paramètres du projet" (icône engrenage)
   - Onglet "Comptes de service"
   - Cliquez sur "Générer une nouvelle clé privée"
   - Enregistrez le fichier JSON dans `backend/src/config/firebase-service-account.json`

5. **Récupérer la configuration pour les apps (mobile & web)**
   - Toujours dans "Paramètres du projet"
   - Onglet "Général"
   - Dans "Vos applications", ajoutez une application Web
   - Copiez la configuration (apiKey, authDomain, etc.)

## Configuration Backend

Le fichier `firebase-service-account.json` doit être placé dans:
```
backend/src/config/firebase-service-account.json
```

## Configuration Frontend

Créez un fichier avec les informations de configuration:
```javascript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "votre-app-id"
};
```
