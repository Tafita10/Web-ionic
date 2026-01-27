# 🏗️ Architecture Firebase - Vue d'ensemble

## 📊 Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FIREBASE CONSOLE                            │
│                    (console.firebase.google.com)                    │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │
│  │ Authentication │  │    Firestore   │  │   Functions    │      │
│  │  (Email/Pass)  │  │   (Database)   │  │   (Backend)    │      │
│  └────────────────┘  └────────────────┘  └────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
         │                      │                      │
         │ Firebase SDK         │ Firebase SDK         │ Admin SDK
         │ (Client)             │ (Client)             │ (Server)
         ▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Mobile App    │   │     Web App     │   │   Backend API   │
│  (Ionic/Angular)│   │     (React)     │   │    (Node.js)    │
│                 │   │                 │   │                 │
│  • Login        │   │  • Login        │   │  • Verify Token │
│  • Register     │   │  • Register     │   │  • Create User  │
│  • Profile      │   │  • Profile      │   │  • Update User  │
│  • Offline Mode │   │  • Offline Mode │   │  • PostgreSQL   │
└─────────────────┘   └─────────────────┘   └─────────────────┘
         │                      │                      │
         └──────────────────────┴──────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   PostgreSQL (Local)  │
                    │   Backup/Offline Mode │
                    └───────────────────────┘
```

---

## 🔄 Flux d'Authentification

### 1. Inscription (Register)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Check   │────▶│ Firebase │────▶│ Firestore│
│ (Mobile/ │     │  Online? │     │   Auth   │     │  (users) │
│   Web)   │     └──────────┘     └──────────┘     └──────────┘
└──────────┘           │                 │
                       │ Offline         │ Success
                       ▼                 ▼
                 ┌──────────┐     ┌──────────┐
                 │ Backend  │────▶│PostgreSQL│
                 │   API    │     │  (local) │
                 └──────────┘     └──────────┘
```

**Étapes détaillées :**

1. **Client** envoie email + mot de passe
2. **Service** vérifie la connexion Internet
3. **Si ONLINE**:
   - Appelle Firebase Authentication
   - Crée l'utilisateur dans Firebase Auth
   - Sauvegarde le profil dans Firestore
4. **Si OFFLINE**:
   - Appelle le backend local (Node.js)
   - Crée l'utilisateur dans PostgreSQL
   - Génère un token JWT local

### 2. Connexion (Login)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Check   │────▶│ Firebase │
│          │     │  Online? │     │   Auth   │
└──────────┘     └──────────┘     └──────────┘
                       │                 │
                       │ Offline         │ Success: Get User Token
                       ▼                 ▼
                 ┌──────────┐     ┌──────────┐
                 │ Backend  │────▶│  Return  │
                 │   API    │     │   User   │
                 └──────────┘     └──────────┘
```

**Étapes détaillées :**

1. **Client** envoie email + mot de passe
2. **Service** vérifie la connexion Internet
3. **Si ONLINE**:
   - Appelle Firebase `signInWithEmailAndPassword`
   - Firebase retourne un token d'authentification
   - Stocke le token localement
4. **Si OFFLINE**:
   - Appelle le backend local
   - Backend vérifie dans PostgreSQL
   - Génère un token JWT

---

## 🔐 Sécurité & Tokens

### Firebase Authentication Token

```
┌──────────────────────────────────────────────────────┐
│               Firebase ID Token (JWT)                │
├──────────────────────────────────────────────────────┤
│  {                                                   │
│    "iss": "https://securetoken.google.com/project", │
│    "aud": "your-project-id",                        │
│    "auth_time": 1234567890,                         │
│    "user_id": "abc123...",                          │
│    "sub": "abc123...",                              │
│    "iat": 1234567890,                               │
│    "exp": 1234571490,                               │
│    "email": "user@example.com",                     │
│    "email_verified": true                           │
│  }                                                   │
└──────────────────────────────────────────────────────┘
```

**Utilisation :**
- ✅ Valide pendant 1 heure
- ✅ Auto-refresh par le SDK Firebase
- ✅ Vérifié côté serveur avec Admin SDK
- ✅ Contient les infos utilisateur

---

## 💾 Stockage des Données

### Firestore (Online)

```
Collection: users
├── uid_abc123
│   ├── email: "user@example.com"
│   ├── displayName: "John Doe"
│   ├── photoURL: "https://..."
│   ├── phoneNumber: "+1234567890"
│   ├── createdAt: "2026-01-20T10:30:00Z"
│   └── updatedAt: "2026-01-20T10:30:00Z"
├── uid_def456
│   ├── email: "jane@example.com"
│   ├── displayName: "Jane Smith"
│   └── ...
```

### PostgreSQL (Offline)

```sql
Table: users
+----+------------------+----------+------------------+------------+
| id | email            | password | display_name     | created_at |
+----+------------------+----------+------------------+------------+
| 1  | user@example.com | $hash... | John Doe         | 2026-01-20 |
| 2  | jane@example.com | $hash... | Jane Smith       | 2026-01-20 |
+----+------------------+----------+------------------+------------+
```

---

## 🔄 Mode Hybride (Online + Offline)

### Stratégie de basculement

```javascript
// Pseudo-code du service d'authentification

async function login(email, password) {
  const isOnline = await checkInternetConnection();
  
  if (isOnline) {
    try {
      // Tentative avec Firebase
      const user = await loginFirebase(email, password);
      return user;
    } catch (error) {
      // Si Firebase échoue, fallback sur local
      console.warn('Firebase failed, using local auth');
      return loginLocal(email, password);
    }
  } else {
    // Mode hors ligne direct
    return loginLocal(email, password);
  }
}
```

---

## 📋 Fichiers de Configuration

### Mobile App (Ionic/Angular)

**Fichier :** `mobile-app/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "...",           // ← Configuration Firebase Client
    authDomain: "...",
    projectId: "...",
    // ...
  },
  apiUrl: 'http://localhost:3000/api'  // ← Backend local
};
```

### Web App (React)

**Fichier :** `web-app/src/config/firebase.js`

```javascript
export const firebaseConfig = {
  apiKey: "...",           // ← Configuration Firebase Client
  authDomain: "...",
  // ...
};

export const API_URL = 'http://localhost:3000/api';  // ← Backend local
```

### Backend (Node.js)

**Fichier :** `backend/src/config/firebase-service-account.json`

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key": "...",    // ← Clé privée Admin SDK
  "client_email": "...",
  // ...
}
```

---

## 🌐 Flux Complet - Exemple d'Inscription

```
1. Utilisateur remplit le formulaire
   ↓
2. Client (Mobile/Web) appelle authService.register()
   ↓
3. Service vérifie la connexion
   ↓
   ├─ ONLINE ──────────────────────┐
   │                                │
   │  4. Appel Firebase Auth        │
   │     createUserWithEmailAndPassword()
   │     ↓                          │
   │  5. Firebase crée l'utilisateur│
   │     ↓                          │
   │  6. Mise à jour du profil      │
   │     updateProfile()            │
   │     ↓                          │
   │  7. Sauvegarde dans Firestore  │
   │     setDoc(users/uid)          │
   │     ↓                          │
   │  8. Retourne l'objet user      │
   │                                │
   └────────────────────────────────┘
   │
   ├─ OFFLINE ─────────────────────┐
   │                                │
   │  4. Appel Backend Local        │
   │     POST /api/auth/register    │
   │     ↓                          │
   │  5. Backend hash le password   │
   │     bcrypt.hash()              │
   │     ↓                          │
   │  6. Insertion PostgreSQL       │
   │     INSERT INTO users          │
   │     ↓                          │
   │  7. Génération token JWT       │
   │     jwt.sign()                 │
   │     ↓                          │
   │  8. Retourne user + token      │
   │                                │
   └────────────────────────────────┘
   │
   ↓
9. Client stocke le token localement
   localStorage ou AsyncStorage
   ↓
10. Utilisateur est connecté
    Redirection vers /home ou /profile
```

---

## 🛠️ Outils de Développement

### Firebase Console (Production)

- **URL :** https://console.firebase.google.com/
- **Utilisation :** 
  - Voir les utilisateurs inscrits
  - Consulter Firestore Database
  - Monitorer les logs
  - Gérer les règles de sécurité

### Backend API (Local)

- **URL :** http://localhost:3000
- **Endpoints :**
  - `POST /api/auth/register` - Inscription locale
  - `POST /api/auth/login` - Connexion locale
  - `GET /api/auth/profile` - Récupérer le profil
  - `PUT /api/auth/profile` - Mettre à jour le profil

### PostgreSQL (Local)

```bash
# Se connecter à la base
psql -U postgres -d ionic_app

# Voir les utilisateurs
SELECT * FROM users;

# Vérifier les connexions
\dt  # Lister les tables
```

---

## 📊 Avantages de cette Architecture

### ✅ Avantages

1. **Haute disponibilité** - Fonctionne online ET offline
2. **Évolutivité** - Firebase gère l'échelle automatiquement
3. **Sécurité** - Tokens JWT + Firebase Auth
4. **Synchronisation** - Firestore en temps réel
5. **Backup** - PostgreSQL comme copie locale
6. **Développement** - Test local sans coût

### ⚠️ Considérations

1. **Coût** - Firebase a des quotas gratuits puis payant
2. **Complexité** - Gestion de 2 systèmes (Firebase + PostgreSQL)
3. **Synchronisation** - Les données offline doivent être synchro manuellement
4. **Conflit** - Possible si même user créé offline puis online

---

## 🚀 Prochaines étapes

1. ✅ Configurer Firebase (FAIT)
2. ✅ Tester l'inscription/connexion
3. ⬜ Ajouter Google Sign-In
4. ⬜ Ajouter Facebook Login
5. ⬜ Implémenter la synchronisation offline → online
6. ⬜ Configurer les règles de sécurité Firestore
7. ⬜ Ajouter Firebase Storage pour les photos
8. ⬜ Implémenter Firebase Cloud Messaging (notifications)

---

**Pour plus d'infos :**
- 📖 [FIREBASE_CONFIG_GUIDE.md](FIREBASE_CONFIG_GUIDE.md)
- 🚀 [QUICK_START_FIREBASE.md](QUICK_START_FIREBASE.md)
