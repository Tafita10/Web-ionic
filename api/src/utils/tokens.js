'use strict';

const jwt = require('jsonwebtoken');
const configuration = require('../config/env');

const creerTokenAcces = (utilisateur) => {
  const payload = {
    id_utilisateur: utilisateur.id_utilisateur,
    id_type_utilisateur: utilisateur.id_type_utilisateur,
    email: utilisateur.email,
    nom_utilisateur: utilisateur.nom_utilisateur
  };
  return jwt.sign(payload, configuration.jwt.secret, { expiresIn: configuration.jwt.duree });
};

const creerTokenRafraichissement = (utilisateur) => {
  const payload = {
    id_utilisateur: utilisateur.id_utilisateur,
    email: utilisateur.email
  };
  return jwt.sign(payload, configuration.jwt.refreshSecret, { expiresIn: configuration.jwt.refreshDuree });
};

const verifierTokenAcces = (jeton) => jwt.verify(jeton, configuration.jwt.secret);
const verifierTokenRafraichissement = (jeton) => jwt.verify(jeton, configuration.jwt.refreshSecret);

module.exports = {
  creerTokenAcces,
  creerTokenRafraichissement,
  verifierTokenAcces,
  verifierTokenRafraichissement
};
