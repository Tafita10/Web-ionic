'use strict';

const fs = require('fs');
const path = require('path');
const configuration = require('./env');

const niveaux = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];
const niveauActifIndex = niveaux.indexOf(configuration.journalisation.niveau) === -1
  ? niveaux.indexOf('info')
  : niveaux.indexOf(configuration.journalisation.niveau);

const ecrireFichier = (niveau, message) => {
  if (!configuration.journalisation.versFichier) return;
  const repertoire = path.resolve(configuration.journalisation.repertoire);
  if (!fs.existsSync(repertoire)) {
    fs.mkdirSync(repertoire, { recursive: true });
  }
  const ligne = `[${new Date().toISOString()}] ${niveau.toUpperCase()} ${message}\n`;
  fs.appendFile(path.join(repertoire, 'api.log'), ligne, () => undefined);
};

const construireMessage = (contenu, meta) => {
  if (!meta) return contenu;
  const metaString = typeof meta === 'object' ? JSON.stringify(meta) : String(meta);
  return `${contenu} | ${metaString}`;
};

const genererLogger = (niveau) => (message, meta) => {
  if (niveaux.indexOf(niveau) <= niveauActifIndex) {
    const contenu = construireMessage(message, meta);
    // eslint-disable-next-line no-console
    console[niveau === 'info' ? 'log' : niveau](contenu);
    ecrireFichier(niveau, contenu);
  }
};

module.exports = {
  info: genererLogger('info'),
  warn: genererLogger('warn'),
  error: genererLogger('error'),
  debug: genererLogger('debug')
};
