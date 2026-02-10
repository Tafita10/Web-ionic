'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const configuration = require('./config/env');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const { routeIntrouvable, gestionnaireErreurs } = require('./middlewares/erreurs');
const { limiteurAPI } = require('./middlewares/rateLimit');

const app = express();

// Swagger UI - désactiver CSP pour le chargement des assets
app.use('/api-docs', (req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';");
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'WebRojo API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/favicon.ico'
}));

// JSON brut de la spec OpenAPI
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use(helmet());
app.use(cors({ origin: configuration.cors.origines, credentials: configuration.cors.credentials }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(limiteurAPI);

app.use('/api', routes);

app.use(routeIntrouvable);
app.use(gestionnaireErreurs);

module.exports = app;
