'use strict';

const createError = require('http-errors');
const authService = require('../services/authService');
const asyncHandler = require('../middlewares/asyncHandler');
const { estEmailValide, estMotDePasseFort } = require('../utils/validation');

const inscrire = asyncHandler(async (req, res) => {
  const { nom_complet, email, nom_utilisateur, mot_de_passe } = req.body;
  if (!nom_complet || !email || !nom_utilisateur || !mot_de_passe) {
    throw createError(400, 'Champs obligatoires manquants');
  }
  if (!estEmailValide(email)) throw createError(400, 'Email invalide');
  if (!estMotDePasseFort(mot_de_passe)) throw createError(400, 'Mot de passe trop court');

  const resultat = await authService.inscrire({
    nomComplet: nom_complet,
    email,
    nomUtilisateur: nom_utilisateur,
    motDePasse: mot_de_passe
  });
  res.status(201).json(resultat);
});

const connecter = asyncHandler(async (req, res) => {
  const { identifiant, mot_de_passe } = req.body;
  if (!identifiant || !mot_de_passe) throw createError(400, 'Identifiant et mot de passe requis');

  const resultat = await authService.connecter({
    identifiant,
    motDePasse: mot_de_passe,
    adresseIp: req.ip,
    userAgent: req.headers['user-agent']
  });
  res.json(resultat);
});

const rafraichir = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    throw createError(400, 'Token de rafraîchissement requis');
  }
  const resultat = await authService.rafraichir(refresh_token);
  res.json(resultat);
});

const deconnecter = asyncHandler(async (req, res) => {
  const autorisation = req.headers.authorization || '';
  const jeton = autorisation.replace('Bearer ', '');
  await authService.deconnecter(jeton);
  res.status(204).end();
});

const profil = asyncHandler(async (req, res) => {
  res.json({ utilisateur: req.utilisateur });
});

const debloquerUtilisateur = asyncHandler(async (req, res) => {
  const { id_utilisateur } = req.body;
  if (!id_utilisateur) throw createError(400, 'ID utilisateur requis');
  
  // Vérifier que l'utilisateur connecté est un manager (id_type_utilisateur = 1)
  if (req.utilisateur.id_type_utilisateur !== 1) {
    throw createError(403, 'Accès réservé aux managers');
  }

  const resultat = await authService.debloquerUtilisateur(id_utilisateur, req.utilisateur.id_utilisateur);
  res.json(resultat);
});

module.exports = {
  inscrire,
  connecter,
  rafraichir,
  deconnecter,
  profil,
  debloquerUtilisateur
};
