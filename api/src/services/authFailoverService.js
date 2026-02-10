'use strict';

const createError = require('http-errors');
const { pool } = require('../config/database');
const { database, firebaseActif } = require('../config/firebase');
const journal = require('../config/logger');
const { hasherMotDePasse, comparerMotDePasse } = require('../utils/motsdepasse');

/**
 * Service de basculement automatique Firebase <-> PostgreSQL
 * Priorité : Firebase Realtime Database (si actif) > PostgreSQL (fallback)
 */

let etatFirebase = null;
let derniereVerification = 0;
const CACHE_DUREE_MS = 30000; // 30 secondes

/**
 * Vérifier si Firebase est disponible
 */
const verifierFirebaseDisponible = async () => {
  const maintenant = Date.now();
  
  // Cache pour éviter trop de vérifications
  if (etatFirebase !== null && (maintenant - derniereVerification) < CACHE_DUREE_MS) {
    return etatFirebase;
  }

  if (!firebaseActif || !database) {
    etatFirebase = false;
    derniereVerification = maintenant;
    return false;
  }

  try {
    // Test rapide : vérifier la connexion à la base
    await database.ref('.info/connected').once('value');
    etatFirebase = true;
    derniereVerification = maintenant;
    return true;
  } catch (erreur) {
    etatFirebase = false;
    derniereVerification = maintenant;
    journal.warn('✗ Firebase Realtime Database indisponible, basculement vers PostgreSQL');
    return false;
  }
};

/**
 * Créer utilisateur dans Firebase Realtime Database
 */
const creerUtilisateurFirebase = async (email, motDePasse, nomComplet) => {
  if (!database) {
    throw createError(503, 'Firebase Realtime Database non disponible');
  }

  try {
    const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await database.ref(`utilisateurs/${uid}`).set({
      email,
      nom_complet: nomComplet,
      date_creation: Date.now(),
      source: 'firebase'
    });
    
    journal.info(`Utilisateur créé dans Firebase: ${email}`);
    return uid;
  } catch (erreur) {
    journal.error('Erreur création utilisateur Firebase', erreur);
    throw erreur;
  }
};

/**
 * Authentifier via Firebase
 * Note: Firebase Realtime Database ne gère pas l'authentification.
 * On utilise PostgreSQL pour l'authentification et Firebase pour la sync des données.
 */
const authentifierFirebase = async (email, motDePasse) => {
  // Firebase Realtime Database n'a pas de système d'authentification utilisateur
  // On se rabat sur PostgreSQL pour l'authentification
  // Firebase est utilisé uniquement pour synchroniser les données
  return null;
};

/**
 * Synchroniser utilisateur Firebase -> PostgreSQL
 */
const syncUtilisateurVersPostgres = async (uidFirebase, donneesFirebase) => {
  try {
    const { rows: existants } = await pool.query(
      'SELECT id_utilisateur FROM utilisateurs WHERE uid_firebase = $1 LIMIT 1',
      [uidFirebase]
    );

    if (existants.length > 0) {
      // Mettre à jour
      await pool.query(
        `UPDATE utilisateurs 
         SET email = $1, nom_complet = $2, date_modification = CURRENT_TIMESTAMP
         WHERE uid_firebase = $3`,
        [donneesFirebase.email, donneesFirebase.nom_complet, uidFirebase]
      );
      journal.info(`Utilisateur synchronisé Firebase->PostgreSQL: ${donneesFirebase.email}`);
      return existants[0].id_utilisateur;
    } else {
      // Créer nouveau
      const { rows } = await pool.query(
        `INSERT INTO utilisateurs (
          uid_firebase, email, nom_complet, nom_utilisateur, 
          mot_de_passe_hash, id_type_utilisateur, est_verifie
        ) VALUES ($1, $2, $3, $4, $5, 2, TRUE)
        RETURNING id_utilisateur`,
        [
          uidFirebase,
          donneesFirebase.email,
          donneesFirebase.nom_complet,
          donneesFirebase.email.split('@')[0], // nom_utilisateur depuis email
          '' // Pas de hash car authentifié via Firebase
        ]
      );
      journal.info(`Nouvel utilisateur créé depuis Firebase: ${donneesFirebase.email}`);
      return rows[0].id_utilisateur;
    }
  } catch (erreur) {
    journal.error('Erreur synchronisation utilisateur vers PostgreSQL', erreur);
    throw erreur;
  }
};

/**
 * Synchroniser utilisateur PostgreSQL -> Firebase
 */
const syncUtilisateurVersFirebase = async (utilisateur, motDePasse) => {
  try {
    let userRecord;
    
    // Vérifier si l'utilisateur existe déjà dans Firebase
    if (utilisateur.uid_firebase) {
      try {
        userRecord = await firebaseAuth.getUser(utilisateur.uid_firebase);
        journal.info(`Utilisateur Firebase existant: ${utilisateur.email}`);
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          // L'UID n'existe plus, créer nouveau
          userRecord = null;
        } else {
          throw err;
        }
      }
    }
    
    if (!userRecord) {
      try {
        userRecord = await firebaseAuth.getUserByEmail(utilisateur.email);
        journal.info(`Utilisateur Firebase trouvé par email: ${utilisateur.email}`);
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          // Créer nouveau utilisateur Firebase
          const uid = await creerUtilisateurFirebase(
            utilisateur.email,
            motDePasse || 'TemporaryPassword123!', // Mot de passe temporaire si non fourni
            utilisateur.nom_complet
          );
          
          // Mettre à jour PostgreSQL avec l'UID Firebase
          await pool.query(
            'UPDATE utilisateurs SET uid_firebase = $1 WHERE id_utilisateur = $2',
            [uid, utilisateur.id_utilisateur]
          );
          
          journal.info(`Utilisateur PostgreSQL synchronisé vers Firebase: ${utilisateur.email}`);
          return uid;
        } else {
          throw err;
        }
      }
    }
    
    // Mettre à jour PostgreSQL avec l'UID si nécessaire
    if (!utilisateur.uid_firebase && userRecord) {
      await pool.query(
        'UPDATE utilisateurs SET uid_firebase = $1 WHERE id_utilisateur = $2',
        [userRecord.uid, utilisateur.id_utilisateur]
      );
    }
    
    return userRecord.uid;
  } catch (erreur) {
    journal.error('Erreur synchronisation utilisateur vers Firebase', erreur);
    throw erreur;
  }
};

/**
 * Synchronisation bidirectionnelle complète
 */
const synchroniserUtilisateurs = async () => {
  const firebaseDisponible = await verifierFirebaseDisponible();
  const resultats = {
    firebase_vers_postgres: { ajoutes: 0, maj: 0 },
    postgres_vers_firebase: { ajoutes: 0, maj: 0 },
    erreurs: []
  };

  if (firebaseDisponible) {
    try {
      // Firebase -> PostgreSQL
      const listResult = await firebaseAuth.listUsers(1000);
      for (const userRecord of listResult.users) {
        try {
          const id = await syncUtilisateurVersPostgres(userRecord.uid, {
            email: userRecord.email,
            nom_complet: userRecord.displayName || userRecord.email
          });
          
          if (id) {
            resultats.firebase_vers_postgres.maj += 1;
          } else {
            resultats.firebase_vers_postgres.ajoutes += 1;
          }
        } catch (err) {
          resultats.erreurs.push(`Firebase->PG ${userRecord.email}: ${err.message}`);
        }
      }

      // PostgreSQL -> Firebase
      const { rows: utilisateursPostgres } = await pool.query(
        `SELECT id_utilisateur, uid_firebase, email, nom_complet, mot_de_passe_hash
         FROM utilisateurs 
         WHERE est_actif = TRUE`
      );
      
      for (const utilisateur of utilisateursPostgres) {
        try {
          await syncUtilisateurVersFirebase(utilisateur, null);
          resultats.postgres_vers_firebase.maj += 1;
        } catch (err) {
          resultats.erreurs.push(`PG->Firebase ${utilisateur.email}: ${err.message}`);
        }
      }
    } catch (erreur) {
      journal.error('Erreur synchronisation utilisateurs', erreur);
      throw erreur;
    }
  } else {
    journal.warn('Firebase indisponible, synchronisation impossible');
    throw createError(503, 'Firebase indisponible');
  }

  return resultats;
};

module.exports = {
  verifierFirebaseDisponible,
  creerUtilisateurFirebase,
  authentifierFirebase,
  syncUtilisateurVersPostgres,
  syncUtilisateurVersFirebase,
  synchroniserUtilisateurs
};
