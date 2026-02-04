'use strict';

const estEmailValide = (email) => /.+@.+\..+/.test(email);
const estMotDePasseFort = (motDePasse) => motDePasse && motDePasse.length >= 8;

module.exports = {
  estEmailValide,
  estMotDePasseFort
};
