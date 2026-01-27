const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { initializeFirebase } = require('./config/firebase');
const connectionService = require('./services/connectionService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialiser Firebase
const firebaseInitialized = initializeFirebase();

// Démarrer la surveillance de la connexion
connectionService.startMonitoring();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Route de statut
app.get('/api/status', async (req, res) => {
  const isOnline = await connectionService.checkInternetConnection();
  res.json({
    online: isOnline,
    firebase: firebaseInitialized && isOnline,
    mode: isOnline && firebaseInitialized ? 'firebase' : 'local'
  });
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Mode: ${firebaseInitialized ? 'Firebase + Local' : 'Local uniquement'}`);
});