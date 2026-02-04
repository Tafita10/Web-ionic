import React, { useState, useEffect } from 'react';
import BarreHaut from './components/BarreHaut';
import Sidebar from './components/Sidebar';
import ModalLogin from './components/ModalLogin';
import CarteTana from './components/signalements/CarteTana';
import FormulaireSignalement from './components/signalements/FormulaireSignalement';
import ActionsSync from './components/signalements/ActionsSync';
import { utiliserAuth } from './hooks/useAuth';
import { clientAPI } from './services/apiClient';

const App = () => {
  const { utilisateur, jeton, connecter, deconnecter } = utiliserAuth();
  const [signalements, setSignalements] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState('');
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [afficherModalLogin, setAfficherModalLogin] = useState(false);
  const [positionCliquee, setPositionCliquee] = useState(null);
  const [signalementSelectionne, setSignalementSelectionne] = useState(null);

  const chargerSignalements = async () => {
    setChargement(true);
    try {
      const { data } = await clientAPI.get('/signalements');
      setSignalements(data.signalements || []);
    } catch (erreur) {
      setMessage(erreur.response?.data?.erreur || 'Erreur de chargement');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerSignalements();
  }, []);

  const gererClicCarte = (position) => {
    if (utilisateur) {
      setPositionCliquee(position);
      setAfficherFormulaire(true);
    } else {
      setMessage('⚠️ Connectez-vous pour créer un signalement');
      setAfficherModalLogin(true);
    }
  };

  return (
    <div className="app-container">
      <BarreHaut 
        utilisateur={utilisateur} 
        onDeconnexion={deconnecter}
        onOuvrirConnexion={() => setAfficherModalLogin(true)}
      />

      <div className="main-layout">
        {/* Sidebar gauche */}
        <Sidebar 
          signalements={signalements}
          chargement={chargement}
          onSelectSignalement={(sig) => {
            setSignalementSelectionne(sig);
            // Centrer la carte sur le signalement
          }}
        />

        {/* Contenu principal */}
        <main className="main-content">
          {/* Actions utilisateur connecté */}
          {utilisateur && (
            <div className="action-bar">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setAfficherFormulaire(!afficherFormulaire);
                  setPositionCliquee(null);
                }}
              >
                {afficherFormulaire ? '✕ Annuler' : '➕ Nouveau signalement'}
              </button>
              {!afficherFormulaire && (
                <p className="hint-text">💡 Cliquez sur la carte pour positionner votre signalement</p>
              )}
            </div>
          )}

          {/* Formulaire de création */}
          {afficherFormulaire && utilisateur && (
            <div className="formulaire-container">
              <FormulaireSignalement 
                position={positionCliquee}
                onSuccess={() => {
                  setAfficherFormulaire(false);
                  setPositionCliquee(null);
                  chargerSignalements();
                  setMessage('✓ Signalement créé avec succès !');
                }}
                onCancel={() => {
                  setAfficherFormulaire(false);
                  setPositionCliquee(null);
                }}
              />
            </div>
          )}

          {/* Carte principale */}
          <CarteTana 
            signalements={signalements} 
            onClicCarte={utilisateur ? gererClicCarte : null}
          />

          {/* Actions Manager uniquement */}
          {utilisateur && utilisateur.id_type_utilisateur === 1 && (
            <div className="manager-section">
              <h2>🔧 Panneau Manager</h2>
              <ActionsSync 
                jeton={jeton} 
                onDone={chargerSignalements} 
                setMessage={setMessage} 
              />
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className="message-toast" onClick={() => setMessage('')}>
              {message}
            </div>
          )}
        </main>
      </div>

      {/* Modal de connexion */}
      <ModalLogin 
        isOpen={afficherModalLogin}
        onClose={() => setAfficherModalLogin(false)}
        onLogin={connecter}
      />
    </div>
  );
};

export default App;
