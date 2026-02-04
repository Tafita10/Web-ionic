'use strict';

const { Pool } = require('pg');
const configuration = require('./env');
const journal = require('./logger');

const {
  hote,
  port,
  nom,
  utilisateur,
  motDePasse,
  poolMin,
  poolMax
} = configuration.baseDeDonnees;

const pool = new Pool({
  host: hote,
  port,
  database: nom,
  user: utilisateur,
  password: motDePasse,
  max: poolMax,
  min: poolMin,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000
});

pool.on('connect', () => journal.info('Connexion PostgreSQL établie'));
pool.on('error', (erreur) => {
  journal.error('Erreur PostgreSQL inattendue', erreur);
});

const verifierConnexion = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  verifierConnexion
};
