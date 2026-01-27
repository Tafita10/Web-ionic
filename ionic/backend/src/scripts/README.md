# 🔄 Scripts de Migration Firebase

Ce dossier contient les scripts pour migrer les données vers Firebase.

---

## 📜 Scripts Disponibles

### `migrate-to-firebase.js`

**Description :** Script principal de migration des données du projet Cloud P17 vers Firebase Firestore.

**Fonctionnalités :**
- ✅ Création des collections Firestore
- ✅ Création des utilisateurs dans Firebase Authentication
- ✅ Migration des données de référence (villes, routes, entreprises, etc.)
- ✅ Migration des signalements
- ✅ Gestion des doublons
- ✅ Rapport détaillé de la migration

---

## 🚀 Utilisation

### Méthode 1 : npm script (Recommandée)

```bash
cd backend
npm run migrate:firebase
```

### Méthode 2 : Node direct

```bash
cd backend
node src/scripts/migrate-to-firebase.js
```

---

## 📋 Prérequis

### 1. Configuration Firebase

Le fichier `backend/src/config/firebase-service-account.json` doit exister et être valide.

**Comment l'obtenir :**
1. Firebase Console → Paramètres du projet
2. Comptes de service
3. Générer une nouvelle clé privée
4. Renommer et placer dans `backend/src/config/`

### 2. Dépendances installées

```bash
npm install
```

Les dépendances requises :
- `firebase-admin` : SDK Firebase pour Node.js

---

## 📊 Données Migrées

### Collections Firestore

| Collection | Documents | Source |
|------------|-----------|--------|
| type_users | 3 | Types d'utilisateurs système |
| status | 3 | Statuts des signalements |
| villes | 3 | Villes de Madagascar |
| routes | 5 | Routes d'Antananarivo |
| entreprises | 4 | Entreprises de construction |
| users | 4 | Profils utilisateurs |
| signalements | 5 | Signalements de test |

**Total : 27 documents**

### Utilisateurs Firebase Authentication

4 utilisateurs créés avec leurs profils Firestore :

1. **Manager** (manager@example.com)
   - Mot de passe : `Manager123!`
   - Rôle : manager
   - Peut enrichir les signalements

2. **User1** (user1@example.com)
   - Mot de passe : `User123!`
   - Rôle : user
   - Jean Rakoto

3. **User2** (user2@example.com)
   - Mot de passe : `User123!`
   - Rôle : user
   - Marie Rabe

4. **User3** (user3@example.com)
   - Mot de passe : `User123!`
   - Rôle : user
   - Paul Randria

---

## 🔍 Sortie du Script

### Exemple de sortie réussie

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
   ✅ Utilisateur créé: manager@example.com (UID: kPQR...)
   ✅ Utilisateur créé: user1@example.com (UID: aBcD...)
   ✅ Utilisateur créé: user2@example.com (UID: xYz1...)
   ✅ Utilisateur créé: user3@example.com (UID: mN0P...)
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
⏱️  Durée: 3.24s
═══════════════════════════════════════════════════════

🎉 Migration terminée avec succès !
```

---

## ⚠️ Gestion des Erreurs

### Utilisateur existe déjà

```
⚠️  Utilisateur existe déjà: user1@example.com
```

**Comportement :** Le script continue sans erreur et réutilise l'UID existant.

### Fichier de configuration manquant

```
❌ Erreur: fichier firebase-service-account.json manquant
📄 Créez: backend/src/config/firebase-service-account.json
```

**Solution :** Téléchargez la clé depuis Firebase Console.

### Erreur de permission

```
❌ Erreur insertion: Permission denied
```

**Solution :** Activez le mode "Test" dans les règles Firestore :

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Important :** Sécurisez les règles après la migration !

---

## 🔄 Réexécuter la Migration

### Comportement

Le script peut être réexécuté sans problème :
- ✅ Les utilisateurs existants sont détectés et réutilisés
- ✅ Les documents existants sont écrasés (pas de duplication)
- ✅ La structure des documents est mise à jour

### Nettoyage complet (Optionnel)

Si vous voulez tout recommencer :

1. **Supprimer les utilisateurs** :
   - Firebase Console → Authentication → Utilisateurs
   - Sélectionner tous → Supprimer

2. **Supprimer les collections** :
   - Firebase Console → Firestore → Data
   - Pour chaque collection → ⋮ → Supprimer la collection

---

## 📝 Personnalisation

### Ajouter des données

Modifiez les tableaux de données dans `migrate-to-firebase.js` :

```javascript
// Ajouter une ville
const villes = [
  // ... villes existantes
  { 
    id: 4, 
    nom: 'Mahajanga', 
    latitude: -15.7167, 
    longitude: 46.3167, 
    code_postal: '401', 
    pays: 'Madagascar' 
  }
];

// Ajouter un utilisateur
const users = [
  // ... utilisateurs existants
  {
    id: 5,
    email: 'newuser@example.com',
    nom: 'Nouveau',
    prenom: 'Utilisateur',
    type_user_id: 2,
    role: 'user',
    telephone: '+261 32 44 444 44',
    password: 'User123!'
  }
];
```

### Modifier les timestamps

```javascript
// Dans la fonction migrateCollection
docData.createdAt = admin.firestore.Timestamp.fromDate(new Date('2024-01-01'));
```

---

## 🧪 Tests

### Vérifier que la migration a fonctionné

```bash
# Tester la connexion avec un utilisateur
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"User123!"}'
```

### Vérifier dans Firebase Console

1. **Authentication** : https://console.firebase.google.com/
   - Aller dans votre projet
   - Authentication → Utilisateurs
   - Vérifier que 4 utilisateurs sont présents

2. **Firestore** :
   - Firestore Database → Data
   - Vérifier les 7 collections

---

## 📚 Documentation

- **Guide complet** : [../MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)
- **Configuration Firebase** : [../../FIREBASE_CONFIG_GUIDE.md](../../FIREBASE_CONFIG_GUIDE.md)
- **Résumé** : [../../FIREBASE_MIGRATION_SUMMARY.md](../../FIREBASE_MIGRATION_SUMMARY.md)

---

## 🛠️ Maintenance

### Ajouter un nouveau script

1. Créer `nouveau-script.js` dans ce dossier
2. Ajouter dans `package.json` :
   ```json
   "scripts": {
     "nouveau-script": "node src/scripts/nouveau-script.js"
   }
   ```

### Structure recommandée

```javascript
#!/usr/bin/env node

const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase
const serviceAccount = require('../config/firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main() {
  try {
    // Votre logique ici
    console.log('✅ Script terminé');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
```

---

## ⚡ Commandes Rapides

```bash
# Migrer les données
npm run migrate:firebase

# Voir le code du script
cat src/scripts/migrate-to-firebase.js

# Tester Firebase Admin SDK
node -e "const admin = require('firebase-admin'); console.log(admin.SDK_VERSION)"
```

---

**🎉 Bon développement !**
