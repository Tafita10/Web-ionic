'use strict';

const http = require('http');
const app = require('./app');
const configuration = require('./config/env');
const journal = require('./config/logger');
const { verifierConnexion } = require('./config/database');

const port = configuration.port || 3000;

const demarrer = async () => {
  try {
    await verifierConnexion();
    const serveur = http.createServer(app);
    serveur.listen(port, () => journal.info(`API WebRojo démarrée sur le port ${port}`));
  } catch (erreur) {
    journal.error('Impossible de démarrer le serveur', erreur);
    process.exit(1);
  }
};

demarrer();
