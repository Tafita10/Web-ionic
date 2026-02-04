# Module Authentification - Documentation & Tests

> **Confidential - Not for Public Consumption or Distribution**  
> **Projet Cloud S5 - Promotion 17 - Janvier 2026**

Ce module fournit la documentation et les tests de validation pour l'**API REST de Fournisseur d'Identité** conforme au cahier des charges P17.

## 🎯 Conformité Cahier des Charges

✅ **API REST uniquement** - L'API est dans `../api/`, pas d'interface graphique (sauf outil de test)  
✅ **Node.js + Express** avec Docker  
✅ **Firebase (en ligne) + PostgreSQL (offline)** avec auto-switch  
✅ **Authentification email/mot de passe**  
✅ **Inscription utilisateur**  
✅ **Modification informations utilisateur**  
✅ **Durée de vie sessions** paramétrable (défaut: 120 minutes)  
✅ **Limite tentatives connexion** paramétrable (défaut: 3)  
✅ **API REST déblocage** pour Manager  
✅ **Documentation Swagger** (OpenAPI 3.0)

## 📁 Contenu du Module

```
auth-front/
├── swagger.yaml           # Documentation OpenAPI 3.0 complète
├── test-auth.js          # Tests automatiques de conformité
├── index.html            # Interface de test (optionnelle)
├── script.js             # Client de test
├── styles.css            # Styles interface de test
└── README.md             # Ce fichier
```

## 📖 Documentation Swagger

La documentation complète de l'API est disponible dans `swagger.yaml` (OpenAPI 3.0.3).

### Consulter la documentation

**Option 1: Swagger UI (recommandé)**

Installez Swagger UI dans le projet API:

```bash
cd ../api
npm install swagger-ui-express yamljs
```

Ajoutez dans `api/src/app.js`:

```javascript
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('../auth-front/swagger.yaml');

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

Puis accédez à: http://localhost:3000/api/docs

**Option 2: Swagger Editor en ligne**

1. Ouvrez https://editor.swagger.io/
2. Importez le fichier `swagger.yaml`

## 🧪 Tests Automatiques

Le fichier `test-auth.js` contient 13 tests qui valident toutes les exigences du cahier des charges.

### Exécuter les tests

```bash
cd auth-front
node test-auth.js
```

### Tests couverts

1. ✅ Health Check (API, PostgreSQL, Firebase)
2. ✅ Inscription utilisateur
3. ✅ Authentification email/pwd
4. ✅ Consulter profil
5. ✅ Modification profil
6. ✅ Changer mot de passe
7. ✅ Rafraîchir token (durée de vie session)
8. ✅ Limite tentatives connexion (3 par défaut)
9. ✅ Connexion Manager
10. ✅ Lister utilisateurs bloqués
11. ✅ Débloquer utilisateur (API REST)
12. ✅ Rate limiting
13. ✅ Déconnexion

### Rapport de test

Le script génère un rapport avec:
- Nombre de tests réussis/échoués
- Durée d'exécution
- Validation de conformité cahier des charges

## 🔧 Interface de Test (Optionnelle)

L'interface HTML (`index.html`) est fournie **uniquement pour faciliter les tests manuels**. Elle n'est PAS l'API elle-même.

### Lancer l'interface

```bash
npx http-server -p 5500
```

Puis ouvrir: http://localhost:5500

## 🔑 Endpoints Disponibles

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| GET | `/api/health` | État de l'API | Non |
| POST | `/api/auth/register` | Inscription | Non |
| POST | `/api/auth/login` | Connexion | Non |
| POST | `/api/auth/refresh` | Rafraîchir token | Non |
| POST | `/api/auth/logout` | Déconnexion | Bearer |
| GET | `/api/auth/me` | Mon profil | Bearer |
| PATCH | `/api/users/me` | Modifier profil | Bearer |
| PATCH | `/api/users/me/password` | Changer mot de passe | Bearer |
| GET | `/api/users/blocked` | Liste bloqués | Bearer (Manager) |
| POST | `/api/users/:id/unblock` | Débloquer | Bearer (Manager) |

Voir `swagger.yaml` pour les détails complets (schémas, codes erreur, exemples).

## ⚙️ Configuration API

Les paramètres d'authentification sont dans `../api/.env`:

```env
# Conformité cahier des charges
MAX_LOGIN_ATTEMPTS=3              # Limite tentatives (paramétrable)
SESSION_DURATION_MINUTES=120      # Durée sessions (paramétrable)
BCRYPT_ROUNDS=12                  # Sécurité BCrypt

# Rate limiting
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW_MINUTES=15
RATE_LIMIT_REGISTER_MAX=3
RATE_LIMIT_REGISTER_WINDOW_MINUTES=60

# Firebase (auto-switch)
FIREBASE_ENABLED=true             # false = PostgreSQL uniquement
```

## 📊 Comptes de Test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| manager@webrojo.mg | password123 | Manager (déblocage) |
| (créés dynamiquement) | - | Utilisateur |

## 🚀 Démarrage Complet

```bash
# 1. Démarrer les services
cd ../
docker-compose up -d postgres api_auth

# 2. Attendre 5 secondes
Start-Sleep -Seconds 5

# 3. Exécuter tests de conformité
cd auth-front
node test-auth.js

# 4. (Optionnel) Lancer interface de test
npx http-server -p 5500
```

## 📝 Documentation Technique

Pour le rapport de projet, voir:
- **Documentation API complète:** `swagger.yaml`
- **Architecture système:** `../MODULE_AUTHENTIFICATION.md`
- **Tests conformité:** `test-auth.js`
- **Configuration:** `../api/.env`

---

**Projet Cloud S5 - Promotion 17 - Janvier 2026**  
Module Authentification uniquement (API REST sans interface)
