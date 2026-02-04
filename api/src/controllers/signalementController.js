'use strict';

const createError = require('http-errors');
const asyncHandler = require('../middlewares/asyncHandler');
const signalementService = require('../services/signalementService');

const lister = asyncHandler(async (req, res) => {
  const { statut, limite } = req.query;
  const signalements = await signalementService.listerSignalements({
    idStatut: statut ? Number(statut) : undefined,
    limite: limite ? Number(limite) : 50
  });
  res.json({ signalements });
});

const creer = asyncHandler(async (req, res) => {
  const { titre_signalement, description_signalement, id_ville, latitude, longitude } = req.body;
  if (!titre_signalement || !description_signalement || !id_ville || !latitude || !longitude) {
    throw createError(400, 'Champs requis manquants');
  }
  const idRoute = req.body.id_route || null;
  const typeProbleme = req.body.type_probleme || null;
  const niveauGravite = req.body.niveau_gravite || 'Moyen';

  const signalementCree = await signalementService.creerSignalement({
    titre_signalement,
    description_signalement,
    id_ville,
    id_route: idRoute,
    latitude,
    longitude,
    type_probleme: typeProbleme,
    niveau_gravite: niveauGravite
  }, req.utilisateur);

  res.status(201).json({ id_signalement: signalementCree.id_signalement });
});

const changerStatut = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { id_statut, commentaire } = req.body;
  if (!id_statut) throw createError(400, 'Nouveau statut requis');
  await signalementService.changerStatut(Number(id), Number(id_statut), req.utilisateur.id_utilisateur, commentaire);
  res.json({ message: 'Statut mis à jour' });
});

module.exports = {
  lister,
  creer,
  changerStatut
};
