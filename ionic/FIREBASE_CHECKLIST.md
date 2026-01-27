# ✅ Checklist Configuration Firebase

Utilisez cette checklist pour suivre votre progression dans la configuration de Firebase.

## 📋 Étape 1 : Firebase Console

- [ ] Créer un compte Google (si nécessaire)
- [ ] Créer un nouveau projet Firebase sur https://console.firebase.google.com/
- [ ] Activer **Authentication** → Sign-in method → **Email/Password** ✅
- [ ] Activer **Firestore Database** (mode test pour commencer)
- [ ] Noter le **Project ID** : `____________________`

## 🔑 Étape 2 : Récupérer les Clés

### Configuration Web/Mobile (Client SDK)

- [ ] Aller dans ⚙️ **Paramètres du projet** → **Général**
- [ ] Cliquer sur **Ajouter une application** → Icône **Web** (</>)
- [ ] Copier la configuration Firebase

```
apiKey: _______________________________________
authDomain: ____________________________________
projectId: _____________________________________
storageBucket: _________________________________
messagingSenderId: _____________________________
appId: _________________________________________
```

### Configuration Backend (Admin SDK)

- [ ] Aller dans ⚙️ **Paramètres du projet** → **Comptes de service**
- [ ] Cliquer sur **Générer une nouvelle clé privée**
- [ ] Télécharger le fichier JSON
- [ ] Renommer en `firebase-service-account.json`

## 📝 Étape 3 : Configuration des Fichiers

### Mobile App (Ionic/Angular)

- [ ] Ouvrir `mobile-app/src/environments/environment.ts`
- [ ] Remplacer `VOTRE_API_KEY` par votre vraie clé
- [ ] Remplacer toutes les autres valeurs Firebase
- [ ] Vérifier que `apiUrl` pointe vers `http://localhost:3000/api`

**✅ Configuration Dev complète**

- [ ] Ouvrir `mobile-app/src/environments/environment.prod.ts`
- [ ] Faire la même chose pour la production
- [ ] Modifier `apiUrl` pour l'URL de production

**✅ Configuration Prod complète**

### Web App (React)

- [ ] Ouvrir `web-app/src/config/firebase.js`
- [ ] Remplacer `VOTRE_API_KEY` par votre vraie clé
- [ ] Remplacer toutes les autres valeurs Firebase
- [ ] Vérifier `API_URL`

**✅ Configuration Web complète**

### Backend (Node.js)

- [ ] Copier `firebase-service-account.json` dans `backend/src/config/`
- [ ] Vérifier que le fichier est au bon endroit
- [ ] Vérifier que `.gitignore` contient `firebase-service-account.json`

**✅ Configuration Backend complète**

### Variables d'Environnement (Optionnel)

- [ ] Copier `backend/.env.example` en `backend/.env`
- [ ] Remplir les variables (DB_PASSWORD, JWT_SECRET, etc.)
- [ ] Copier `web-app/.env.example` en `web-app/.env` (optionnel)

**✅ Variables d'environnement configurées**

## ✅ Étape 4 : Vérification

### Test de Configuration

- [ ] Exécuter `npm run check-firebase` à la racine du projet
- [ ] Vérifier qu'il n'y a pas d'erreurs ❌
- [ ] Résoudre les avertissements ⚠️ s'il y en a

**✅ Configuration validée**

### Installation des Dépendances

```bash
# Backend
cd backend
npm install
```
- [ ] Backend : dépendances installées

```bash
# Web App
cd web-app
npm install
```
- [ ] Web : dépendances installées

```bash
# Mobile App
cd mobile-app
npm install
```
- [ ] Mobile : dépendances installées

## 🚀 Étape 5 : Lancement et Tests

### Démarrer le Backend

```bash
cd backend
npm start
```

- [ ] Backend démarre sans erreur
- [ ] Message affiché : "✅ Firebase Admin SDK initialisé avec succès"
- [ ] Serveur écoute sur port 3000
- [ ] Pas d'erreur dans les logs

**✅ Backend opérationnel**

### Tester l'Application Web

```bash
cd web-app
npm start
```

- [ ] Application démarre sur http://localhost:3000
- [ ] Page de connexion s'affiche
- [ ] Pas d'erreur dans la console browser (F12)

**Test d'inscription Web :**
- [ ] Cliquer sur "S'inscrire" ou "Register"
- [ ] Remplir le formulaire (email + mot de passe)
- [ ] Soumettre le formulaire
- [ ] Inscription réussie (redirection ou message)
- [ ] Pas d'erreur dans la console

**✅ Web App fonctionnelle**

### Tester l'Application Mobile

```bash
cd mobile-app
ionic serve
```

- [ ] Application démarre sur http://localhost:8100
- [ ] Page de connexion s'affiche
- [ ] Pas d'erreur dans la console

**Test d'inscription Mobile :**
- [ ] Aller sur la page d'inscription
- [ ] Remplir le formulaire
- [ ] Soumettre
- [ ] Inscription réussie

**✅ Mobile App fonctionnelle**

## 🔍 Étape 6 : Vérification Firebase Console

### Authentication

- [ ] Ouvrir Firebase Console → **Authentication** → **Utilisateurs**
- [ ] Vérifier que le nouvel utilisateur apparaît dans la liste
- [ ] Vérifier l'email et la date de création

**✅ Utilisateur créé dans Firebase Auth**

### Firestore Database

- [ ] Ouvrir Firebase Console → **Firestore Database** → **Data**
- [ ] Vérifier qu'une collection **"users"** existe
- [ ] Cliquer sur la collection
- [ ] Vérifier qu'un document avec l'UID de l'utilisateur existe
- [ ] Vérifier les champs : email, displayName, createdAt, updatedAt

**✅ Profil créé dans Firestore**

### Test de Connexion

**Web App :**
- [ ] Aller sur la page de connexion
- [ ] Se connecter avec l'utilisateur créé
- [ ] Connexion réussie
- [ ] Voir le profil ou la page d'accueil

**Mobile App :**
- [ ] Aller sur la page de connexion
- [ ] Se connecter avec l'utilisateur créé
- [ ] Connexion réussie

**✅ Authentification fonctionnelle**

## 🧪 Étape 7 : Tests Avancés (Optionnel)

### Test Mode Hors Ligne

**Mobile App :**
- [ ] Désactiver le WiFi/données mobiles
- [ ] Essayer de s'inscrire → Devrait utiliser le backend local
- [ ] Réactiver la connexion
- [ ] Se connecter → Devrait utiliser Firebase

**✅ Mode offline fonctionnel**

### Test API Backend Direct

Avec curl ou Postman :

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"Test123!","displayName":"Test User 2"}'
```

- [ ] Requête réussie (code 200/201)
- [ ] Réponse contient l'utilisateur
- [ ] Utilisateur visible dans Firebase Console

**✅ API Backend fonctionnelle**

## 📊 Récapitulatif Final

### Configuration
- [ ] Firebase Console configuré
- [ ] Authentication activé
- [ ] Firestore activé
- [ ] Clés récupérées
- [ ] Fichiers configurés

### Applications
- [ ] Backend opérationnel
- [ ] Web App fonctionnelle
- [ ] Mobile App fonctionnelle

### Tests
- [ ] Inscription testée
- [ ] Connexion testée
- [ ] Profil créé dans Firestore
- [ ] Utilisateur dans Firebase Auth

---

## 🎉 Félicitations !

Si toutes les cases sont cochées ✅, votre application est **100% fonctionnelle** avec Firebase !

## 📚 Documentation

- 📖 Guide détaillé : [FIREBASE_CONFIG_GUIDE.md](FIREBASE_CONFIG_GUIDE.md)
- 🚀 Démarrage rapide : [QUICK_START_FIREBASE.md](QUICK_START_FIREBASE.md)
- 🏗️ Architecture : [ARCHITECTURE_FIREBASE.md](ARCHITECTURE_FIREBASE.md)
- 📋 Templates : [CONFIG_TEMPLATE.md](CONFIG_TEMPLATE.md)

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs du backend
2. Ouvrez la console du navigateur (F12)
3. Consultez la section "Résolution de problèmes" dans [FIREBASE_CONFIG_GUIDE.md](FIREBASE_CONFIG_GUIDE.md)
4. Vérifiez que toutes les dépendances sont installées (`npm install`)
5. Assurez-vous que les ports 3000 et 8100 ne sont pas utilisés

---

**Date de complétion : _______________**

**Signature : _______________**
