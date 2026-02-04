'use strict';

const createError = require('http-errors');
const journal = require('../config/logger');

const routeIntrouvable = (_req, _res, next) => {
  next(createError(404, 'Route introuvable'));
};

const gestionnaireErreurs = (err, _req, res, _next) => {
  const statut = err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  journal.error(message, err);
  res.status(statut).json({ erreur: message });
};

module.exports = {
  routeIntrouvable,
  gestionnaireErreurs
};
