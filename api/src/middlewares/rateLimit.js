'use strict';

const rateLimit = require('express-rate-limit');
const configuration = require('../config/env');

const construireLimiteur = (max, fenetreMinutes, message) => rateLimit({
  windowMs: fenetreMinutes * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erreur: message }
});

const limiteurConnexion = construireLimiteur(
  configuration.limitation.login.max,
  configuration.limitation.login.fenetreMinutes,
  'Trop de tentatives de connexion'
);

const limiteurInscription = construireLimiteur(
  configuration.limitation.inscription.max,
  configuration.limitation.inscription.fenetreMinutes,
  'Trop de tentatives d\'inscription'
);

const limiteurAPI = construireLimiteur(
  configuration.limitation.api.max,
  configuration.limitation.api.fenetreMinutes,
  'Trop de requêtes, réessayez plus tard'
);

module.exports = {
  limiteurConnexion,
  limiteurInscription,
  limiteurAPI
};
