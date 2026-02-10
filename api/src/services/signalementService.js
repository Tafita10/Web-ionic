'use strict';

const createError = require('http-errors');
const { pool } = require('../config/database');

const selectionSignalement = `
  s.id_signalement,
  s.titre_signalement,
  s.description_signalement,
  s.latitude,
  s.longitude,
  s.id_ville,
  v.nom_ville,
  s.id_statut,
  st.libelle_statut,
  st.code_couleur,
  s.type_probleme,
  s.niveau_gravite,
  s.date_signalement,
  s.id_firebase,
  s.est_synchronise
`;

const listerSignalements = async ({ idStatut, limite = 50 } = {}) => {
  const filtres = [];
  const valeurs = [];
  if (idStatut) {
    valeurs.push(idStatut);
    filtres.push(`s.id_statut = $${valeurs.length}`);
  }

  const where = filtres.length ? `WHERE ${filtres.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT ${selectionSignalement}
     FROM signalements s
     JOIN villes v ON s.id_ville = v.id_ville
     JOIN statuts_signalement st ON s.id_statut = st.id_statut
     ${where}
     ORDER BY s.date_signalement DESC
     LIMIT $${valeurs.length + 1}`,
    [...valeurs, limite]
  );
  return rows;
};

const creerSignalement = async (donnees, utilisateur) => {
  if (!utilisateur) throw createError(401, 'Utilisateur requis');
  const {
    titre_signalement,
    description_signalement,
    id_ville,
    id_route,
    latitude,
    longitude,
    type_probleme,
    niveau_gravite
  } = donnees;

  const { rows } = await pool.query(
    `INSERT INTO signalements (
      titre_signalement, description_signalement, id_ville, id_route, latitude, longitude,
      type_probleme, niveau_gravite, id_utilisateur_createur, id_statut
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'Moyen'), $9, 1)
    RETURNING id_signalement`,
    [
      titre_signalement,
      description_signalement,
      id_ville,
      id_route || null,
      latitude,
      longitude,
      type_probleme,
      niveau_gravite,
      utilisateur.id_utilisateur
    ]
  );

  return rows[0];
};

const changerStatut = async (idSignalement, idStatut, idUtilisateur, commentaire) => {
  const { rows } = await pool.query(
    'SELECT changer_statut_signalement($1, $2, $3, $4) AS ok',
    [idSignalement, idStatut, idUtilisateur, commentaire || null]
  );
  const ok = rows[0]?.ok;
  if (!ok) throw createError(400, 'Impossible de changer le statut');
  return true;
};

const listerEnAttenteSync = async () => {
  const { rows } = await pool.query(
    `SELECT s.id_signalement, s.id_firebase, s.titre_signalement, s.description_signalement,
            s.latitude, s.longitude, s.id_ville, s.id_utilisateur_createur, s.id_statut,
            s.surface_endommagee_m2, r.budget_estime_ar, r.id_entreprise_assignee,
            s.date_signalement
     FROM signalements s
     LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
     WHERE s.est_synchronise = FALSE OR s.id_firebase IS NULL`
  );
  return rows;
};

const marquerSynchronise = async (idSignalement, idFirebase) => {
  await pool.query(
    `UPDATE signalements
     SET id_firebase = COALESCE($2, id_firebase), est_synchronise = TRUE, derniere_synchronisation = CURRENT_TIMESTAMP
     WHERE id_signalement = $1`,
    [idSignalement, idFirebase || null]
  );
};

const upsertDepuisFirebase = async (docId, donnees, idUtilisateurLocal) => {
  const statut = donnees.status || 'Nouveau';
  const { rows: statutRows } = await pool.query(
    `SELECT id_statut FROM statuts_signalement WHERE LOWER(libelle_statut) = LOWER($1) LIMIT 1`,
    [statut]
  );
  const idStatut = statutRows[0]?.id_statut || 1;

  const { rows: existants } = await pool.query(
    'SELECT id_signalement FROM signalements WHERE id_firebase = $1 LIMIT 1',
    [docId]
  );

  if (existants.length > 0) {
    await pool.query(
      `UPDATE signalements
       SET description_signalement = $1,
           latitude = $2,
           longitude = $3,
           id_statut = $4,
           date_modification = CURRENT_TIMESTAMP,
           est_synchronise = TRUE
       WHERE id_firebase = $5`,
      [
        donnees.description || 'Signalement Firebase',
        donnees.latitude,
        donnees.longitude,
        idStatut,
        docId
      ]
    );
    return existants[0].id_signalement;
  }

  const { rows } = await pool.query(
    `INSERT INTO signalements (
      titre_signalement, description_signalement, id_ville, latitude, longitude,
      id_statut, id_utilisateur_createur, id_firebase, est_synchronise
    ) VALUES ($1, $2, 1, $3, $4, $5, $6, $7, TRUE)
    RETURNING id_signalement`,
    [
      donnees.description || 'Signalement mobile',
      donnees.description || 'Signalement mobile',
      donnees.latitude,
      donnees.longitude,
      idStatut,
      idUtilisateurLocal,
      docId
    ]
  );
  return rows[0].id_signalement;
};

module.exports = {
  listerSignalements,
  creerSignalement,
  changerStatut,
  listerEnAttenteSync,
  marquerSynchronise,
  upsertDepuisFirebase
};
