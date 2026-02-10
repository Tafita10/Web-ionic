'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const toNombre = (valeur, defaut) => {
  const resultat = Number(valeur);
  return Number.isFinite(resultat) ? resultat : defaut;
};

const toBooleen = (valeur, defaut = false) => {
  if (typeof valeur === 'string') {
    return ['true', '1', 'oui', 'yes'].includes(valeur.toLowerCase());
  }
  if (typeof valeur === 'boolean') return valeur;
  return defaut;
};

const toListe = (valeur) => {
  if (!valeur) return [];
  return valeur
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const env = process.env;

const configuration = {
  mode: env.NODE_ENV || 'development',
  port: toNombre(env.PORT, 3000),
  apiUrl: env.API_URL || 'http://localhost:3000',
  baseTimezone: env.TZ || 'UTC',

  baseDeDonnees: {
    hote: env.DB_HOST || 'localhost',
    port: toNombre(env.DB_PORT, 5432),
    nom: env.DB_NAME || 'webrojo_db',
    utilisateur: env.DB_USER || 'webrojo_user',
    motDePasse: env.DB_PASSWORD || 'webrojo_password',
    poolMin: toNombre(env.DB_POOL_MIN, 2),
    poolMax: toNombre(env.DB_POOL_MAX, 10),
    fuseauHoraire: env.DB_TIMEZONE || '+03:00'
  },

  jwt: {
    secret: env.JWT_SECRET || 'changez_ce_secret_jwt',
    duree: env.JWT_EXPIRES_IN || '2h',
    refreshSecret: env.JWT_REFRESH_SECRET || 'changez_ce_refresh',
    refreshDuree: env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  securite: {
    maxTentativesConnexion: toNombre(env.MAX_LOGIN_ATTEMPTS, 3),
    coutBcrypt: toNombre(env.BCRYPT_ROUNDS, 12),
    dureeSessionMinutes: toNombre(env.SESSION_DURATION_MINUTES, 120),
    delaiVerifEmailHeures: toNombre(env.EMAIL_VERIFICATION_EXPIRY_HOURS, 24),
    delaiResetMotDePasseHeures: toNombre(env.PASSWORD_RESET_EXPIRY_HOURS, 1)
  },

  limitation: {
    login: {
      max: toNombre(env.RATE_LIMIT_LOGIN_MAX, 5),
      fenetreMinutes: toNombre(env.RATE_LIMIT_LOGIN_WINDOW_MINUTES, 15)
    },
    inscription: {
      max: toNombre(env.RATE_LIMIT_REGISTER_MAX, 3),
      fenetreMinutes: toNombre(env.RATE_LIMIT_REGISTER_WINDOW_MINUTES, 60)
    },
    api: {
      max: toNombre(env.RATE_LIMIT_API_MAX, 100),
      fenetreMinutes: toNombre(env.RATE_LIMIT_API_WINDOW_MINUTES, 15)
    }
  },

  firebase: {
    actif: toBooleen(env.FIREBASE_ENABLED, false),
    projectId: env.FIREBASE_PROJECT_ID,
    privateKey: env.FIREBASE_PRIVATE_KEY,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    databaseUrl: env.FIREBASE_DATABASE_URL
  },

  email: {
    actif: toBooleen(env.EMAIL_ENABLED, false),
    hote: env.SMTP_HOST,
    port: toNombre(env.SMTP_PORT, 587),
    securise: toBooleen(env.SMTP_SECURE, false),
    utilisateur: env.SMTP_USER,
    motDePasse: env.SMTP_PASSWORD,
    expediteur: env.EMAIL_FROM,
    nomExpediteur: env.EMAIL_FROM_NAME
  },

  redis: {
    actif: toBooleen(env.REDIS_ENABLED, false),
    hote: env.REDIS_HOST,
    port: toNombre(env.REDIS_PORT, 6379),
    motDePasse: env.REDIS_PASSWORD,
    base: toNombre(env.REDIS_DB, 0)
  },

  cors: {
    origines: toListe(env.CORS_ORIGIN).length > 0 
      ? toListe(env.CORS_ORIGIN) 
      : ['http://localhost:3001', 'http://localhost:8080', 'http://127.0.0.1:3001'],
    credentials: toBooleen(env.CORS_CREDENTIALS, true)
  },

  uploads: {
    actif: toBooleen(env.UPLOAD_ENABLED, true),
    repertoire: env.UPLOAD_DIR || './uploads',
    tailleMaxMb: toNombre(env.UPLOAD_MAX_SIZE_MB, 5),
    typesAutorises: toListe(env.UPLOAD_ALLOWED_TYPES)
  },

  journalisation: {
    niveau: env.LOG_LEVEL || 'info',
    versFichier: toBooleen(env.LOG_TO_FILE, false),
    repertoire: env.LOG_DIR || './logs'
  },

  urls: {
    web: env.WEB_APP_URL || 'http://localhost:8080',
    mobileScheme: env.MOBILE_APP_SCHEME || 'webrojo://'
  },

  sante: {
    actif: toBooleen(env.HEALTH_CHECK_ENABLED, true),
    chemin: env.HEALTH_CHECK_PATH || '/api/health'
  }
};

module.exports = configuration;
