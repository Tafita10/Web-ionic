import React from 'react';

const Sidebar = ({ signalements, chargement, onSelectSignalement }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>📋 Signalements</h3>
        <span className="badge-count">{signalements.length}</span>
      </div>
      
      <div className="sidebar-content">
        {chargement ? (
          <div className="sidebar-loading">
            <p>Chargement...</p>
          </div>
        ) : signalements.length === 0 ? (
          <div className="sidebar-empty">
            <p>📭 Aucun signalement pour le moment</p>
          </div>
        ) : (
          <div className="signalements-list">
            {signalements.map((signalement) => (
              <div 
                key={signalement.id_signalement} 
                className="signalement-item"
                onClick={() => onSelectSignalement?.(signalement)}
              >
                <div className="signalement-header">
                  <h4>{signalement.titre_signalement}</h4>
                  <span className={`badge-gravite ${signalement.niveau_gravite?.toLowerCase()}`}>
                    {signalement.niveau_gravite}
                  </span>
                </div>
                
                <p className="signalement-description">
                  {signalement.description_signalement?.substring(0, 80)}
                  {signalement.description_signalement?.length > 80 ? '...' : ''}
                </p>
                
                <div className="signalement-meta">
                  <span className="meta-item">
                    📍 {signalement.nom_ville || 'Antananarivo'}
                  </span>
                  <span className={`meta-item status-${signalement.libelle_statut?.toLowerCase()}`}>
                    {signalement.libelle_statut || 'En attente'}
                  </span>
                </div>
                
                {signalement.type_probleme && (
                  <div className="signalement-type">
                    🏷️ {signalement.type_probleme}
                  </div>
                )}
                
                <div className="signalement-date">
                  {new Date(signalement.date_creation).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
