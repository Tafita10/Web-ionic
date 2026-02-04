'use strict';

const router = require('express').Router();
const { authentifier, exigerRoles } = require('../middlewares/auth');
const utilisateurController = require('../controllers/utilisateurController');

router.get('/', authentifier, exigerRoles([3]), utilisateurController.listerUtilisateurs);
router.patch('/me', authentifier, utilisateurController.modifierProfil);
router.patch('/me/password', authentifier, utilisateurController.changerMotDePasse);
router.get('/blocked', authentifier, exigerRoles([1]), utilisateurController.listerBloques);
router.post('/:id/unblock', authentifier, exigerRoles([1]), utilisateurController.debloquerUtilisateur);

module.exports = router;
