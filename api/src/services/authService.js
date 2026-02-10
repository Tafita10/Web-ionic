'use strict';

const createError = require('http-errors');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const configuration = require('../config/env');
const journal = require('../config/logger');
const { hasherMotDePasse, comparerMotDePasse } = require('../utils/motsdepasse');
const {
  creerTokenAcces,
  creerTokenRafraichissement,
  verifierTokenRafraichissement
} = require('../utils/tokens');
const {
  verifierFirebaseDisponible,
  authentifierFirebase,
  creerUtilisateurFirebase,
  syncUtilisateurVersPostgres,
  syncUtilisateurVersFirebase
} = require('./authFailoverService');

const selectionUtilisateur = `
  id_utilisateur,
  nom_complet,
  nom_utilisateur,
  email,
  id_type_utilisateur,
  est_actif,
  est_verifie,
  est_bloque,
  tentatives_connexion_echouees
`;

const normaliserUtilisateur = (utilisateur) => ({
  id_utilisateur: utilisateur.id_utilisateur,
  nom_complet: utilisateur.nom_complet,
  nom_utilisateur: utilisateur.nom_utilisateur,
  email: utilisateur.email,
  id_type_utilisateur: utilisateur.id_type_utilisateur,
  est_actif: utilisateur.est_actif,
  est_verifie: utilisateur.est_verifie,
  est_bloque: utilisateur.est_bloque
});

const creerSession = async (idUtilisateur, jetonSession, jetonRefresh, adresseIp, userAgent) => {
  const expiration = new Date(Date.now() + configuration.securite.dureeSessionMinutes * 60 * 1000);
  
  // Désactiver les sessions existantes pour éviter les duplications de token
  await pool.query(
    `UPDATE sessions_utilisateur SET est_active = FALSE WHERE id_utilisateur = $1 AND est_active = TRUE`,
    [idUtilisateur]
  );
  
  await pool.query(
    `INSERT INTO sessions_utilisateur (
      id_utilisateur, jeton_session, jeton_rafraichissement, adresse_ip, user_agent, date_expiration, duree_vie_minutes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [idUtilisateur, jetonSession, jetonRefresh, adresseIp || '0.0.0.0', userAgent || '', expiration, configuration.securite.dureeSessionMinutes]
  );
};

const inscrire = async ({ nomComplet, email, nomUtilisateur, motDePasse }) => {
  const { rowCount: existeEmail } = await pool.query('SELECT 1 FROM utilisateurs WHERE email = $1', [email]);
  if (existeEmail > 0) throw createError(409, 'Email déjà utilisé');

  const { rowCount: existeNom } = await pool.query('SELECT 1 FROM utilisateurs WHERE nom_utilisateur = $1', [nomUtilisateur]);
  if (existeNom > 0) throw createError(409, 'Nom d\'utilisateur déjà utilisé');

  const motDePasseHash = await hasherMotDePasse(motDePasse);
  let uidFirebase = null;

  // Étape 1 : Essayer Firebase d'abord
  const firebaseDisponible = await verifierFirebaseDisponible();
  if (firebaseDisponible) {
    try {
      uidFirebase = await creerUtilisateurFirebase(email, motDePasse, nomComplet);
      journal.info(`✓ Utilisateur créé dans Firebase: ${email}`);
    } catch (erreur) {
      journal.warn(`⚠ Échec création Firebase, utilisation PostgreSQL uniquement: ${erreur.message}`);
    }
  } else {
    journal.info('Firebase indisponible, inscription uniquement dans PostgreSQL');
  }

  // Étape 2 : Créer dans PostgreSQL
  const { rows } = await pool.query(
    `INSERT INTO utilisateurs (
      uid_firebase, nom_complet, nom_utilisateur, email, mot_de_passe_hash, id_type_utilisateur, est_verifie
    ) VALUES ($1, $2, $3, $4, $5, 2, FALSE)
    RETURNING ${selectionUtilisateur}`,
    [uidFirebase, nomComplet, nomUtilisateur, email, motDePasseHash]
  );

  const utilisateur = rows[0];
  const jetonAcces = creerTokenAcces(utilisateur);
  const jetonRefresh = creerTokenRafraichissement(utilisateur);
  await creerSession(utilisateur.id_utilisateur, jetonAcces, jetonRefresh, '0.0.0.0', 'inscription');

  return {
    utilisateur: normaliserUtilisateur(utilisateur),
    jetonAcces,
    jetonRefresh,
    source: uidFirebase ? 'firebase+postgres' : 'postgres'
  };
};

const enregistrerTentative = async (utilisateur, identifiant, adresseIp, userAgent, estReussie, messageErreur) => {
  try {
    await pool.query(
      `INSERT INTO tentatives_connexion (
        id_utilisateur, nom_utilisateur_essaye, email_essaye, adresse_ip, user_agent, est_reussie, raison_echec
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`
      , [
        utilisateur ? utilisateur.id_utilisateur : null,
        identifiant,
        identifiant,
        adresseIp || '0.0.0.0',
        userAgent || '',
        estReussie,
        messageErreur || null
      ]
    );
  } catch (erreur) {
    journal.warn('Impossible de journaliser la tentative de connexion', erreur);
  }
};

const incrementerTentative = async (utilisateur, adresseIp, userAgent) => {
  const { rows } = await pool.query(
    `UPDATE utilisateurs
     SET tentatives_connexion_echouees = tentatives_connexion_echouees + 1,
         date_dernier_echec_connexion = CURRENT_TIMESTAMP
     WHERE id_utilisateur = $1
     RETURNING tentatives_connexion_echouees`,
    [utilisateur.id_utilisateur]
  );

  const tentatives = rows[0]?.tentatives_connexion_echouees || 0;
  await enregistrerTentative(utilisateur, utilisateur.email, adresseIp, userAgent, false, 'Mot de passe incorrect');

  // Bloquer immédiatement si on atteint ou dépasse le maximum
  if (tentatives >= configuration.securite.maxTentativesConnexion) {
    await pool.query(
      `UPDATE utilisateurs
       SET est_bloque = TRUE, date_blocage = CURRENT_TIMESTAMP, raison_blocage = 'Trop de tentatives de connexion'
       WHERE id_utilisateur = $1`,
      [utilisateur.id_utilisateur]
    );
    throw createError(423, `Compte bloqué après ${configuration.securite.maxTentativesConnexion} tentatives de connexion échouées`);
  }

  throw createError(401, 'Identifiants invalides');
};

const reinitialiserTentatives = async (idUtilisateur, adresseIp) => {
  await pool.query(
    `UPDATE utilisateurs
     SET tentatives_connexion_echouees = 0, est_bloque = FALSE, adresse_ip_derniere_connexion = $2,
         date_derniere_connexion = CURRENT_TIMESTAMP
     WHERE id_utilisateur = $1`,
    [idUtilisateur, adresseIp]
  );
};

const connecter = async ({ identifiant, motDePasse, adresseIp, userAgent }) => {
  let source = 'postgres';
  
  // Utiliser PostgreSQL pour l'authentification
  // Firebase Realtime Database est utilisé uniquement pour la synchronisation des données
  const { rows } = await pool.query(
    `SELECT ${selectionUtilisateur}, mot_de_passe_hash FROM utilisateurs
     WHERE email = $1 OR nom_utilisateur = $1
     LIMIT 1`,
    [identifiant]
  );
  
  const utilisateur = rows[0];
  if (!utilisateur) throw createError(401, 'Identifiants invalides');
  if (!utilisateur.est_actif) throw createError(403, 'Compte inactif');
  if (utilisateur.est_bloque) throw createError(423, 'Compte bloqué');

  const motOK = await comparerMotDePasse(motDePasse, utilisateur.mot_de_passe_hash);
  if (!motOK) {
    await incrementerTentative(utilisateur, adresseIp, userAgent);
    throw createError(401, 'Identifiants invalides');
  }
  
  journal.info(`✓ Connexion réussie via PostgreSQL: ${identifiant}`);

  await reinitialiserTentatives(utilisateur.id_utilisateur, adresseIp);
  const jetonAcces = creerTokenAcces(utilisateur);
  const jetonRefresh = creerTokenRafraichissement(utilisateur);
  await creerSession(utilisateur.id_utilisateur, jetonAcces, jetonRefresh, adresseIp, userAgent);
  await enregistrerTentative(utilisateur, identifiant, adresseIp, userAgent, true);

  return {
    utilisateur: normaliserUtilisateur(utilisateur),
    jetonAcces,
    jetonRefresh,
    source
  };
};;

const rafraichir = async (jetonRafraichissement) => {
  if (!jetonRafraichissement) throw createError(401, 'Token de rafraîchissement requis');
  
  // Vérifier que le token n'est pas vide ou mal formé
  if (typeof jetonRafraichissement !== 'string' || jetonRafraichissement.trim() === '') {
    throw createError(401, 'Token de rafraîchissement invalide');
  }

  let payload;
  try {
    payload = verifierTokenRafraichissement(jetonRafraichissement);
  } catch (erreur) {
    throw createError(401, 'Token de rafraîchissement invalide ou expiré');
  }
  const { rows: sessions } = await pool.query(
    `SELECT id_utilisateur FROM sessions_utilisateur
     WHERE jeton_rafraichissement = $1 AND est_active = TRUE AND date_expiration > CURRENT_TIMESTAMP
     LIMIT 1`,
    [jetonRafraichissement]
  );
  if (sessions.length === 0) throw createError(401, 'Session expirée ou révoquée');

  const { rows: utilisateurs } = await pool.query(
    `SELECT ${selectionUtilisateur} FROM utilisateurs WHERE id_utilisateur = $1 LIMIT 1`,
    [payload.id_utilisateur]
  );
  const utilisateur = utilisateurs[0];
  if (!utilisateur || utilisateur.est_bloque) throw createError(403, 'Compte indisponible');

  const nouveauAcces = creerTokenAcces(utilisateur);
  await pool.query(
    `UPDATE sessions_utilisateur
     SET date_derniere_activite = CURRENT_TIMESTAMP
     WHERE jeton_rafraichissement = $1`,
    [jetonRafraichissement]
  );

  return {
    jetonAcces: nouveauAcces,
    utilisateur: normaliserUtilisateur(utilisateur)
  };
};

const deconnecter = async (jetonSession) => {
  if (!jetonSession) return;
  await pool.query(
    `UPDATE sessions_utilisateur
     SET est_active = FALSE, date_revocation = CURRENT_TIMESTAMP, raison_revocation = 'Déconnexion'
     WHERE jeton_session = $1`,
    [jetonSession]
  );
};

const debloquerUtilisateur = async (idUtilisateur, idAdmin) => {
  // Vérifier que l'utilisateur existe
  const { rows } = await pool.query(
    `SELECT id_utilisateur, email, est_bloque FROM utilisateurs WHERE id_utilisateur = $1`,
    [idUtilisateur]
  );
  
  if (rows.length === 0) {
    throw createError(404, 'Utilisateur non trouvé');
  }

  const utilisateur = rows[0];
  if (!utilisateur.est_bloque) {
    throw createError(400, 'Utilisateur non bloqué');
  }

  // Débloquer et réinitialiser compteur
  await pool.query(
    `UPDATE utilisateurs
     SET est_bloque = FALSE,
         tentatives_connexion_echouees = 0,
         date_blocage = NULL,
         raison_blocage = NULL,
         date_modification = CURRENT_TIMESTAMP
     WHERE id_utilisateur = $1`,
    [idUtilisateur]
  );

  journal.info(`Utilisateur ${utilisateur.email} débloqué par admin ID ${idAdmin}`);
  
  return {
    message: 'Utilisateur débloqué avec succès',
    utilisateur: {
      id_utilisateur: utilisateur.id_utilisateur,
      email: utilisateur.email
    }
  };
};

module.exports = {
  inscrire,
  connecter,
  rafraichir,
  deconnecter,
  debloquerUtilisateur
};
