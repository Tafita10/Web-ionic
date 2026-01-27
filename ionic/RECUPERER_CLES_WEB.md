# 🔑 Récupérer les Clés Web Firebase - Guide Rapide

## ✅ Déjà fait

- ✅ Clé Admin Backend configurée (firebase-service-account.json)
- ✅ Project ID configuré : **fir-7bee4**
- ✅ authDomain configuré : **fir-7bee4.firebaseapp.com**
- ✅ storageBucket configuré : **fir-7bee4.appspot.com**

## ⚠️ Clés à récupérer

Il vous manque **3 valeurs** pour finaliser la configuration :

1. **apiKey**
2. **messagingSenderId**
3. **appId**

---

## 🚀 Comment les récupérer (2 minutes)

### Étape 1 : Ouvrir Firebase Console

```
https://console.firebase.google.com/
```

### Étape 2 : Sélectionner votre projet

```
Projet : fir-7bee4
```

### Étape 3 : Aller dans Paramètres

```
Cliquer sur l'icône ⚙️ (engrenage) en haut à gauche
→ Paramètres du projet
```

### Étape 4 : Afficher la configuration Web

```
Descendre jusqu'à "Vos applications"

SI AUCUNE APPLICATION WEB :
→ Cliquer sur "</>" (icône Web)
→ Surnom : "Cloud P17 App"
→ Cocher "Configurer Firebase Hosting" (optionnel)
→ Enregistrer l'application

SI UNE APPLICATION WEB EXISTE DÉJÀ :
→ Elle s'affiche dans la liste
→ Faire défiler pour voir "SDK Firebase"
```

### Étape 5 : Copier la configuration

Vous verrez quelque chose comme :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",          // ← Copier
  authDomain: "fir-7bee4.firebaseapp.com",
  projectId: "fir-7bee4",
  storageBucket: "fir-7bee4.appspot.com",
  messagingSenderId: "123456789012",                   // ← Copier
  appId: "1:123456789012:web:abcdef1234567890"        // ← Copier
};
```

---

## 📝 Où coller ces valeurs

### 1. Mobile App (Development)

**Fichier** : `mobile-app/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSy...",                    // ← Collez ici
    authDomain: "fir-7bee4.firebaseapp.com",
    projectId: "fir-7bee4",
    storageBucket: "fir-7bee4.appspot.com",
    messagingSenderId: "123456789012",      // ← Collez ici
    appId: "1:123456789012:web:abcdef"     // ← Collez ici
  },
  apiUrl: 'http://localhost:3000/api'
};
```

### 2. Mobile App (Production)

**Fichier** : `mobile-app/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSy...",                    // ← Collez ici
    authDomain: "fir-7bee4.firebaseapp.com",
    projectId: "fir-7bee4",
    storageBucket: "fir-7bee4.appspot.com",
    messagingSenderId: "123456789012",      // ← Collez ici
    appId: "1:123456789012:web:abcdef"     // ← Collez ici
  },
  apiUrl: 'https://votre-backend.com/api'
};
```

### 3. Web App

**Fichier** : `web-app/src/config/firebase.js`

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSy...",                    // ← Collez ici
  authDomain: "fir-7bee4.firebaseapp.com",
  projectId: "fir-7bee4",
  storageBucket: "fir-7bee4.appspot.com",
  messagingSenderId: "123456789012",      // ← Collez ici
  appId: "1:123456789012:web:abcdef"     // ← Collez ici
};
```

---

## ✅ Vérifier la configuration

Après avoir collé les valeurs :

```powershell
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

## 🚀 Prochaine étape : Migrer les données

Une fois la configuration complète :

```powershell
cd backend
npm install
npm run migrate:firebase
```

---

## 💡 Aide Visuelle

### Capture d'écran de Firebase Console

```
Firebase Console
├── ⚙️ Paramètres du projet
│   ├── Général
│   │   ├── Vos applications
│   │   │   └── 📱 Application Web
│   │   │       └── SDK Firebase
│   │   │           └── firebaseConfig { ... }  ← Ici !
```

---

## 🔒 Sécurité

⚠️ **Important** :
- L'`apiKey` n'est PAS secret (c'est normal qu'il soit dans le code client)
- La sécurité est gérée par les règles Firestore
- Ne commitez JAMAIS `firebase-service-account.json` (déjà dans .gitignore)

---

## 🆘 Problèmes ?

### "Je ne trouve pas mes applications dans Firebase Console"

**Solution** : Créez une nouvelle application Web :
```
Firebase Console → ⚙️ Paramètres → Vos applications
→ Ajouter une application → </> Web
```

### "J'ai plusieurs applications Web"

**Solution** : Utilisez n'importe laquelle, ou créez-en une spécifique pour ce projet.

### "Les valeurs changent-elles ?"

**Non** : Une fois créées, ces valeurs restent fixes pour votre projet.

---

## 📞 Contact

Si vous avez besoin d'aide, consultez :
- [FIREBASE_CONFIG_GUIDE.md](../FIREBASE_CONFIG_GUIDE.md)
- [QUICK_START_FIREBASE.md](../QUICK_START_FIREBASE.md)

---

**🎯 Une fois les 3 clés ajoutées, vous pourrez migrer vos données ! 🚀**
