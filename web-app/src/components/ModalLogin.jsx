import React, { useState } from 'react';
import ConnexionForm from './auth/ConnexionForm';

const ModalLogin = ({ isOpen, onClose, onLogin }) => {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔑 Connexion / Inscription</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="login-info">
            <p className="info-text">
              👁️ <strong>Mode Visiteur :</strong> Consultation des signalements sans compte
            </p>
            <p className="info-text">
              👤 <strong>Utilisateur :</strong> Créer et gérer vos signalements
            </p>
            <p className="info-text">
              🔑 <strong>Manager :</strong> Accès complet + synchronisation Firebase
            </p>
          </div>
          
          <ConnexionForm 
            onLogin={async (credentials) => {
              await onLogin(credentials);
              setMessage('');
              onClose();
            }} 
            message={message} 
            setMessage={setMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ModalLogin;
