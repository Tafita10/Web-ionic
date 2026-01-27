const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes d'authentification
router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/:uid', authController.updateUser);
router.get('/:uid', authController.getUser);

module.exports = router;
