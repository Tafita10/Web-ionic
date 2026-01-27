# 🔥 Template de Configuration Firebase

## 📋 Checklist de Configuration

- [ ] Créer un projet Firebase sur https://console.firebase.google.com/
- [ ] Activer Authentication (Email/Password)
- [ ] Activer Firestore Database
- [ ] Récupérer la configuration Web
- [ ] Télécharger la clé privée pour le backend
- [ ] Configurer les fichiers listés ci-dessous

---

## 📱 Configuration Mobile App

**Fichier:** `mobile-app/src/environments/environment.ts`
**Fichier:** `mobile-app/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: false, // true pour environment.prod.ts
  firebaseConfig: {
    apiKey: "AIzaSy...", // ← Votre API Key ici
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet-id",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  },
  apiUrl: 'http://localhost:3000/api' // URL de votre backend
};
```

---

## 🌐 Configuration Web App

**Fichier:** `web-app/src/config/firebase.js`

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSy...", // ← Votre API Key ici
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

---

## 🔧 Configuration Backend

**Fichier:** `backend/src/config/firebase-service-account.json`

Ce fichier doit être téléchargé depuis Firebase Console :
- Paramètres du projet → Comptes de service → Générer une nouvelle clé privée

Le fichier ressemblera à :

```json
{
  "type": "service_account",
  "project_id": "votre-projet-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...@votre-projet-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

⚠️ **NE JAMAIS COMMITTER CE FICHIER DANS GIT !**

---

## 🎯 Où trouver chaque valeur dans Firebase Console

| Valeur | Où la trouver |
|--------|---------------|
| `apiKey` | Paramètres du projet → Applications → Config Web |
| `authDomain` | Paramètres du projet → Applications → Config Web |
| `projectId` | Paramètres du projet → Général |
| `storageBucket` | Paramètres du projet → Applications → Config Web |
| `messagingSenderId` | Paramètres du projet → Cloud Messaging |
| `appId` | Paramètres du projet → Applications → Config Web |
| Service Account JSON | Paramètres du projet → Comptes de service → Générer une clé |

---

## ✅ Validation de la configuration

### 1. Tester le Backend

```bash
cd backend
npm start
```

✅ Vous devriez voir : "Firebase Admin SDK initialisé avec succès"

### 2. Tester l'inscription

Utilisez Postman ou curl :

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "displayName": "Test User"
  }'
```

### 3. Vérifier dans Firebase Console

- Authentication → Utilisateurs : Vérifiez que l'utilisateur apparaît
- Firestore → Data : Vérifiez que le profil est créé dans la collection "users"

---

## 🐛 Problèmes courants

### "Firebase n'est pas initialisé"
➡️ Le fichier `firebase-service-account.json` n'est pas au bon endroit

### "Invalid API key"
➡️ Vérifiez que vous avez copié la bonne clé depuis Firebase Console

### "CORS error"
➡️ Vérifiez que le backend est bien démarré et accessible

### "Network request failed"
➡️ Vérifiez l'URL de l'API dans les fichiers de configuration

---

## 📚 Documentation

- [Firebase Console](https://console.firebase.google.com/)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
