# ✅ Credentials Firebase configurées

Le fichier `firebase-credentials.json` est correct et Firebase Admin SDK s'initialise.

## ❌ Problème actuel : Firestore non activé

L'erreur `16 UNAUTHENTICATED` signifie que **Firestore Database n'est pas encore créée** dans ton projet Firebase.

## 🛠️ Solution : Activer Firestore

### Étape 1 : Créer Firestore Database

1. Va sur https://console.firebase.google.com/project/fir-7bee4/firestore
2. Clique sur **"Créer une base de données"**
3. Sélectionne **"Démarrer en mode test"** (on sécurisera après)
4. Choisis un emplacement proche : **"europe-west"** ou **"us-central"**
5. Clique sur **"Activer"**

### Étape 2 : Créer la collection "signalements"

1. Dans Firestore, clique sur **"Démarrer une collection"**
2. ID de collection : `signalements`
3. Ajoute un document de test :
   ```
   userId: "test123"
   userEmail: "test@example.com"
   latitude: -18.8792
   longitude: 47.5079
   description: "Test signalement"
   status: "nouveau"
   createdAt: [timestamp actuel]
   ```

### Étape 3 : Retester

```powershell
cd d:\web_rojo\api
node test-firebase.js
```

Tu devrais voir :
```
✅ Firebase Admin initialisé
📖 Test lecture Firestore...
✅ 1 document(s) trouvé(s)
  - Document xxx: { userId: 'test123', ... }
✅ Connexion Firebase OK !
```

## 📝 Règles de sécurité Firestore (après activation)

Une fois Firestore créée, configure les règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /signalements/{signalementId} {
      allow read, write: if true;  // Mode test
    }
  }
}
```

Pour la production, remplace par les règles sécurisées fournies dans le guide Firebase.
