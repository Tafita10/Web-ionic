'use strict';

require('dotenv').config();
const configuration = require('./src/config/env');
const { firebaseActif, admin, firestore } = require('./src/config/firebase');

console.log('\n=== TEST CONNEXION FIREBASE ===\n');

if (!firebaseActif) {
  console.error('❌ Firebase est désactivé ou mal configuré');
  console.log('Configuration actuelle:');
  console.log('- FIREBASE_ENABLED:', configuration.firebase.actif);
  console.log('- FIREBASE_PROJECT_ID:', configuration.firebase.projectId || '(vide)');
  console.log('- FIREBASE_CLIENT_EMAIL:', configuration.firebase.clientEmail || '(vide)');
  process.exit(1);
}

console.log('✅ Firebase Admin initialisé');
console.log('Project ID:', configuration.firebase.projectId);

// Test lecture Firestore
(async () => {
  try {
    console.log('\n📖 Test lecture Firestore (collection "signalements")...');
    const snapshot = await firestore.collection('signalements').limit(5).get();
    console.log(`✅ ${snapshot.size} document(s) trouvé(s)`);
    
    snapshot.forEach((doc) => {
      console.log(`  - Document ${doc.id}:`, doc.data());
    });

    console.log('\n✅ Connexion Firebase OK !');
    process.exit(0);
  } catch (erreur) {
    console.error('\n❌ Erreur Firestore:', erreur.message);
    process.exit(1);
  }
})();
