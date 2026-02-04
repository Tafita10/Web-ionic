'use strict';

const reussite = (res, donnees = {}, statut = 200) => res.status(statut).json(donnees);
const echec = (res, message = 'Erreur interne', statut = 500) => res.status(statut).json({ erreur: message });

module.exports = {
  reussite,
  echec
};
