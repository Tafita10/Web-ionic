'use strict';

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const configuration = require('./env');
const journal = require('./logger');

let application = null;
let firestore = null;
let auth = null;

if (configuration.firebase.actif) {
  try {
    let credentials;
    
    // Option 1 : Utiliser un fichier JSON si présent
    const jsonPath = path.resolve(__dirname, '../../firebase-credentials.json');
    if (fs.existsSync(jsonPath)) {
      journal.info('Utilisation du fichier firebase-credentials.json');
      try {
        const serviceAccount = require(jsonPath);
        // Vérifier que le fichier contient les clés nécessaires
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
          throw new Error('Fichier firebase-credentials.json incomplet');
        }
        credentials = admin.credential.cert(serviceAccount);
      } catch (jsonError) {
        journal.warn('Fichier firebase-credentials.json invalide:', jsonError.message);
        credentials = null;
      }
    }
    
    // Option 2 : Utiliser les variables d'environnement
    if (!credentials) {
      if (configuration.firebase.projectId && configuration.firebase.privateKey && configuration.firebase.clientEmail) {
        credentials = admin.credential.cert({
          projectId: configuration.firebase.projectId,
          privateKey: configuration.firebase.privateKey.replace(/\\n/g, '\n'),
          clientEmail: configuration.firebase.clientEmail
        });
      } else {
        throw new Error('Credentials Firebase manquants (variables d\'environnement incomplètes)');
      }
    }

    if (credentials) {
      application = admin.initializeApp({
        credential: credentials,
        databaseURL: 'https://fir-7bee4-default-rtdb.europe-west1.firebasedatabase.app'
      });

      // Utiliser Realtime Database au lieu de Firestore
      const database = admin.database();
      auth = admin.auth();
      journal.info('✓ Firebase Admin initialisé avec succès (Realtime Database)');
      
      module.exports = {
        firebaseActif: Boolean(application),
        admin,
        database, // Realtime Database
        firestore: null, // Pas de Firestore
        auth
      };
    }
  } catch (erreur) {
    journal.warn('⚠ Firebase non disponible:', erreur.message);
    journal.info('→ Basculement automatique vers PostgreSQL');
    application = null;
    firestore = null;
    auth = null;
    
    module.exports = {
      firebaseActif: false,
      admin,
      database: null,
      firestore: null,
      auth: null
    };
  }
} else {
  journal.info('Firebase désactivé (FIREBASE_ENABLED=false)');
  module.exports = {
    firebaseActif: false,
    admin,
    database: null,
    firestore: null,
    auth: null
  };
}
