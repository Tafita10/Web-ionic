'use strict';

const router = require('express').Router();
const { authentifier, exigerRoles } = require('../middlewares/auth');
const syncController = require('../controllers/syncController');

// Synchronisation des signalements
router.post('/pull', authentifier, exigerRoles([1]), syncController.pull);
router.post('/push', authentifier, exigerRoles([1]), syncController.push);

// Synchronisation des utilisateurs Firebase <-> PostgreSQL
router.post('/sync-utilisateurs', authentifier, exigerRoles([1]), syncController.syncUtilisateurs);

// Vérifier le statut de Firebase
router.get('/firebase-status', syncController.statusFirebase);

module.exports = router;
