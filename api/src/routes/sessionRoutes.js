'use strict';

const router = require('express').Router();
const { authentifier } = require('../middlewares/auth');
const sessionController = require('../controllers/sessionController');

router.get('/', authentifier, sessionController.listerSessions);

module.exports = router;
