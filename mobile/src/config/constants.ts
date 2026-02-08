export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};
export const APP_CONFIG = {
  APP_NAME: 'Signalement Route',
  APP_VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'fr',
  DEFAULT_COUNTRY: 'Madagascar'
};
export const MAP_CONFIG = {
  DEFAULT_CENTER: [-18.8792, 47.5079] as [number, number],
  DEFAULT_ZOOM: 13,
  MAX_ZOOM: 19,
  MIN_ZOOM: 2,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  OFFLINE_SIGNALEMENTS: 'offline_signalements',
  LAST_SYNC: 'last_sync'
};
export const PRIORITE_LEVELS = [
  { value: 1, label: 'Urgent', color: 'danger' },
  { value: 2, label: 'Élevée', color: 'warning' },
  { value: 3, label: 'Moyenne', color: 'primary' },
  { value: 4, label: 'Faible', color: 'medium' },
  { value: 5, label: 'Très faible', color: 'light' }
];
export const STATUS_COLORS = {
  1: '#FF0000',
  2: '#FFA500',
  3: '#00FF00'
};
export const CAMERA_OPTIONS = {
  quality: 90,
  allowEditing: true,
  resultType: 'base64' as const,
  source: 'camera' as const,
  saveToGallery: false
};
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
};
export const VALIDATION_RULES = {
  EMAIL_PATTERN: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  PASSWORD_MIN_LENGTH: 8,
  PHONE_PATTERN: /^(\+261|0)[0-9]{9}$/,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000
};
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion Internet.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Données invalides. Veuillez vérifier vos informations.',
  LOCATION_ERROR: 'Impossible d\'obtenir votre position. Veuillez activer la géolocalisation.',
  CAMERA_ERROR: 'Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.'
};
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Connexion réussie !',
  REGISTER_SUCCESS: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
  SIGNALEMENT_CREATED: 'Signalement créé avec succès !',
  SIGNALEMENT_UPDATED: 'Signalement mis à jour avec succès !',
  SIGNALEMENT_DELETED: 'Signalement supprimé avec succès !',
  PROFILE_UPDATED: 'Profil mis à jour avec succès !',
  SYNC_SUCCESS: 'Synchronisation réussie !'
};