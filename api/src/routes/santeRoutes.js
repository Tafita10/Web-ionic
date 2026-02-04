'use strict';

const router = require('express').Router();
const santeController = require('../controllers/santeController');

router.get('/', santeController.sante);

module.exports = router;
