#!/usr/bin/env node

/**
 * Script de migration des données vers Firebase Firestore
 * Insère les données initiales du projet Cloud P17 - Signalement Routier
 * 
 * Usage: node migrate-to-firebase.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialiser Firebase Admin
const serviceAccountPath = path.join(__dirname, '../config/firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Erreur: fichier firebase-service-account.json manquant');
  console.log('📄 Créez: backend/src/config/firebase-service-account.json');
  console.log('📄 Chemin recherché:', serviceAccountPath);
  console.log('📖 Consultez: FIREBASE_CONFIG_GUIDE.md');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

console.log('🔥 Connexion à Firebase réussie');
console.log('📊 Démarrage de la migration...\n');

// ============================================
// DONNÉES À MIGRER
// ============================================

const typeUsers = [
  { id: 1, libelle: 'Visiteur', description: 'Utilisateur non authentifié, accès en lecture seule' },
  { id: 2, libelle: 'Utilisateur', description: 'Utilisateur authentifié, peut créer des signalements' },
  { id: 3, libelle: 'Manager', description: 'Administrateur, peut enrichir et gérer les signalements' }
];

const status = [
  { id: 1, libelle: 'Nouveau', couleur: '#FF0000', description: 'Signalement non encore traité' },
  { id: 2, libelle: 'En cours', couleur: '#FFA500', description: 'Travaux de réparation en cours' },
  { id: 3, libelle: 'Terminé', couleur: '#00FF00', description: 'Réparation terminée avec succès' }
];

const villes = [
  { id: 1, nom: 'Antananarivo', latitude: -18.8792, longitude: 47.5079, code_postal: '101', pays: 'Madagascar' },
  { id: 2, nom: 'Antsirabe', latitude: -19.8667, longitude: 47.0333, code_postal: '110', pays: 'Madagascar' },
  { id: 3, nom: 'Toamasina', latitude: -18.1443, longitude: 49.4019, code_postal: '501', pays: 'Madagascar' }
];

const routes = [
  { id: 1, nom: "Avenue de l'Indépendance", ville_id: 1, type_route: 'Avenue', longueur_km: 3.5 },
  { id: 2, nom: 'Rue Rainitovo', ville_id: 1, type_route: 'Rue', longueur_km: 1.2 },
  { id: 3, nom: 'Boulevard Ratsimilaho', ville_id: 1, type_route: 'Boulevard', longueur_km: 4.8 },
  { id: 4, nom: 'Route Digue', ville_id: 1, type_route: 'Route', longueur_km: 6.3 },
  { id: 5, nom: 'Avenue Général de Gaulle', ville_id: 1, type_route: 'Avenue', longueur_km: 2.1 }
];

const entreprises = [
  { 
    id: 1, 
    nom: 'Entreprise Municipal Antananarivo', 
    telephone: '+261 20 22 123 45', 
    email: 'contact@municipal-tana.mg',
    adresse: 'Antananarivo Centre',
    ville_id: 1,
    siret: 'EM-001-2020',
    est_active: true
  },
  { 
    id: 2, 
    nom: 'BTP Madagascar SARL', 
    telephone: '+261 20 22 456 78', 
    email: 'info@btpmadagascar.mg',
    adresse: 'Zone Industrielle Forello',
    ville_id: 1,
    siret: 'BTP-002-2019',
    est_active: true
  },
  { 
    id: 3, 
    nom: 'TravPublic SA', 
    telephone: '+261 20 22 789 01', 
    email: 'contact@travpublic.mg',
    adresse: 'Behoririka',
    ville_id: 1,
    siret: 'TP-003-2018',
    est_active: true
  },
  { 
    id: 4, 
    nom: 'Construction Route Nationale', 
    telephone: '+261 20 22 345 67', 
    email: 'crn@routenationale.mg',
    adresse: 'Ivato',
    ville_id: 1,
    siret: 'CRN-004-2021',
    est_active: true
  }
];

const users = [
  {
    id: 1,
    email: 'manager@example.com',
    nom: 'Admin',
    prenom: 'Manager',
    type_user_id: 3,
    role: 'manager',
    telephone: '+261 32 00 000 01',
    password: 'Manager123!' // Mot de passe pour créer dans Firebase Auth
  },
  {
    id: 2,
    email: 'user1@example.com',
    nom: 'Rakoto',
    prenom: 'Jean',
    type_user_id: 2,
    role: 'user',
    telephone: '+261 32 11 111 11',
    password: 'User123!'
  },
  {
    id: 3,
    email: 'user2@example.com',
    nom: 'Rabe',
    prenom: 'Marie',
    type_user_id: 2,
    role: 'user',
    telephone: '+261 32 22 222 22',
    password: 'User123!'
  },
  {
    id: 4,
    email: 'user3@example.com',
    nom: 'Randria',
    prenom: 'Paul',
    type_user_id: 2,
    role: 'user',
    telephone: '+261 32 33 333 33',
    password: 'User123!'
  }
];

const signalements = [
  {
    id: 1,
    user_id: 2,
    latitude: -18.8792,
    longitude: 47.5079,
    ville_id: 1,
    route_id: 1,
    description: "Nid de poule important sur l'Avenue de l'Indépendance près de l'Hôtel de Ville",
    status_id: 1,
    priorite: 1,
    adresse_precise: "Avenue de l'Indépendance, devant Hôtel de Ville"
  },
  {
    id: 2,
    user_id: 2,
    latitude: -18.9138,
    longitude: 47.5361,
    ville_id: 1,
    route_id: 3,
    description: 'Route très endommagée, plusieurs fissures dangereuses',
    status_id: 2,
    priorite: 2,
    adresse_precise: 'Boulevard Ratsimilaho, hauteur marché Analakely',
    surface_m2: 12.5,
    budget: 450000,
    entreprise_id: 2,
    commentaire: 'Travaux urgents à réaliser - budget alloué'
  },
  {
    id: 3,
    user_id: 3,
    latitude: -18.8645,
    longitude: 47.5208,
    ville_id: 1,
    route_id: 2,
    description: 'Affaissement de chaussée suite aux pluies',
    status_id: 3,
    priorite: 3,
    adresse_precise: 'Rue Rainitovo, intersection avec Rue Raveloson',
    surface_m2: 8.7,
    budget: 320000,
    entreprise_id: 3,
    commentaire: 'Travaux terminés avec succès - qualité satisfaisante'
  },
  {
    id: 4,
    user_id: 3,
    latitude: -18.8950,
    longitude: 47.5400,
    ville_id: 1,
    route_id: 4,
    description: 'Trou dans la chaussée suite à travaux de canalisations',
    status_id: 1,
    priorite: 2,
    adresse_precise: 'Route Digue, près du stade'
  },
  {
    id: 5,
    user_id: 4,
    latitude: -18.8700,
    longitude: 47.5100,
    ville_id: 1,
    route_id: 5,
    description: 'Dégradation importante de la surface',
    status_id: 1,
    priorite: 4,
    adresse_precise: 'Avenue Général de Gaulle'
  }
];

// ============================================
// FONCTIONS DE MIGRATION
// ============================================

async function migrateCollection(collectionName, data, options = {}) {
  console.log(`\n📦 Migration de la collection "${collectionName}"...`);
  let successCount = 0;
  let errorCount = 0;

  for (const item of data) {
    try {
      const docId = options.useCustomId ? String(item.id) : undefined;
      const docData = { ...item };
      
      // Ajouter timestamps
      docData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      docData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      if (docId) {
        await db.collection(collectionName).doc(docId).set(docData);
      } else {
        await db.collection(collectionName).add(docData);
      }
      
      successCount++;
      process.stdout.write(`\r   ✅ ${successCount}/${data.length} documents insérés`);
    } catch (error) {
      errorCount++;
      console.error(`\n   ❌ Erreur insertion ${item.id || 'N/A'}:`, error.message);
    }
  }

  console.log(`\n   ✅ Collection "${collectionName}" migrée: ${successCount} succès, ${errorCount} erreurs`);
  return { successCount, errorCount };
}

async function createFirebaseUsers() {
  console.log('\n👤 Création des utilisateurs Firebase Authentication...');
  let successCount = 0;
  let errorCount = 0;
  const userIdMap = {};

  for (const user of users) {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: `${user.prenom} ${user.nom}`,
        emailVerified: true
      });

      console.log(`   ✅ Utilisateur créé: ${user.email} (UID: ${userRecord.uid})`);

      // Sauvegarder le profil dans Firestore
      await db.collection('users').doc(userRecord.uid).set({
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        displayName: `${user.prenom} ${user.nom}`,
        telephone: user.telephone,
        type_user_id: user.type_user_id,
        role: user.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      userIdMap[user.id] = userRecord.uid;
      successCount++;
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`   ⚠️  Utilisateur existe déjà: ${user.email}`);
        // Récupérer l'utilisateur existant
        try {
          const existingUser = await auth.getUserByEmail(user.email);
          userIdMap[user.id] = existingUser.uid;
          successCount++;
        } catch (e) {
          errorCount++;
        }
      } else {
        errorCount++;
        console.error(`   ❌ Erreur création ${user.email}:`, error.message);
      }
    }
  }

  console.log(`   ✅ Utilisateurs créés: ${successCount} succès, ${errorCount} erreurs\n`);
  return userIdMap;
}

async function migrateSignalements(userIdMap) {
  console.log('\n📍 Migration des signalements...');
  let successCount = 0;
  let errorCount = 0;

  for (const signalement of signalements) {
    try {
      const docData = { ...signalement };
      
      // Remplacer user_id par le Firebase UID
      if (userIdMap[signalement.user_id]) {
        docData.user_uid = userIdMap[signalement.user_id];
        delete docData.user_id;
      }

      // Ajouter timestamps
      docData.date_signalement = admin.firestore.Timestamp.now();
      docData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      docData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      docData.is_synced = true;

      // Ajouter dates si présentes
      if (signalement.date_debut) {
        docData.date_debut = admin.firestore.Timestamp.fromDate(new Date());
      }
      if (signalement.date_fin_prevue) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);
        docData.date_fin_prevue = admin.firestore.Timestamp.fromDate(futureDate);
      }
      if (signalement.date_fin_reelle) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 3);
        docData.date_fin_reelle = admin.firestore.Timestamp.fromDate(pastDate);
      }

      const docId = String(signalement.id);
      await db.collection('signalements').doc(docId).set(docData);
      
      successCount++;
      process.stdout.write(`\r   ✅ ${successCount}/${signalements.length} signalements insérés`);
    } catch (error) {
      errorCount++;
      console.error(`\n   ❌ Erreur insertion signalement ${signalement.id}:`, error.message);
    }
  }

  console.log(`\n   ✅ Signalements migrés: ${successCount} succès, ${errorCount} erreurs`);
  return { successCount, errorCount };
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

async function main() {
  try {
    const startTime = Date.now();
    const stats = {
      total: 0,
      success: 0,
      errors: 0
    };

    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 MIGRATION DES DONNÉES VERS FIREBASE FIRESTORE');
    console.log('   Projet: Cloud P17 - Signalement Routier');
    console.log('═══════════════════════════════════════════════════════\n');

    // 1. Migrer les types d'utilisateurs
    const typeUsersResult = await migrateCollection('type_users', typeUsers, { useCustomId: true });
    stats.total += typeUsers.length;
    stats.success += typeUsersResult.successCount;
    stats.errors += typeUsersResult.errorCount;

    // 2. Migrer les statuts
    const statusResult = await migrateCollection('status', status, { useCustomId: true });
    stats.total += status.length;
    stats.success += statusResult.successCount;
    stats.errors += statusResult.errorCount;

    // 3. Migrer les villes
    const villesResult = await migrateCollection('villes', villes, { useCustomId: true });
    stats.total += villes.length;
    stats.success += villesResult.successCount;
    stats.errors += villesResult.errorCount;

    // 4. Migrer les routes
    const routesResult = await migrateCollection('routes', routes, { useCustomId: true });
    stats.total += routes.length;
    stats.success += routesResult.successCount;
    stats.errors += routesResult.errorCount;

    // 5. Migrer les entreprises
    const entreprisesResult = await migrateCollection('entreprises', entreprises, { useCustomId: true });
    stats.total += entreprises.length;
    stats.success += entreprisesResult.successCount;
    stats.errors += entreprisesResult.errorCount;

    // 6. Créer les utilisateurs Firebase
    const userIdMap = await createFirebaseUsers();
    stats.total += users.length;
    stats.success += Object.keys(userIdMap).length;

    // 7. Migrer les signalements
    const signalementsResult = await migrateSignalements(userIdMap);
    stats.total += signalements.length;
    stats.success += signalementsResult.successCount;
    stats.errors += signalementsResult.errorCount;

    // Résumé final
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Total documents: ${stats.total}`);
    console.log(`✅ Succès: ${stats.success}`);
    console.log(`❌ Erreurs: ${stats.errors}`);
    console.log(`⏱️  Durée: ${duration}s`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('🎉 Migration terminée avec succès !');
    console.log('\n📋 Collections créées dans Firestore:');
    console.log('   • type_users');
    console.log('   • status');
    console.log('   • villes');
    console.log('   • routes');
    console.log('   • entreprises');
    console.log('   • users');
    console.log('   • signalements');
    
    console.log('\n👤 Utilisateurs créés dans Firebase Authentication:');
    users.forEach(u => {
      console.log(`   • ${u.email} (${u.role}) - Mot de passe: ${u.password}`);
    });

    console.log('\n🔍 Vérifiez vos données:');
    console.log('   Firebase Console → Authentication → Utilisateurs');
    console.log('   Firebase Console → Firestore → Data');
    console.log('\n✅ Vous pouvez maintenant utiliser votre application !\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur fatale lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
main();
