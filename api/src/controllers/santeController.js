'use strict';

const asyncHandler = require('../middlewares/asyncHandler');
const { verifierConnexion } = require('../config/database');
const { firebaseActif } = require('../config/firebase');

const sante = asyncHandler(async (_req, res) => {
  await verifierConnexion();
  res.json({ statut: 'ok', baseDeDonnees: 'ok', firebase: firebaseActif ? 'ok' : 'desactive' });
});

module.exports = {
  sante
};
