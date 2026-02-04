import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './AppRouter';
import './styles.css';
import 'leaflet/dist/leaflet.css';

// Application avec système de routage
// Routes disponibles:
// - /         → Module Visiteur (carte publique)
// - /visitor  → Module Visiteur (alias)
// - /manager  → Module Manager (authentification requise)
createRoot(document.getElementById('root')).render(<AppRouter />);
