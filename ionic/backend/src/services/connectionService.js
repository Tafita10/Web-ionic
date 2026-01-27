const axios = require('axios');

class ConnectionService {
  constructor() {
    this.isOnline = true;
    this.checkInterval = null;
  }

  // Vérifier la connexion Internet
  async checkInternetConnection() {
    try {
      // Essayer de contacter Google DNS
      await axios.get('https://www.google.com', { timeout: 5000 });
      this.isOnline = true;
      return true;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  // Vérifier la disponibilité de Firebase
  async checkFirebaseConnection() {
    try {
      await axios.get('https://firebase.googleapis.com', { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Démarrer la surveillance de la connexion
  startMonitoring(interval = 30000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      await this.checkInternetConnection();
      console.log(`📡 État de connexion: ${this.isOnline ? 'EN LIGNE' : 'HORS LIGNE'}`);
    }, interval);

    // Vérification initiale
    this.checkInternetConnection();
  }

  // Arrêter la surveillance
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Obtenir l'état actuel
  getConnectionStatus() {
    return this.isOnline;
  }
}

module.exports = new ConnectionService();
