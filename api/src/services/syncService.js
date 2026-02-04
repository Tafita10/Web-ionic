'use strict';

const createError = require('http-errors');
const { pool } = require('../config/database');
const journal = require('../config/logger');
const { firestore, admin, firebaseActif } = require('../config/firebase');
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
  if (!firebaseActif) throw createError(503, 'Firebase désactivé');
  const snapshot = await firestore.collection('signalements').get();
  let ajoutes = 0;
  let maj = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const { rows: utilisateurs } = await pool.query(
      'SELECT id_utilisateur FROM utilisateurs WHERE uid_firebase = $1 LIMIT 1',
      [data.userId]
    );
    const idLocal = utilisateurs[0]?.id_utilisateur || idUtilisateur;

    const { rows: existants } = await pool.query(
      'SELECT id_signalement FROM signalements WHERE id_firebase = $1 LIMIT 1',
      [doc.id]
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
        [data.description, data.latitude, data.longitude, doc.id]
      );
      await marquerSynchronise(existants[0].id_signalement, doc.id);
      maj += 1;
    } else {
      await upsertDepuisFirebase(doc.id, data, idLocal);
      ajoutes += 1;
    }
  }

  await enregistrerLog('PULL', 'DEPUIS_FIREBASE', 'signalements', null, true, null, null, null, idUtilisateur);
  return { ajoutes, maj, total: snapshot.size };
};

const pushVersFirebase = async (idUtilisateur) => {
  if (!firebaseActif) throw createError(503, 'Firebase désactivé');
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
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (signalement.id_firebase) {
      await firestore.collection('signalements').doc(signalement.id_firebase).set(donneesFirebase, { merge: true });
      await marquerSynchronise(signalement.id_signalement, signalement.id_firebase);
    } else {
      const docRef = await firestore.collection('signalements').add(donneesFirebase);
      await marquerSynchronise(signalement.id_signalement, docRef.id);
    }
    pousses += 1;
  }

  await enregistrerLog('PUSH', 'VERS_FIREBASE', 'signalements', null, true, null, enAttente.length, null, idUtilisateur);
  return { pousses, total: enAttente.length };
};

module.exports = {
  pullDepuisFirebase,
  pushVersFirebase
};
