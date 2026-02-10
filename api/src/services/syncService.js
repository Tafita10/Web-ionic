'use strict';

const createError = require('http-errors');
const { pool } = require('../config/database');
const journal = require('../config/logger');
const { database, admin, firebaseActif } = require('../config/firebase');
const {
  listerEnAttenteSync,
  marquerSynchronise,
  upsertDepuisFirebase
} = require('./signalementService');

const enregistrerLog = async (type, direction, entite, idEntite, estReussie, message, donneesEnvoyees, donneesRecues, idUtilisateur) => {
  try {
    await pool.query(
      `INSERT INTO logs_synchronisation (
        type_operation, direction, entite_type, id_entite,
        est_reussie, message_erreur, nombre_elements_traites,
        donnees_envoyees, donnees_recues, id_utilisateur_initiateur
      ) VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8, $9)`
      , [type, direction, entite, idEntite || null, estReussie, message || null, donneesEnvoyees || null, donneesRecues || null, idUtilisateur || null]
    );
  } catch (erreur) {
    journal.warn('Log synchronisation non enregistré', erreur);
  }
};

const pullDepuisFirebase = async (idUtilisateur) => {
  if (!firebaseActif) {
    journal.warn('Firebase désactivé - utilisation de PostgreSQL uniquement');
    return { ajoutes: 0, maj: 0, total: 0, message: 'Firebase désactivé' };
  }

  try {
    // Utiliser Realtime Database au lieu de Firestore
    const snapshot = await database.ref('signalements').once('value');
    const data = snapshot.val();
    
    if (!data) {
      journal.info('Aucun signalement dans Firebase Realtime Database');
      return { ajoutes: 0, maj: 0, total: 0 };
    }

    let ajoutes = 0;
    let maj = 0;
    const signalements = Object.entries(data);

    for (const [firebaseId, signalement] of signalements) {
      const { rows: utilisateurs } = await pool.query(
        'SELECT id_utilisateur FROM utilisateurs WHERE uid_firebase = $1 LIMIT 1',
        [signalement.userId]
      );
      const idLocal = utilisateurs[0]?.id_utilisateur || idUtilisateur;

      const { rows: existants } = await pool.query(
        'SELECT id_signalement FROM signalements WHERE id_firebase = $1 LIMIT 1',
        [firebaseId]
      );

      if (existants.length > 0) {
        await pool.query(
          `UPDATE signalements
           SET description_signalement = COALESCE($1, description_signalement),
               latitude = $2,
               longitude = $3,
               date_modification = CURRENT_TIMESTAMP,
               est_synchronise = TRUE
           WHERE id_firebase = $4`,
          [signalement.description, signalement.latitude, signalement.longitude, firebaseId]
        );
        await marquerSynchronise(existants[0].id_signalement, firebaseId);
        maj += 1;
      } else {
        await upsertDepuisFirebase(firebaseId, signalement, idLocal);
        ajoutes += 1;
      }
    }

    await enregistrerLog('PULL', 'DEPUIS_FIREBASE', 'signalements', null, true, null, null, null, idUtilisateur);
    return { ajoutes, maj, total: signalements.length };
  } catch (erreur) {
    journal.error('Erreur Firebase PULL - fallback PostgreSQL:', erreur);
    await enregistrerLog('PULL', 'DEPUIS_FIREBASE', 'signalements', null, false, erreur.message, null, null, idUtilisateur);
    
    // Fallback: retourner les données PostgreSQL
    const { rows } = await pool.query('SELECT COUNT(*) as total FROM signalements');
    return { 
      ajoutes: 0, 
      maj: 0, 
      total: parseInt(rows[0].total),
      message: 'Firebase inaccessible - utilisation de PostgreSQL',
      erreur: erreur.message
    };
  }
};

const pushVersFirebase = async (idUtilisateur) => {
  if (!firebaseActif) {
    journal.warn('Firebase désactivé - données stockées dans PostgreSQL uniquement');
    return { pousses: 0, total: 0, message: 'Firebase désactivé' };
  }

  try {
    const enAttente = await listerEnAttenteSync();
    let pousses = 0;

    for (const signalement of enAttente) {
      const donneesFirebase = {
        description: signalement.description_signalement,
        latitude: Number(signalement.latitude),
        longitude: Number(signalement.longitude),
        status: signalement.id_statut,
        budget: signalement.budget_estime_ar ? Number(signalement.budget_estime_ar) : null,
        surface: signalement.surface_endommagee_m2 ? Number(signalement.surface_endommagee_m2) : null,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      };

      if (signalement.id_firebase) {
        // Mise à jour d'un signalement existant
        await database.ref(`signalements/${signalement.id_firebase}`).update(donneesFirebase);
        await marquerSynchronise(signalement.id_signalement, signalement.id_firebase);
      } else {
        // Création d'un nouveau signalement
        const newRef = database.ref('signalements').push();
        await newRef.set(donneesFirebase);
        await marquerSynchronise(signalement.id_signalement, newRef.key);
      }
      pousses += 1;
    }

    await enregistrerLog('PUSH', 'VERS_FIREBASE', 'signalements', null, true, null, enAttente.length, null, idUtilisateur);
    return { pousses, total: enAttente.length };
  } catch (erreur) {
    journal.error('Erreur Firebase PUSH - données conservées dans PostgreSQL:', erreur);
    await enregistrerLog('PUSH', 'VERS_FIREBASE', 'signalements', null, false, erreur.message, null, null, idUtilisateur);
    
    // Fallback: les données restent dans PostgreSQL
    const enAttente = await listerEnAttenteSync();
    return { 
      pousses: 0, 
      total: enAttente.length,
      message: 'Firebase inaccessible - données conservées dans PostgreSQL',
      erreur: erreur.message
    };
  }
};

module.exports = {
  pullDepuisFirebase,
  pushVersFirebase
};
