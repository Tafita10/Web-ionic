import React from 'react';

const BarreHaut = ({ utilisateur, onDeconnexion, onOuvrirConnexion }) => {
  const getTypeProfil = () => {
    if (!utilisateur) return '👁️ Visiteur';
    if (utilisateur.id_type_utilisateur === 1) return '🔑 Manager';
    if (utilisateur.id_type_utilisateur === 2) return '👤 Utilisateur';
    return '👁️ Visiteur';
  };

  return (
    <header className="barre">
      <div className="barre-contenu">
        <div className="logo">
          <span className="logo-icon">🗺️</span>
          <span className="logo-text">Web Rojo</span>
          <span className="logo-location">Antananarivo</span>
        </div>
        
        <nav className="nav-actions">
          {utilisateur ? (
            <>
              <div className="user-info">
                <span className="badge">{getTypeProfil()}</span>
                <span className="user-name">{utilisateur.nom_complet || utilisateur.nom_utilisateur}</span>
              </div>
              <button className="btn btn-deconnexion" onClick={onDeconnexion}>
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <>
              <span className="badge badge-visiteur">{getTypeProfil()}</span>
              <button className="btn btn-connexion" onClick={onOuvrirConnexion}>
                🔑 Connexion
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default BarreHaut;
