# 🛠️ Commandes Utiles - Firebase & Développement

Ce document regroupe toutes les commandes utiles pour développer avec Firebase.

---

## 🔍 Vérification de Configuration

### Vérifier la configuration Firebase
```bash
npm run check-firebase
```

### Vérifier les variables d'environnement (Backend)
```bash
cd backend
cat .env
```

### Vérifier que Firebase est initialisé (Backend)
```bash
cd backend
npm start
# Cherchez : "✅ Firebase Admin SDK initialisé avec succès"
```

---

## 📦 Installation des Dépendances

### Tout installer en une fois
```bash
# À la racine du projet
cd backend && npm install && cd ../web-app && npm install && cd ../mobile-app && npm install && cd ..
```

### Backend uniquement
```bash
cd backend
npm install
```

### Web App uniquement
```bash
cd web-app
npm install
```

### Mobile App uniquement
```bash
cd mobile-app
npm install
```

---

## 🚀 Démarrage des Services

### Backend (Node.js + Express)
```bash
cd backend
npm start
# ou en mode développement (auto-reload)
npm run dev
```

### Web App (React)
```bash
cd web-app
npm start
# Ouvre http://localhost:3000
```

### Mobile App (Ionic)
```bash
cd mobile-app
ionic serve
# Ouvre http://localhost:8100
```

### Mobile App sur simulateur iOS (Mac uniquement)
```bash
cd mobile-app
ionic capacitor run ios --livereload --external
```

### Mobile App sur simulateur Android
```bash
cd mobile-app
ionic capacitor run android --livereload --external
```

---

## 🗄️ PostgreSQL (Base de données locale)

### Démarrer PostgreSQL avec Docker
```bash
docker-compose up -d
```

### Arrêter PostgreSQL
```bash
docker-compose down
```

### Se connecter à PostgreSQL
```bash
docker exec -it postgres_container psql -U ionic_user -d ionic_db
```

### Voir les utilisateurs dans la base
```sql
-- Une fois connecté à psql
SELECT * FROM users;
```

### Réinitialiser la base de données
```bash
docker-compose down -v
docker-compose up -d
```

---

## 🔥 Firebase CLI (Optionnel)

### Installer Firebase CLI
```bash
npm install -g firebase-tools
```

### Se connecter à Firebase
```bash
firebase login
```

### Lister vos projets Firebase
```bash
firebase projects:list
```

### Déployer les règles Firestore
```bash
firebase deploy --only firestore:rules
```

### Déployer les règles Storage
```bash
firebase deploy --only storage
```

### Voir les logs Firebase Functions
```bash
firebase functions:log
```

---

## 🧪 Tests et Débogage

### Tester l'inscription via API (curl)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "displayName": "Test User"
  }'
```

### Tester la connexion via API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Tester avec un token (remplacez YOUR_TOKEN)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Voir les logs du backend
```bash
cd backend
npm start
# Les logs s'affichent dans le terminal
```

### Voir les logs de l'app Web (console navigateur)
```
1. Ouvrir http://localhost:3000
2. Appuyer sur F12
3. Aller dans l'onglet "Console"
```

---

## 🔄 Mise à Jour et Nettoyage

### Mettre à jour les dépendances
```bash
# Backend
cd backend
npm update

# Web
cd web-app
npm update

# Mobile
cd mobile-app
npm update
```

### Nettoyer les node_modules et réinstaller
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Web
cd web-app
rm -rf node_modules package-lock.json
npm install

# Mobile
cd mobile-app
rm -rf node_modules package-lock.json
npm install
```

### Nettoyer le cache Ionic
```bash
cd mobile-app
ionic cache clean
```

---

## 📱 Build et Déploiement

### Build Web App (Production)
```bash
cd web-app
npm run build
# Les fichiers compilés sont dans web-app/build/
```

### Build Mobile App (iOS)
```bash
cd mobile-app
ionic capacitor build ios
```

### Build Mobile App (Android)
```bash
cd mobile-app
ionic capacitor build android
```

### Générer APK Android (Debug)
```bash
cd mobile-app
ionic capacitor build android
# Puis dans Android Studio : Build → Build Bundle(s) / APK(s) → Build APK(s)
```

---

## 🔍 Inspection et Monitoring

### Voir les utilisateurs Firebase (Console)
```
1. Ouvrir https://console.firebase.google.com/
2. Sélectionner votre projet
3. Aller dans "Authentication" → "Utilisateurs"
```

### Voir les données Firestore
```
1. Firebase Console → "Firestore Database" → "Data"
2. Explorer la collection "users"
```

### Monitorer les requêtes API (Backend)
```bash
cd backend
# Ajouter morgan pour logger les requêtes
npm install morgan
```

Puis dans `backend/src/server.js`:
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

---

## 🛠️ Développement Avancé

### Créer une nouvelle page Ionic
```bash
cd mobile-app
ionic generate page nom-de-la-page
```

### Créer un nouveau service Ionic
```bash
cd mobile-app
ionic generate service services/nom-du-service
```

### Créer un nouveau composant React
```bash
cd web-app/src/components
# Créer manuellement ou utiliser un générateur
```

### Ajouter une dépendance Firebase
```bash
# Backend (Admin SDK)
cd backend
npm install firebase-admin

# Web/Mobile (Client SDK)
npm install firebase
```

---

## 🐛 Résolution de Problèmes

### Erreur : "Port 3000 already in use"
```bash
# Trouver le processus
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Tuer le processus
kill -9 PID  # Remplacer PID par le numéro
```

### Erreur : "Firebase not initialized"
```bash
# Vérifier que le fichier existe
ls backend/src/config/firebase-service-account.json

# Vérifier les permissions
chmod 644 backend/src/config/firebase-service-account.json
```

### Erreur : "Network request failed"
```bash
# Vérifier que le backend tourne
curl http://localhost:3000/api/status

# Vérifier l'URL dans les configs
grep -r "localhost:3000" mobile-app/src/environments/
grep -r "localhost:3000" web-app/src/config/
```

### Réinitialiser complètement le projet
```bash
# Supprimer tous les node_modules
rm -rf backend/node_modules backend/package-lock.json
rm -rf web-app/node_modules web-app/package-lock.json
rm -rf mobile-app/node_modules mobile-app/package-lock.json

# Réinstaller
cd backend && npm install
cd ../web-app && npm install
cd ../mobile-app && npm install
```

---

## 📊 Commandes Git

### Vérifier le statut
```bash
git status
```

### Ajouter les modifications
```bash
git add .
```

### Committer
```bash
git commit -m "Configuration Firebase terminée"
```

### Push vers GitHub
```bash
git push origin main
```

### Ignorer les fichiers sensibles
```bash
# Vérifier que .gitignore contient :
cat .gitignore | grep firebase-service-account.json
cat .gitignore | grep .env
```

---

## 🎯 Raccourcis Utiles

### Tout démarrer en une fois (Mac/Linux)
```bash
# Dans 3 terminaux différents
cd backend && npm start &
cd web-app && npm start &
cd mobile-app && ionic serve &
```

### Tout arrêter
```bash
# Ctrl+C dans chaque terminal
# ou
pkill -f node
```

---

## 📚 Liens Utiles

- **Firebase Console**: https://console.firebase.google.com/
- **Firebase Documentation**: https://firebase.google.com/docs
- **Ionic Documentation**: https://ionicframework.com/docs
- **React Documentation**: https://react.dev/
- **Node.js Documentation**: https://nodejs.org/docs/

---

## 🆘 Besoin d'aide ?

Si une commande ne fonctionne pas :
1. Vérifiez que vous êtes dans le bon répertoire
2. Vérifiez que les dépendances sont installées (`npm install`)
3. Vérifiez les logs d'erreur
4. Consultez les guides de configuration

**Guides disponibles :**
- [QUICK_START_FIREBASE.md](QUICK_START_FIREBASE.md)
- [FIREBASE_CONFIG_GUIDE.md](FIREBASE_CONFIG_GUIDE.md)
- [FIREBASE_CHECKLIST.md](FIREBASE_CHECKLIST.md)
- [ARCHITECTURE_FIREBASE.md](ARCHITECTURE_FIREBASE.md)
