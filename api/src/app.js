'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const configuration = require('./config/env');
const routes = require('./routes');
const { routeIntrouvable, gestionnaireErreurs } = require('./middlewares/erreurs');
const { limiteurAPI } = require('./middlewares/rateLimit');

const app = express();

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
