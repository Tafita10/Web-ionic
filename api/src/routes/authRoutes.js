'use strict';

const router = require('express').Router();
const { limiteurConnexion, limiteurInscription } = require('../middlewares/rateLimit');
const { authentifier } = require('../middlewares/auth');
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     description: |
 *       Crée un nouveau compte utilisateur avec validation email unique et hash BCrypt du mot de passe.
 *       
 *       **Processus:**
 *       1. Validation email unique (PostgreSQL)
 *       2. Validation nom d'utilisateur unique
 *       3. Hash mot de passe (BCrypt rounds=12)
 *       4. Tentative création compte Firebase (fallback si offline)
 *       5. Création compte PostgreSQL
 *       6. Génération JWT + session
 *       
 *       **Rate Limit:** 3 requêtes / 60 minutes par IP
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InscriptionRequest'
 *           examples:
 *             utilisateur:
 *               summary: Inscription utilisateur standard
 *               value:
 *                 nom_complet: Jean Rakoto
 *                 email: jean@webrojo.mg
 *                 nom_utilisateur: jrakoto
 *                 mot_de_passe: MotDePasse123!
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               success:
 *                 value:
 *                   utilisateur:
 *                     id_utilisateur: 5
 *                     nom_complet: Jean Rakoto
 *                     nom_utilisateur: jrakoto
 *                     email: jean@webrojo.mg
 *                     id_type_utilisateur: 2
 *                     est_actif: true
 *                     est_verifie: false
 *                   jetonAcces: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   jetonRefresh: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   source: postgres
 *       400:
 *         description: Données invalides (email invalide, mot de passe trop court)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               emailInvalide:
 *                 value:
 *                   message: Email invalide
 *               motDePasseCourt:
 *                 value:
 *                   message: Mot de passe trop court
 *       409:
 *         description: Email ou nom d'utilisateur déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               emailExiste:
 *                 value:
 *                   message: Email déjà utilisé
 *               nomExiste:
 *                 value:
 *                   message: Nom d'utilisateur déjà utilisé
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/register', limiteurInscription, authController.inscrire);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     description: |
 *       Authentification avec email/nom d'utilisateur et mot de passe.
 *       
 *       **Processus:**
 *       1. Recherche utilisateur (PostgreSQL)
 *       2. Vérification compte actif et non bloqué
 *       3. Comparaison hash BCrypt du mot de passe
 *       4. Compteur tentatives échouées (max 3)
 *       5. Génération JWT (access 2h + refresh 7j)
 *       6. Création session + logging
 *       
 *       **Protection:**
 *       - Rate limit: 20 requêtes / 15 minutes par IP
 *       - Blocage automatique après 3 échecs
 *       - Logs des tentatives (IP, user-agent, timestamp)
 *       
 *       **Fallback:** PostgreSQL uniquement (Firebase Realtime Database pour sync données uniquement)
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             manager:
 *               summary: Connexion Manager
 *               value:
 *                 identifiant: manager
 *                 mot_de_passe: password123
 *             utilisateur:
 *               summary: Connexion Utilisateur
 *               value:
 *                 identifiant: jean@webrojo.mg
 *                 mot_de_passe: MotDePasse123!
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               successPostgres:
 *                 summary: Connexion PostgreSQL
 *                 value:
 *                   utilisateur:
 *                     id_utilisateur: 1
 *                     nom_complet: Manager Principal
 *                     nom_utilisateur: manager
 *                     email: manager@webrojo.mg
 *                     id_type_utilisateur: 1
 *                     est_actif: true
 *                     est_verifie: true
 *                   jetonAcces: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   jetonRefresh: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                   source: postgres
 *       400:
 *         description: Identifiant ou mot de passe manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Identifiant et mot de passe requis
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Identifiants invalides
 *       403:
 *         description: Compte inactif
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Compte inactif
 *       423:
 *         $ref: '#/components/responses/AccountLockedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', limiteurConnexion, authController.connecter);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renouvellement du token d'accès
 *     description: |
 *       Génère un nouveau access token à partir d'un refresh token valide.
 *       
 *       **Durées de vie:**
 *       - Access token: 2 heures
 *       - Refresh token: 7 jours
 *       
 *       **Usage:** Appeler cet endpoint avant l'expiration du token pour maintenir la session active.
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *           example:
 *             refresh_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Nouveau token généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jetonAcces:
 *                   type: string
 *                   description: Nouveau access token (2h)
 *                 jetonRefresh:
 *                   type: string
 *                   description: Nouveau refresh token (7j)
 *             example:
 *               jetonAcces: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               jetonRefresh: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Refresh token invalide ou expiré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Token invalide ou expiré
 */
router.post('/refresh', authController.rafraichir);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     description: |
 *       Invalide le token JWT et ferme la session active.
 *       
 *       **Processus:**
 *       1. Extraction token du header Authorization
 *       2. Marquage session comme inactive (PostgreSQL)
 *       3. Optionnel: Blacklist du token (Redis)
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Déconnexion réussie (pas de contenu)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authentifier, authController.deconnecter);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Profil utilisateur connecté
 *     description: |
 *       Retourne les informations du compte utilisateur authentifié.
 *       
 *       **Usage:** Vérifier l'état du token et obtenir les données de l'utilisateur connecté.
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 utilisateur:
 *                   $ref: '#/components/schemas/Utilisateur'
 *             example:
 *               utilisateur:
 *                 id_utilisateur: 1
 *                 nom_complet: Manager Principal
 *                 nom_utilisateur: manager
 *                 email: manager@webrojo.mg
 *                 id_type_utilisateur: 1
 *                 est_actif: true
 *                 est_verifie: true
 *                 est_bloque: false
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authentifier, authController.profil);

/**
 * @swagger
 * /api/auth/unlock-user:
 *   post:
 *     summary: Débloquer un utilisateur (Admin seulement)
 *     description: |
 *       Permet à un manager de débloquer un compte utilisateur bloqué après échecs de connexion.
 *       
 *       **Processus:**
 *       1. Vérification permissions (id_type_utilisateur = 1 Manager)
 *       2. Vérification existence utilisateur
 *       3. Réinitialisation compteur tentatives
 *       4. Déblocage compte + logging admin
 *       
 *       **Accès:** Réservé aux Managers uniquement
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_utilisateur]
 *             properties:
 *               id_utilisateur:
 *                 type: integer
 *                 description: ID de l'utilisateur à débloquer
 *                 example: 5
 *           example:
 *             id_utilisateur: 5
 *     responses:
 *       200:
 *         description: Utilisateur débloqué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 utilisateur:
 *                   type: object
 *                   properties:
 *                     id_utilisateur:
 *                       type: integer
 *                     email:
 *                       type: string
 *             example:
 *               message: Utilisateur débloqué avec succès
 *               utilisateur:
 *                 id_utilisateur: 5
 *                 email: jean@webrojo.mg
 *       400:
 *         description: ID utilisateur manquant ou utilisateur non bloqué
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               idManquant:
 *                 value:
 *                   message: ID utilisateur requis
 *               nonBloque:
 *                 value:
 *                   message: Utilisateur non bloqué
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Accès refusé - Permissions Manager requises
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Accès réservé aux managers
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Utilisateur non trouvé
 */
router.post('/unlock-user', authentifier, authController.debloquerUtilisateur);

module.exports = router;
