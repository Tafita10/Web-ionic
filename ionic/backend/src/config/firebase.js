const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;

const initializeFirebase = () => {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
      path.join(__dirname, 'firebase-service-account.json');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(serviceAccountPath)) {
      console.log('⚠️  Firebase non configuré : fichier de configuration manquant');
      console.log('📄 Créez : backend/src/config/firebase-service-account.json');
      console.log('📖 Guide : backend/src/config/FIREBASE_SETUP.md');
      console.log('💡 Le serveur fonctionne en mode PostgreSQL uniquement');
      return false;
    }
    
    const serviceAccount = require(serviceAccountPath);
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin SDK initialisé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error.message);
    console.log('💡 Le serveur fonctionne en mode PostgreSQL uniquement');
    return false;
  }
};

const getAuth = () => {
  if (!firebaseApp) {
    throw new Error('Firebase n\'est pas initialisé');
  }
  return admin.auth();
};

const getFirestore = () => {
  if (!firebaseApp) {
    throw new Error('Firebase n\'est pas initialisé');
  }
  return admin.firestore();
};

module.exports = {
  initializeFirebase,
  getAuth,
  getFirestore,
  admin
};
