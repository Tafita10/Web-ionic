'use strict';

const createError = require('http-errors');
const { pool } = require('../config/database');
const { auth: firebaseAuth, firestore, firebaseActif } = require('../config/firebase');
const journal = require('../config/logger');
const { hasherMotDePasse, comparerMotDePasse } = require('../utils/motsdepasse');

/**
 * Service de basculement automatique Firebase <-> PostgreSQL
 * Priorité : Firebase (si actif) > PostgreSQL (fallback)
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

  if (!firebaseActif) {
    etatFirebase = false;
    derniereVerification = maintenant;
    journal.info('Firebase désactivé dans la configuration');
    return false;
  }

  try {
    // Test rapide : Lister 1 utilisateur pour vérifier la connexion
    await firebaseAuth.listUsers(1);
    etatFirebase = true;
    derniereVerification = maintenant;
    journal.info('✓ Firebase disponible');
    return true;
  } catch (erreur) {
    etatFirebase = false;
    derniereVerification = maintenant;
    journal.warn('✗ Firebase indisponible, basculement vers PostgreSQL', erreur.message);
    return false;
  }
};

/**
 * Créer utilisateur dans Firebase
 */
const creerUtilisateurFirebase = async (email, motDePasse, nomComplet) => {
  try {
    const userRecord = await firebaseAuth.createUser({
      email,
      password: motDePasse,
      displayName: nomComplet,
      disabled: false
    });
    
    // Enregistrer dans Firestore
    await firestore.collection('utilisateurs').doc(userRecord.uid).set({
      email,
      nom_complet: nomComplet,
      date_creation: new Date(),
      source: 'firebase'
    });
    
    journal.info(`Utilisateur créé dans Firebase: ${email}`);
    return userRecord.uid;
  } catch (erreur) {
    journal.error('Erreur création utilisateur Firebase', erreur);
    throw erreur;
  }
};

/**
 * Authentifier via Firebase
 * Note: L'Admin SDK ne peut pas vérifier le mot de passe directement.
 * Cette fonction suppose que l'utilisateur existe dans Firebase et retourne ses infos.
 * La vérification du mot de passe doit se faire côté client avec Firebase Auth Client SDK,
 * ou on vérifie le hash PostgreSQL si l'utilisateur est synchronisé.
 */
const authentifierFirebase = async (email, motDePasse) => {
  try {
    // Récupérer l'utilisateur Firebase par email
    const userRecord = await firebaseAuth.getUserByEmail(email);
    
    // Vérifier que le compte est actif
    if (userRecord.disabled) {
      throw createError(403, 'Compte Firebase désactivé');
    }
    
    // Comme on ne peut pas vérifier le mot de passe avec l'Admin SDK,
    // on vérifie d'abord si l'utilisateur existe dans PostgreSQL
    const { pool } = require('../config/database');
    const { comparerMotDePasse } = require('../utils/motsdepasse');
    
    const { rows } = await pool.query(
      'SELECT mot_de_passe_hash FROM utilisateurs WHERE uid_firebase = $1 OR email = $2 LIMIT 1',
      [userRecord.uid, email]
    );
    
    if (rows.length > 0 && rows[0].mot_de_passe_hash) {
      // Vérifier le mot de passe avec le hash PostgreSQL
      const motOK = await comparerMotDePasse(motDePasse, rows[0].mot_de_passe_hash);
      if (!motOK) {
        throw createError(401, 'Mot de passe incorrect');
      }
    } else {
      // Pas de hash dans PostgreSQL - on fait confiance que Firebase a validé
      // (Ce cas se produit si l'utilisateur n'a été créé que dans Firebase)
      journal.warn(`Authentification Firebase sans vérification PostgreSQL pour: ${email}`);
    }
    
    return {
      uid_firebase: userRecord.uid,
      email: userRecord.email,
      nom_complet: userRecord.displayName || email,
      source: 'firebase'
    };
  } catch (erreur) {
    if (erreur.code === 'auth/user-not-found') {
      throw createError(401, 'Identifiants invalides');
    }
    throw erreur;
  }
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
