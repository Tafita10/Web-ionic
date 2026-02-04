import { useState, useEffect } from 'react';
import { clientAPI } from '../services/apiClient';

export const utiliserAuth = () => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [jeton, setJeton] = useState(null);

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    const jetonStocke = localStorage.getItem('jeton');
    const utilisateurStocke = localStorage.getItem('utilisateur');
    
    if (jetonStocke && utilisateurStocke) {
      try {
        setUtilisateur(JSON.parse(utilisateurStocke));
        setJeton(jetonStocke);
      } catch (err) {
        console.error('Erreur lors du chargement des données stockées:', err);
        localStorage.removeItem('jeton');
        localStorage.removeItem('utilisateur');
      }
    }
  }, []);

  const connecter = async ({ identifiant, mot_de_passe }) => {
    const { data } = await clientAPI.post('/auth/login', { 
      identifiant, 
      mot_de_passe
    });
    
    // Sauvegarder dans localStorage
    localStorage.setItem('jeton', data.jetonAcces);
    localStorage.setItem('jetonRefresh', data.jetonRefresh);
    localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));
    
    setUtilisateur(data.utilisateur);
    setJeton(data.jetonAcces);
    
    return data;
  };

  const deconnecter = () => {
    localStorage.removeItem('jeton');
    localStorage.removeItem('jetonRefresh');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
    setJeton(null);
  };

  return {
    utilisateur,
    jeton,
    connecter,
    deconnecter
  };
};
