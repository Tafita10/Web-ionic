'use strict';

const createError = require('http-errors');
const { verifierTokenAcces } = require('../utils/tokens');

const authentifier = (req, _res, next) => {
  const autorisation = req.headers.authorization || '';
  if (!autorisation.startsWith('Bearer ')) {
    return next(createError(401, 'Token manquant'));
  }

  const jeton = autorisation.replace('Bearer ', '').trim();
  try {
    const payload = verifierTokenAcces(jeton);
    req.utilisateur = payload;
    return next();
  } catch (erreur) {
    return next(createError(401, 'Token invalide ou expiré'));
  }
};

const exigerRoles = (rolesAutorises = []) => (req, _res, next) => {
  if (!req.utilisateur) return next(createError(401, 'Authentification requise'));
  if (rolesAutorises.length === 0) return next();

  if (!rolesAutorises.includes(req.utilisateur.id_type_utilisateur)) {
    return next(createError(403, 'Accès refusé'));
  }
  return next();
};

module.exports = {
  authentifier,
  exigerRoles
};
