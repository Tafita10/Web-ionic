'use strict';

const asyncHandler = require('../middlewares/asyncHandler');
const syncService = require('../services/syncService');
const { synchroniserUtilisateurs, verifierFirebaseDisponible } = require('../services/authFailoverService');

const pull = asyncHandler(async (req, res) => {
  const resultat = await syncService.pullDepuisFirebase(req.utilisateur?.id_utilisateur);
  res.json(resultat);
});

const push = asyncHandler(async (req, res) => {
  const resultat = await syncService.pushVersFirebase(req.utilisateur?.id_utilisateur);
  res.json(resultat);
});

const syncUtilisateurs = asyncHandler(async (req, res) => {
  const resultat = await synchroniserUtilisateurs();
  res.json({
    message: 'Synchronisation des utilisateurs terminée',
    ...resultat
  });
});

const statusFirebase = asyncHandler(async (req, res) => {
  const disponible = await verifierFirebaseDisponible();
  res.json({
    firebase_disponible: disponible,
    message: disponible 
      ? 'Firebase est disponible - Authentification prioritaire via Firebase'
      : 'Firebase indisponible - Basculement automatique vers PostgreSQL'
  });
});

module.exports = {
  pull,
  push,
  syncUtilisateurs,
  statusFirebase
};
