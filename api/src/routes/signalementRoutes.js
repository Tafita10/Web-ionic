'use strict';

const router = require('express').Router();
const { authentifier, exigerRoles } = require('../middlewares/auth');
const signalementController = require('../controllers/signalementController');

router.get('/', authentifier, signalementController.lister);
router.post('/', authentifier, signalementController.creer);
router.patch('/:id/statut', authentifier, exigerRoles([3]), signalementController.changerStatut);

module.exports = router;
