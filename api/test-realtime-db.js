const { database, firebaseActif } = require('./src/config/firebase');
const journal = require('./src/config/logger');

async function testRealtimeDatabase() {
  console.log('\n=== TEST FIREBASE REALTIME DATABASE ===\n');

  if (!firebaseActif) {
    console.log('❌ Firebase désactivé');
    process.exit(1);
  }

  console.log('✅ Firebase Admin initialisé');
  console.log('Database URL:', database.ref().toString());

  try {
    // Test 1: Écrire des données de test
    console.log('\n📝 Test écriture...');
    const testRef = database.ref('test');
    await testRef.set({
      message: 'Hello from WebRojo',
      timestamp: Date.now()
    });
    console.log('✅ Écriture réussie');

    // Test 2: Lire les données
    console.log('\n📖 Test lecture...');
    const snapshot = await testRef.once('value');
    const data = snapshot.val();
    console.log('✅ Lecture réussie:', data);

    // Test 3: Lire la collection signalements
    console.log('\n📋 Test lecture signalements...');
    const signalementsSnapshot = await database.ref('signalements').once('value');
    const signalements = signalementsSnapshot.val();
    
    if (signalements) {
      const count = Object.keys(signalements).length;
      console.log(`✅ ${count} signalement(s) trouvé(s)`);
      console.log('Premier signalement:', Object.values(signalements)[0]);
    } else {
      console.log('ℹ️  Aucun signalement (collection vide)');
    }

    // Test 4: Créer un signalement de test
    console.log('\n➕ Test création signalement...');
    const newSignalementRef = database.ref('signalements').push();
    await newSignalementRef.set({
      description: 'Test signalement',
      latitude: -18.8792,
      longitude: 47.5079,
      status: 1,
      createdAt: Date.now()
    });
    console.log('✅ Signalement créé avec ID:', newSignalementRef.key);

    // Test 5: Nettoyer les données de test
    console.log('\n🧹 Nettoyage...');
    await testRef.remove();
    console.log('✅ Données de test supprimées');

    console.log('\n✅ TOUS LES TESTS RÉUSSIS!\n');
    console.log('Firebase Realtime Database fonctionne correctement.');
    console.log('\nProchaines étapes:');
    console.log('1. Redémarrez l\'API avec: npm run dev');
    console.log('2. Testez les boutons PULL/PUSH dans l\'interface');
    
    process.exit(0);
  } catch (erreur) {
    console.error('\n❌ Erreur:', erreur.message);
    console.error('\n⚠️  Vérifiez que Realtime Database est activé:');
    console.error('   https://console.firebase.google.com/project/fir-7bee4/database');
    process.exit(1);
  }
}

testRealtimeDatabase();
