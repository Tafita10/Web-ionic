'use strict';

const bcrypt = require('bcrypt');
const configuration = require('../config/env');

const hasherMotDePasse = async (motDePasse) => {
  return bcrypt.hash(motDePasse, configuration.securite.coutBcrypt);
};

const comparerMotDePasse = async (motDePasse, hash) => {
  return bcrypt.compare(motDePasse, hash);
};

module.exports = {
  hasherMotDePasse,
  comparerMotDePasse
};
