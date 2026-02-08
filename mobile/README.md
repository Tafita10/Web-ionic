# Application Mobile - Signalement Route Madagascar

Application mobile développée avec **Ionic Vue.js** pour la gestion des signalements routiers à Madagascar.

## 📱 Fonctionnalités

### Pour les utilisateurs
- ✅ Authentification (connexion/inscription)
- ✅ Création de signalements avec photo et géolocalisation
- ✅ Visualisation des signalements sur une carte interactive
- ✅ Suivi de l'état des signalements (Nouveau, En cours, Terminé)
- ✅ Gestion des priorités
- ✅ Historique personnel des signalements
- ✅ Modification et suppression de ses signalements
- ✅ Profil utilisateur

### Fonctionnalités techniques
- 📍 Géolocalisation GPS
- 📷 Capture de photos avec la caméra
- 🗺️ Cartes interactives avec Leaflet
- 💾 Stockage local avec Capacitor Storage
- 🔄 Synchronisation avec le backend
- 🎨 Interface moderne et responsive
- 🌙 Support du mode sombre

## 🛠️ Technologies utilisées

- **Ionic Framework 7** - Framework mobile hybride
- **Vue 3** - Framework JavaScript
- **TypeScript** - Typage statique
- **Pinia** - Gestion d'état
- **Capacitor** - Accès aux fonctionnalités natives
- **Leaflet** - Cartes interactives
- **Axios** - Requêtes HTTP
- **Vite** - Build tool

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Ionic CLI (`npm install -g @ionic/cli`)
- (Optionnel) Android Studio pour le build Android
- (Optionnel) Xcode pour le build iOS

## 🚀 Installation

1. **Cloner le projet et accéder au dossier mobile**
```bash
cd mobile
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```
Puis modifier le fichier `.env` avec l'URL de votre API backend.

4. **Lancer l'application en mode développement**
```bash
npm run dev
# ou
ionic serve
```

L'application sera accessible sur `http://localhost:8100`

## 📱 Build pour mobile

### Android

1. **Ajouter la plateforme Android**
```bash
npx cap add android
```

2. **Builder l'application**
```bash
npm run build
npx cap sync
```

3. **Ouvrir dans Android Studio**
```bash
npx cap open android
```

### iOS

1. **Ajouter la plateforme iOS**
```bash
npx cap add ios
```

2. **Builder l'application**
```bash
npm run build
npx cap sync
```

3. **Ouvrir dans Xcode**
```bash
npx cap open ios
```

## 📂 Structure du projet

```
mobile/
├── public/              # Fichiers statiques
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Composants réutilisables
│   │   ├── modals/    # Modals
│   │   └── SignalementCard.vue
│   ├── config/        # Configuration et constantes
│   │   └── constants.ts
│   ├── router/        # Configuration du routeur
│   │   └── index.ts
│   ├── services/      # Services (API, Storage)
│   │   ├── api.service.ts
│   │   └── storage.service.ts
│   ├── stores/        # Stores Pinia
│   │   ├── auth.ts
│   │   └── signalement.ts
│   ├── theme/         # Thème et styles CSS
│   │   └── variables.css
│   ├── types/         # Types TypeScript
│   │   └── index.ts
│   ├── views/         # Pages de l'application
│   │   ├── auth/     # Pages d'authentification
│   │   ├── signalements/ # Pages de signalements
│   │   ├── HomePage.vue
│   │   ├── MapPage.vue
│   │   ├── ProfilePage.vue
│   │   └── TabsPage.vue
│   ├── App.vue        # Composant racine
│   └── main.ts        # Point d'entrée
├── capacitor.config.ts  # Configuration Capacitor
├── ionic.config.json    # Configuration Ionic
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔌 Configuration de l'API

L'application communique avec un backend REST. Assurez-vous que :

1. Le backend est démarré et accessible
2. L'URL de l'API est correctement configurée dans `.env`
3. Le backend accepte les requêtes CORS depuis l'application mobile

### Endpoints utilisés

- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Profil utilisateur
- `GET /api/signalements` - Liste des signalements
- `GET /api/signalements/:id` - Détails d'un signalement
- `POST /api/signalements` - Créer un signalement
- `PUT /api/signalements/:id` - Modifier un signalement
- `DELETE /api/signalements/:id` - Supprimer un signalement
- `POST /api/signalements/:id/photo` - Upload de photo

## 🗃️ Base de données

L'application utilise la structure de base de données définie dans `script.sql` :

### Tables principales
- `users` - Utilisateurs
- `signalements` - Signalements routiers
- `status` - Statuts (Nouveau, En cours, Terminé)
- `villes` - Villes
- `routes` - Routes/Rues
- `entreprises` - Entreprises de réparation

### Rôles utilisateurs
- **Visiteur** (visitor) - Lecture seule
- **Utilisateur** (user) - Peut créer des signalements
- **Manager** (manager) - Gestion complète

## 🔒 Sécurité

- Authentification par JWT (JSON Web Token)
- Stockage sécurisé des tokens avec Capacitor Storage
- Validation des données côté client et serveur
- Gestion des permissions selon les rôles

## 📱 Permissions requises

### Android
- `ACCESS_FINE_LOCATION` - Géolocalisation
- `ACCESS_COARSE_LOCATION` - Géolocalisation
- `CAMERA` - Capture de photos
- `READ_EXTERNAL_STORAGE` - Lecture des photos
- `INTERNET` - Connexion réseau

### iOS
- `NSLocationWhenInUseUsageDescription` - Géolocalisation
- `NSCameraUsageDescription` - Caméra
- `NSPhotoLibraryUsageDescription` - Bibliothèque photo

## 🧪 Tests

```bash
npm run test:unit
```

## 📝 Scripts disponibles

- `npm run dev` - Lancer en mode développement
- `npm run build` - Builder pour la production
- `npm run preview` - Prévisualiser le build
- `npm run lint` - Vérifier le code
- `ionic serve` - Lancer avec Ionic CLI

## 🤝 Contribution

Ce projet fait partie du système de signalement routier Madagascar.

### Workflow de développement

1. Créer une branche pour votre fonctionnalité
2. Développer et tester
3. Soumettre une pull request
4. Code review
5. Merge

## 📄 Licence

© 2026 Signalement Route Madagascar

## 👥 Équipe

Développé dans le cadre du projet Cloud P17 - ITU Madagascar

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**Note**: Cette application mobile fonctionne avec le backend défini dans `script.sql`. Assurez-vous que la base de données PostgreSQL est configurée et que le serveur backend est en cours d'exécution avant de lancer l'application.
