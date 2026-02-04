'use strict';

const router = require('express').Router();
const authRoutes = require('./authRoutes');
const signalementRoutes = require('./signalementRoutes');
const syncRoutes = require('./syncRoutes');
const santeRoutes = require('./santeRoutes');
const utilisateurRoutes = require('./utilisateurRoutes');
const sessionRoutes = require('./sessionRoutes');

router.use('/auth', authRoutes);
router.use('/signalements', signalementRoutes);
router.use('/sync', syncRoutes);
router.use('/health', santeRoutes);
router.use('/utilisateurs', utilisateurRoutes);
router.use('/users', utilisateurRoutes); // Alias anglais
router.use('/sessions', sessionRoutes);

module.exports = router;
