'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const configuration = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WebRojo API - Gestion Signalements Madagascar',
      version: '1.0.0',
      description: `
        API REST complète pour la gestion des signalements routiers à Antananarivo.
        
        **Fonctionnalités principales:**
        - 🔐 Authentification JWT avec fallback Firebase/PostgreSQL
        - 📍 Gestion géolocalisée des signalements
        - 🔄 Synchronisation bidirectionnelle Firebase Realtime Database
        - 👥 Gestion multi-utilisateurs avec rôles (Visiteur/Utilisateur/Manager)
        - 🛡️ Protection anti-brute force et rate limiting
        - 📊 Statistiques et rapports
        
        **Architecture:**
        - Backend: Node.js + Express
        - Base de données: PostgreSQL (local) + Firebase Realtime Database (sync cloud)
        - Authentification: JWT avec BCrypt + Firebase Auth (fallback)
        - Documentation: Swagger/OpenAPI 3.0
      `,
      contact: {
        name: 'Support WebRojo',
        email: 'support@webrojo.mg'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: configuration.apiUrl || 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.webrojo.mg',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via /api/auth/login'
        }
      },
      schemas: {
        Utilisateur: {
          type: 'object',
          properties: {
            id_utilisateur: { type: 'integer', example: 1 },
            nom_complet: { type: 'string', example: 'Jean Rakoto' },
            nom_utilisateur: { type: 'string', example: 'jrakoto' },
            email: { type: 'string', format: 'email', example: 'jean@webrojo.mg' },
            id_type_utilisateur: { type: 'integer', description: '1=Manager, 2=Utilisateur, 3=Visiteur', example: 2 },
            est_actif: { type: 'boolean', example: true },
            est_verifie: { type: 'boolean', example: false },
            est_bloque: { type: 'boolean', example: false }
          }
        },
        InscriptionRequest: {
          type: 'object',
          required: ['nom_complet', 'email', 'nom_utilisateur', 'mot_de_passe'],
          properties: {
            nom_complet: { type: 'string', minLength: 3, maxLength: 100, example: 'Jean Rakoto' },
            email: { type: 'string', format: 'email', example: 'jean@webrojo.mg' },
            nom_utilisateur: { type: 'string', minLength: 3, maxLength: 50, example: 'jrakoto' },
            mot_de_passe: { type: 'string', minLength: 8, example: 'MotDePasse123!' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['identifiant', 'mot_de_passe'],
          properties: {
            identifiant: { type: 'string', description: 'Email ou nom d\'utilisateur', example: 'manager' },
            mot_de_passe: { type: 'string', example: 'password123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            utilisateur: { $ref: '#/components/schemas/Utilisateur' },
            jetonAcces: { type: 'string', description: 'JWT access token (2h)', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            jetonRefresh: { type: 'string', description: 'JWT refresh token (7j)', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            source: { type: 'string', enum: ['firebase', 'postgres', 'firebase+postgres'], example: 'postgres' }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refresh_token'],
          properties: {
            refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Email déjà utilisé' },
            erreur: { type: 'string', example: 'Email déjà utilisé' },
            statusCode: { type: 'integer', example: 409 }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token manquant ou invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Token manquant' }
            }
          }
        },
        ForbiddenError: {
          description: 'Accès refusé - Permissions insuffisantes',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Accès refusé' }
            }
          }
        },
        NotFoundError: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Ressource non trouvée' }
            }
          }
        },
        RateLimitError: {
          description: 'Trop de tentatives - Rate limit dépassé',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Trop de tentatives. Réessayez dans 15 minutes.' }
            }
          }
        },
        AccountLockedError: {
          description: 'Compte bloqué après 3 tentatives échouées',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { message: 'Compte bloqué après 3 tentatives de connexion échouées' }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentification',
        description: 'Endpoints d\'authentification et gestion des comptes (Firebase/PostgreSQL avec fallback automatique)'
      },
      {
        name: 'Signalements',
        description: 'CRUD des signalements routiers géolocalisés'
      },
      {
        name: 'Synchronisation',
        description: 'Sync bidirectionnelle Firebase Realtime Database ↔ PostgreSQL'
      },
      {
        name: 'Statistiques',
        description: 'Rapports et statistiques sur les signalements'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
