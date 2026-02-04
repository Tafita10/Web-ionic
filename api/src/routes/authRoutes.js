'use strict';

const router = require('express').Router();
const { limiteurConnexion, limiteurInscription } = require('../middlewares/rateLimit');
const { authentifier } = require('../middlewares/auth');
const authController = require('../controllers/authController');

router.post('/register', limiteurInscription, authController.inscrire);
router.post('/login', limiteurConnexion, authController.connecter);
router.post('/refresh', authController.rafraichir);
router.post('/logout', authentifier, authController.deconnecter);
router.get('/me', authentifier, authController.profil);

module.exports = router;
