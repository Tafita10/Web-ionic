'use strict';

const router = require('express').Router();
const authRoutes = require('./authRoutes');
const signalementRoutes = require('./signalementRoutes');
const syncRoutes = require('./syncRoutes');
const santeRoutes = require('./santeRoutes');
const utilisateurRoutes = require('./utilisateurRoutes');
const sessionRoutes = require('./sessionRoutes');
const visitorRoutes = require('./visitorRoutes');
const managerRoutes = require('./managerRoutes');

router.use('/auth', authRoutes);
router.use('/signalements', signalementRoutes);
router.use('/sync', syncRoutes);
router.use('/health', santeRoutes);
router.use('/utilisateurs', utilisateurRoutes);
router.use('/users', utilisateurRoutes); // Alias anglais
router.use('/sessions', sessionRoutes);
router.use('/visitor', visitorRoutes); // Routes publiques pour visiteurs
router.use('/manager', managerRoutes); // Routes protégées pour managers

module.exports = router;
