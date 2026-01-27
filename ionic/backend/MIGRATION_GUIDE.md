# 🔄 Guide de Migration des Données vers Firebase

Ce guide vous explique comment migrer les données du script SQL vers Firebase Firestore.

---

## 📋 Prérequis

✅ Firebase configuré (voir [FIREBASE_CONFIG_GUIDE.md](../FIREBASE_CONFIG_GUIDE.md))  
✅ Fichier `backend/src/config/firebase-service-account.json` présent  
✅ Backend configuré et dépendances installées  

---

## 🚀 Étape 1 : Préparer l'environnement

### Installer les dépendances

```bash
cd backend
npm install
```

### Vérifier la configuration Firebase

```bash
# À la racine du projet
npm run check-firebase
```

✅ Le fichier `firebase-service-account.json` doit être présent et valide.

---

## 🔥 Étape 2 : Exécuter la migration

### Commande rapide

```bash
cd backend
npm run migrate:firebase
```

### OU manuellement

```bash
cd backend
node src/scripts/migrate-to-firebase.js
```

---

## 📊 Qu'est-ce qui sera migré ?

Le script va créer les collections suivantes dans Firebase Firestore :

### 1. **type_users** (3 documents)
- Visiteur
- Utilisateur  
- Manager

### 2. **status** (3 documents)
- Nouveau (🔴 #FF0000)
- En cours (🟠 #FFA500)
- Terminé (🟢 #00FF00)

### 3. **villes** (3 documents)
- Antananarivo
- Antsirabe
- Toamasina

### 4. **routes** (5 documents)
- Avenue de l'Indépendance
- Rue Rainitovo
- Boulevard Ratsimilaho
- Route Digue
- Avenue Général de Gaulle

### 5. **entreprises** (4 documents)
- Entreprise Municipal Antananarivo
- BTP Madagascar SARL
- TravPublic SA
- Construction Route Nationale

### 6. **users** (4 utilisateurs créés)

Dans **Firebase Authentication** :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| manager@example.com | Manager123! | manager |
| user1@example.com | User123! | user |
| user2@example.com | User123! | user |
| user3@example.com | User123! | user |

Dans **Firestore** (collection `users`) :
- Profils utilisateurs avec nom, prénom, téléphone, rôle

### 7. **signalements** (5 documents)
- 5 signalements de test à Antananarivo
- Avec différents statuts (Nouveau, En cours, Terminé)
- Certains enrichis avec budget, surface, entreprise

---

## ✅ Étape 3 : Vérifier la migration

### Dans la Console Firebase

1. **Ouvrir Firebase Console** : https://console.firebase.google.com/
2. **Sélectionner votre projet**

### Vérifier les utilisateurs (Authentication)

3. Aller dans **Authentication** → **Utilisateurs**
4. Vous devriez voir **4 utilisateurs** :
   - ✅ manager@example.com
   - ✅ user1@example.com
   - ✅ user2@example.com
   - ✅ user3@example.com

### Vérifier les données (Firestore)

5. Aller dans **Firestore Database** → **Data**
6. Vous devriez voir **7 collections** :
   - ✅ type_users (3 docs)
   - ✅ status (3 docs)
   - ✅ villes (3 docs)
   - ✅ routes (5 docs)
   - ✅ entreprises (4 docs)
   - ✅ users (4 docs)
   - ✅ signalements (5 docs)

---

## 🧪 Étape 4 : Tester l'application

### Se connecter avec un utilisateur test

#### 1. Démarrer le backend
```bash
cd backend
npm start
```

#### 2. Démarrer l'application Web
```bash
cd web-app
npm start
```

#### 3. Se connecter
- Allez sur http://localhost:3000/login
- Utilisez :
  - **Email** : `user1@example.com`
  - **Mot de passe** : `User123!`

#### 4. Tester l'application mobile
```bash
cd mobile-app
ionic serve
```

- Allez sur http://localhost:8100/login
- Utilisez les mêmes identifiants

---

## 📊 Sortie du script

Lors de l'exécution, vous verrez :

```
🔥 Connexion à Firebase réussie
📊 Démarrage de la migration...

═══════════════════════════════════════════════════════
🚀 MIGRATION DES DONNÉES VERS FIREBASE FIRESTORE
   Projet: Cloud P17 - Signalement Routier
═══════════════════════════════════════════════════════

📦 Migration de la collection "type_users"...
   ✅ 3/3 documents insérés
   ✅ Collection "type_users" migrée: 3 succès, 0 erreurs

📦 Migration de la collection "status"...
   ✅ 3/3 documents insérés
   ✅ Collection "status" migrée: 3 succès, 0 erreurs

📦 Migration de la collection "villes"...
   ✅ 3/3 documents insérés
   ✅ Collection "villes" migrée: 3 succès, 0 erreurs

📦 Migration de la collection "routes"...
   ✅ 5/5 documents insérés
   ✅ Collection "routes" migrée: 5 succès, 0 erreurs

📦 Migration de la collection "entreprises"...
   ✅ 4/4 documents insérés
   ✅ Collection "entreprises" migrée: 4 succès, 0 erreurs

👤 Création des utilisateurs Firebase Authentication...
   ✅ Utilisateur créé: manager@example.com (UID: abc123...)
   ✅ Utilisateur créé: user1@example.com (UID: def456...)
   ✅ Utilisateur créé: user2@example.com (UID: ghi789...)
   ✅ Utilisateur créé: user3@example.com (UID: jkl012...)
   ✅ Utilisateurs créés: 4 succès, 0 erreurs

📍 Migration des signalements...
   ✅ 5/5 signalements insérés
   ✅ Signalements migrés: 5 succès, 0 erreurs

═══════════════════════════════════════════════════════
📊 RÉSUMÉ DE LA MIGRATION
═══════════════════════════════════════════════════════
✅ Total documents: 27
✅ Succès: 27
❌ Erreurs: 0
⏱️  Durée: 3.45s
═══════════════════════════════════════════════════════

🎉 Migration terminée avec succès !

📋 Collections créées dans Firestore:
   • type_users
   • status
   • villes
   • routes
   • entreprises
   • users
   • signalements

👤 Utilisateurs créés dans Firebase Authentication:
   • manager@example.com (manager) - Mot de passe: Manager123!
   • user1@example.com (user) - Mot de passe: User123!
   • user2@example.com (user) - Mot de passe: User123!
   • user3@example.com (user) - Mot de passe: User123!

🔍 Vérifiez vos données:
   Firebase Console → Authentication → Utilisateurs
   Firebase Console → Firestore → Data

✅ Vous pouvez maintenant utiliser votre application !
```

---

## 🔄 Réexécuter la migration

### Si les utilisateurs existent déjà

Le script détecte automatiquement si un utilisateur existe et :
- ⚠️  Affiche un avertissement
- ✅ Continue la migration sans erreur

### Pour tout réinitialiser

#### Option 1 : Via Firebase Console (Recommandé)

1. **Supprimer les utilisateurs** :
   - Firebase Console → Authentication → Utilisateurs
   - Sélectionner tous → Supprimer

2. **Supprimer les collections** :
   - Firebase Console → Firestore → Data
   - Pour chaque collection → Options (⋮) → Supprimer la collection

#### Option 2 : Script de nettoyage (Avancé)

Créez un script `clean-firebase.js` :

```javascript
const admin = require('firebase-admin');
// ... initialiser Firebase Admin

async function cleanFirebase() {
  // Supprimer toutes les collections
  const collections = ['type_users', 'status', 'villes', 'routes', 
                       'entreprises', 'users', 'signalements'];
  
  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✅ Collection ${col} nettoyée`);
  }
}
```

---

## 🐛 Résolution de Problèmes

### Erreur : "firebase-service-account.json manquant"

➡️ **Solution** : 
```bash
# Vérifier le fichier
ls backend/src/config/firebase-service-account.json

# Si manquant, consultez FIREBASE_CONFIG_GUIDE.md
```

### Erreur : "Email already exists"

➡️ **C'est normal !** Le script gère automatiquement les utilisateurs existants.

### Erreur : "Permission denied"

➡️ **Solution** : Vérifiez les règles Firestore :

```javascript
// Règles Firestore temporaires pour la migration
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ Développement uniquement !
    }
  }
}
```

⚠️ **Important** : Sécurisez vos règles après la migration !

### Erreur : "Network error"

➡️ **Solution** : Vérifiez votre connexion Internet

---

## 📈 Après la Migration

### 1. Configurer les règles de sécurité Firestore

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    // Les utilisateurs peuvent lire leurs propres données
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Les signalements sont visibles par tous les utilisateurs authentifiés
    match /signalements/{signalementId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.user_uid == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager');
    }
    
    // Collections de référence en lecture seule
    match /{collection}/{document} {
      allow read: if request.auth != null && 
        collection in ['type_users', 'status', 'villes', 'routes', 'entreprises'];
    }
  }
}
```

### 2. Activer l'indexation (si nécessaire)

Firebase vous suggérera automatiquement les index nécessaires lors de l'utilisation de l'application.

### 3. Tester toutes les fonctionnalités

- ✅ Inscription
- ✅ Connexion
- ✅ Création de signalement
- ✅ Modification de signalement
- ✅ Affichage de la liste
- ✅ Profil utilisateur

---

## 🎯 Commandes Utiles

```bash
# Migrer les données
npm run migrate:firebase

# Vérifier la config Firebase
npm run check-firebase

# Démarrer le backend
npm start

# Voir les logs Firebase (si Functions déployées)
firebase functions:log
```

---

## 📚 Ressources

- [FIREBASE_CONFIG_GUIDE.md](../FIREBASE_CONFIG_GUIDE.md) - Configuration complète
- [QUICK_START_FIREBASE.md](../QUICK_START_FIREBASE.md) - Démarrage rapide
- [COMMANDS_CHEATSHEET.md](../COMMANDS_CHEATSHEET.md) - Toutes les commandes
- [Firebase Console](https://console.firebase.google.com/)

---

**🎉 Félicitations ! Vos données sont maintenant dans Firebase !**
