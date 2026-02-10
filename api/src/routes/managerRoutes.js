'use strict';

const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Manager
 *   description: API de gestion des signalements pour les managers
 */

/**
 * @swagger
 * /manager/stats:
 *   get:
 *     summary: Statistiques détaillées pour le manager
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques complètes avec délai moyen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     nombre_total_travaux:
 *                       type: integer
 *                     travaux_termines:
 *                       type: integer
 *                     travaux_en_cours:
 *                       type: integer
 *                     travaux_nouveaux:
 *                       type: integer
 *                     delai_moyen_traitement_jours:
 *                       type: number
 *                     budget_total_estime_ar:
 *                       type: number
 *                     pourcentage_avancement_global:
 *                       type: number
 */
router.get('/stats', auth.authentifier, managerController.getStatistiquesManager);

/**
 * @swagger
 * /manager/signalements:
 *   get:
 *     summary: Liste tous les signalements avec avancement
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *         description: Filtrer par statut (Nouveau, En cours, Terminé)
 *       - in: query
 *         name: gravite
 *         schema:
 *           type: string
 *         description: Filtrer par gravité (Faible, Moyen, Élevé, Critique)
 *       - in: query
 *         name: ville
 *         schema:
 *           type: integer
 *         description: Filtrer par ville (id_ville)
 *       - in: query
 *         name: entreprise
 *         schema:
 *           type: integer
 *         description: Filtrer par entreprise (id_entreprise)
 *     responses:
 *       200:
 *         description: Liste des signalements avec avancement calculé
 */
router.get('/signalements', auth.authentifier, managerController.getAllSignalements);

/**
 * @swagger
 * /manager/signalements/{id}/statut:
 *   put:
 *     summary: Change le statut d'un signalement
 *     description: |
 *       Change le statut et met à jour automatiquement les dates:
 *       - nouveau → en cours: remplir date_debut_travaux
 *       - en cours → terminé: remplir date_fin_travaux
 *       
 *       L'avancement est calculé automatiquement:
 *       - nouveau = 0%
 *       - en cours = 50%
 *       - terminé = 100%
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du signalement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_nouveau_statut
 *             properties:
 *               id_nouveau_statut:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 description: "1=Nouveau, 2=En cours, 3=Terminé, 4=Annulé"
 *               commentaire:
 *                 type: string
 *                 description: Commentaire sur le changement
 *     responses:
 *       200:
 *         description: Statut mis à jour avec succès
 */
router.put('/signalements/:id/statut', auth.authentifier, managerController.changerStatut);

/**
 * @swagger
 * /manager/signalements/{id}/enrichir:
 *   put:
 *     summary: Enrichit les données techniques d'un signalement
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               surface_endommagee_m2:
 *                 type: number
 *                 description: "Surface endommagée (table signalements)"
 *               profondeur_cm:
 *                 type: number
 *               longueur_m:
 *                 type: number
 *               largeur_m:
 *                 type: number
 *               niveau_reparation:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: "Niveau de complexité (1-10), table reparation"
 *               prix_par_m2:
 *                 type: number
 *                 description: "Prix forfaitaire par m² (Ariary), table reparation"
 *               budget_reel_ar:
 *                 type: number
 *                 description: "Budget réel dépensé (Ariary), table reparation"
 *               id_entreprise_assignee:
 *                 type: integer
 *                 description: "Entreprise assignée, table reparation"
 *               duree_estimee_jours:
 *                 type: integer
 *               etat_reparation:
 *                 type: string
 *                 enum: [prevue, en_cours, terminee]
 *               commentaire_interne:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signalement enrichi avec succès
 */
router.put('/signalements/:id/enrichir', auth.authentifier, managerController.enrichirSignalement);

/**
 * @swagger
 * /manager/signalements/{id}/historique:
 *   get:
 *     summary: Historique des changements de statut
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historique complet des changements
 */
router.get('/signalements/:id/historique', auth.authentifier, managerController.getHistoriqueStatuts);

/**
 * @swagger
 * /manager/entreprises:
 *   get:
 *     summary: Liste des entreprises de construction
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des entreprises
 */
router.get('/entreprises', auth.authentifier, managerController.getEntreprises);

/**
 * @swagger
 * /manager/entreprises/stats:
 *   get:
 *     summary: Statistiques par entreprise
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques détaillées par entreprise
 */
router.get('/entreprises/stats', auth.authentifier, managerController.getStatistiquesParEntreprise);

/**
 * @swagger
 * /manager/delais-par-type:
 *   get:
 *     summary: Délais de traitement par type de problème
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tableau des délais moyens par type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type_probleme:
 *                         type: string
 *                       nombre:
 *                         type: integer
 *                       delai_total:
 *                         type: number
 *                       delai_prise_charge:
 *                         type: number
 *                       duree_travaux:
 *                         type: number
 */
router.get('/delais-par-type', auth.authentifier, managerController.getDelaisParType);

/**
 * @swagger
 * /manager/reparations:
 *   get:
 *     summary: Liste toutes les réparations avec détails
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: etat
 *         schema:
 *           type: string
 *           enum: [prevue, en_cours, terminee]
 *         description: Filtrer par état de réparation
 *       - in: query
 *         name: entreprise
 *         schema:
 *           type: integer
 *         description: Filtrer par entreprise
 *     responses:
 *       200:
 *         description: Liste des réparations
 */
router.get('/reparations', auth.authentifier, managerController.getReparations);

/**
 * @swagger
 * /manager/signalements/{id}/reparation:
 *   get:
 *     summary: Récupère la réparation d'un signalement
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du signalement
 *     responses:
 *       200:
 *         description: Détails de la réparation
 *       404:
 *         description: Aucune réparation trouvée
 */
router.get('/signalements/:id/reparation', auth.authentifier, managerController.getReparationBySignalement);

/**
 * @swagger
 * /manager/signalements/{id}/reparation:
 *   put:
 *     summary: Crée ou met à jour la réparation d'un signalement
 *     description: |
 *       Le budget estimé est calculé automatiquement par le backoffice :
 *       budget_estime = prix_par_m2 × niveau_reparation × surface_m2
 *       La surface provient de la table signalements.
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               niveau_reparation:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: "Niveau de complexité (1-10)"
 *               prix_par_m2:
 *                 type: number
 *                 description: "Prix forfaitaire par m² en Ariary"
 *               budget_reel_ar:
 *                 type: number
 *               id_entreprise_assignee:
 *                 type: integer
 *               duree_estimee_jours:
 *                 type: integer
 *               etat_reparation:
 *                 type: string
 *                 enum: [prevue, en_cours, terminee]
 *               commentaire:
 *                 type: string
 *     responses:
 *       200:
 *         description: Réparation enregistrée avec budget_estime calculé
 */
router.put('/signalements/:id/reparation', auth.authentifier, managerController.upsertReparation);

/**
 * @swagger
 * /manager/reparations:
 *   post:
 *     summary: Crée une nouvelle réparation
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_signalement
 *               - niveau_reparation
 *               - prix_par_m2
 *             properties:
 *               id_signalement:
 *                 type: integer
 *               niveau_reparation:
 *                 type: integer
 *               prix_par_m2:
 *                 type: number
 *               budget_estime_ar:
 *                 type: number
 *               id_entreprise_assignee:
 *                 type: integer
 *               duree_estimee_jours:
 *                 type: integer
 *               commentaire:
 *                 type: string
 *     responses:
 *       201:
 *         description: Réparation créée
 */
router.post('/reparations', auth.authentifier, managerController.createReparation);

/**
 * @swagger
 * /manager/reparations/{idReparation}:
 *   put:
 *     summary: Met à jour une réparation
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idReparation
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               niveau_reparation:
 *                 type: integer
 *               prix_par_m2:
 *                 type: number
 *               etat_reparation:
 *                 type: string
 *               budget_reel_ar:
 *                 type: number
 *               commentaire:
 *                 type: string
 *     responses:
 *       200:
 *         description: Réparation mise à jour
 */
router.put('/reparations/:idReparation', auth.authentifier, managerController.updateReparation);

/**
 * @swagger
 * /manager/reparations/{idReparation}:
 *   delete:
 *     summary: Supprime une réparation
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idReparation
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Réparation supprimée
 */
router.delete('/reparations/:idReparation', auth.authentifier, managerController.deleteReparation);

module.exports = router;
