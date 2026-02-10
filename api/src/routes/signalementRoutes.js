'use strict';

const router = require('express').Router();
const { authentifier, exigerRoles } = require('../middlewares/auth');
const signalementController = require('../controllers/signalementController');

// Route publique - consultation des signalements
router.get('/', signalementController.lister);

// Routes authentifiées
router.post('/', authentifier, signalementController.creer);
router.patch('/:id/statut', authentifier, exigerRoles([3]), signalementController.changerStatut);

module.exports = router;
