'use strict';

const asyncHandler = require('../middlewares/asyncHandler');
const { pool } = require('../config/database');
const { hasherMotDePasse, comparerMotDePasse } = require('../utils/motsdepasse');

const listerUtilisateurs = asyncHandler(async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id_utilisateur, nom_complet, nom_utilisateur, email, id_type_utilisateur, est_actif, est_bloque FROM utilisateurs ORDER BY id_utilisateur DESC LIMIT 50'
  );
  res.json({ utilisateurs: rows });
});

const modifierProfil = asyncHandler(async (req, res) => {
  const { id_utilisateur } = req.utilisateur;
  const { nom_complet, nom_utilisateur, email, telephone } = req.body;
  
  const updates = [];
  const values = [];
  let index = 1;
  
  if (nom_complet) { updates.push(`nom_complet = $${index++}`); values.push(nom_complet); }
  if (nom_utilisateur) { updates.push(`nom_utilisateur = $${index++}`); values.push(nom_utilisateur); }
  if (email) { updates.push(`email = $${index++}`); values.push(email); }
  if (telephone !== undefined) { updates.push(`telephone = $${index++}`); values.push(telephone); }
  
  if (updates.length === 0) {
    return res.status(400).json({ message: 'Aucune modification fournie' });
  }
  
  values.push(id_utilisateur);
  const query = `UPDATE utilisateurs SET ${updates.join(', ')}, date_modification = NOW() WHERE id_utilisateur = $${index} RETURNING id_utilisateur, nom_complet, nom_utilisateur, email, telephone`;
  
  const { rows } = await pool.query(query, values);
  res.json({ utilisateur: rows[0] });
});

const changerMotDePasse = asyncHandler(async (req, res) => {
  const { id_utilisateur } = req.utilisateur;
  const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
  
  if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
    return res.status(400).json({ message: 'Ancien et nouveau mot de passe requis' });
  }
  
  // Vérifier ancien mot de passe
  const { rows } = await pool.query('SELECT mot_de_passe_hash FROM utilisateurs WHERE id_utilisateur = $1', [id_utilisateur]);
  const estValide = await comparerMotDePasse(ancien_mot_de_passe, rows[0].mot_de_passe_hash);
  
  if (!estValide) {
    return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
  }
  
  // Hash nouveau mot de passe
  const nouveauHash = await hasherMotDePasse(nouveau_mot_de_passe);
  await pool.query('UPDATE utilisateurs SET mot_de_passe_hash = $1, date_modification = NOW() WHERE id_utilisateur = $2', [nouveauHash, id_utilisateur]);
  
  res.json({ message: 'Mot de passe mis à jour' });
});

const listerBloques = asyncHandler(async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id_utilisateur, nom_complet, nom_utilisateur, email, date_blocage, raison_blocage, tentatives_connexion_echouees FROM utilisateurs WHERE est_bloque = true ORDER BY date_blocage DESC'
  );
  res.json({ utilisateurs: rows });
});

const debloquerUtilisateur = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await pool.query(
    'UPDATE utilisateurs SET est_bloque = false, tentatives_connexion_echouees = 0, date_blocage = NULL, raison_blocage = NULL WHERE id_utilisateur = $1',
    [id]
  );
  
  res.json({ message: `Utilisateur ${id} débloqué avec succès` });
});

module.exports = {
  listerUtilisateurs,
  modifierProfil,
  changerMotDePasse,
  listerBloques,
  debloquerUtilisateur
};
