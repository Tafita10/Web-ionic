import React from 'react';

const SignalementCard = ({ signalement }) => (
  <div className="carte">
    <div className="carte-entete">
      <h3>{signalement.titre_signalement}</h3>
      <span className="badge" style={{ backgroundColor: signalement.code_couleur || '#ccc' }}>
        {signalement.libelle_statut}
      </span>
    </div>
    <p className="texte-sec">{signalement.description_signalement}</p>
    <p className="texte-sec">Ville: {signalement.nom_ville}</p>
    <p className="texte-sec">Gravité: {signalement.niveau_gravite}</p>
    <p className="texte-sec">Coord: {signalement.latitude}, {signalement.longitude}</p>
  </div>
);

export default SignalementCard;
