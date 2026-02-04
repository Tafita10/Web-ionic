'use strict';

const asyncHandler = require('../middlewares/asyncHandler');
const { pool } = require('../config/database');

const listerSessions = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id_session, id_utilisateur, adresse_ip, date_creation, date_expiration, est_active
     FROM sessions_utilisateur
     WHERE id_utilisateur = $1
     ORDER BY date_creation DESC
     LIMIT 20`,
    [req.utilisateur.id_utilisateur]
  );
  res.json({ sessions: rows });
});

module.exports = {
  listerSessions
};
