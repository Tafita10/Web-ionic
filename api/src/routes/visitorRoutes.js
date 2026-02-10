'use strict';

const router = require('express').Router();
const visitorController = require('../controllers/visitorController');

/**
 * @swagger
 * /api/visitor/stats:
 *   get:
 *     tags: [Visitor]
 *     summary: Obtenir les statistiques publiques
 *     description: Récupère les statistiques globales des signalements visibles au public
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre_total:
 *                   type: integer
 *                 nombre_nouveau:
 *                   type: integer
 *                 nombre_en_cours:
 *                   type: integer
 *                 nombre_termine:
 *                   type: integer
 *                 surface_totale_m2:
 *                   type: number
 *                 budget_total_ar:
 *                   type: number
 *                 pourcentage_avancement:
 *                   type: number
 */
router.get('/stats', visitorController.getStatistiques);

/**
 * @swagger
 * /api/visitor/signalements:
 *   get:
 *     tags: [Visitor]
 *     summary: Obtenir la liste des signalements publics
 *     description: Récupère tous les signalements visibles au public avec leurs détails
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *         description: Filtrer par statut (Nouveau, En cours, Terminé, Annulé)
 *       - in: query
 *         name: gravite
 *         schema:
 *           type: string
 *         description: Filtrer par gravité (Faible, Moyen, Élevé, Critique)
 *       - in: query
 *         name: ville
 *         schema:
 *           type: integer
 *         description: Filtrer par id_ville
 *     responses:
 *       200:
 *         description: Signalements récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/signalements', visitorController.getSignalementsPublics);

/**
 * @swagger
 * /api/visitor/signalements/{id}:
 *   get:
 *     tags: [Visitor]
 *     summary: Obtenir les détails d'un signalement
 *     description: Récupère tous les détails d'un signalement public spécifique
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du signalement
 *     responses:
 *       200:
 *         description: Signalement récupéré avec succès
 *       404:
 *         description: Signalement non trouvé
 */
router.get('/signalements/:id', visitorController.getSignalementDetail);

/**
 * @swagger
 * /api/visitor/map-data:
 *   get:
 *     tags: [Visitor]
 *     summary: Données optimisées pour la carte
 *     description: Récupère les données minimales pour afficher les points sur la carte
 *     responses:
 *       200:
 *         description: Données de la carte récupérées
 */
router.get('/map-data', visitorController.getMapData);

/**
 * @swagger
 * /api/visitor/villes:
 *   get:
 *     tags: [Visitor]
 *     summary: Obtenir la liste des villes
 *     description: Récupère toutes les villes avec nombre de signalements
 *     responses:
 *       200:
 *         description: Liste des villes
 */
router.get('/villes', visitorController.getVilles);

module.exports = router;
