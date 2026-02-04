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
    // const jsonPath = path.resolve(__dirname, '../../firebase-credentials.json');
    if (fs.existsSync(jsonPath)) {
      journal.info('Utilisation du fichier firebase-credentials.json');
      const serviceAccount = require(jsonPath);
      credentials = admin.credential.cert(serviceAccount);
    } 
    // Option 2 : Utiliser les variables d'environnement
    else {
      credentials = admin.credential.cert({
        projectId: configuration.firebase.projectId,
        privateKey: configuration.firebase.privateKey
          ? configuration.firebase.privateKey.replace(/\\n/g, '\n')
          : undefined,
        clientEmail: configuration.firebase.clientEmail
      });
    }

    application = admin.initializeApp({
      credential: credentials,
      databaseURL: configuration.firebase.databaseUrl
    });

    firestore = admin.firestore();
    auth = admin.auth();
    journal.info('Firebase Admin initialisé');
  } catch (erreur) {
    journal.error('Échec initialisation Firebase Admin', erreur);
  }
} else {
  journal.info('Firebase désactivé (FIREBASE_ENABLED=false)');
}

module.exports = {
  firebaseActif: Boolean(application),
  admin,
  firestore,
  auth
};
