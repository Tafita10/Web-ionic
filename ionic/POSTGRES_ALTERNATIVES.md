# Installation PostgreSQL sans Docker (Windows)

## Option 1 : PostgreSQL local

1. **Téléchargez PostgreSQL** :
   - https://www.postgresql.org/download/windows/
   - Installez PostgreSQL 15

2. **Créez la base de données** :
   ```bash
   # Ouvrez psql depuis le menu Démarrer
   psql -U postgres
   
   # Dans psql :
   CREATE DATABASE ionic_db;
   CREATE USER ionic_user WITH PASSWORD 'ionic_password';
   GRANT ALL PRIVILEGES ON DATABASE ionic_db TO ionic_user;
   \c ionic_db
   
   # Copiez-collez le contenu de database/init.sql
   ```

3. **Modifiez .env** :
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ionic_db
   DB_USER=ionic_user
   DB_PASSWORD=ionic_password
   ```

## Option 2 : Mode Firebase uniquement (plus simple)

Pour tester rapidement sans base de données locale :

1. Configurez Firebase (voir backend/src/config/FIREBASE_SETUP.md)
2. Le système utilisera automatiquement Firebase quand vous êtes en ligne
3. La base PostgreSQL ne sera nécessaire que pour le mode hors ligne

## Option 3 : PostgreSQL en ligne (gratuit)

Services gratuits avec PostgreSQL :
- **Supabase** : https://supabase.com (500 MB gratuit)
- **ElephantSQL** : https://www.elephantsql.com (20 MB gratuit)
- **Render** : https://render.com (PostgreSQL gratuit)

Créez une instance et mettez à jour le `.env` avec les credentials fournis.

## Vérification

Une fois configuré, testez la connexion :

```bash
cd backend
npm start
```

Si vous voyez :
- ✅ `Serveur démarré sur le port 3000`
- ✅ `Firebase Admin SDK initialisé` (si configuré)

Tout fonctionne ! 🎉
