import React from 'react';
import SignalementCard from './SignalementCard';

const ListeSignalements = ({ signalements, chargement }) => {
  if (chargement) return <p>Chargement...</p>;
  if (!signalements.length) return <p>Aucun signalement</p>;

  return (
    <div className="grille">
      {signalements.map((sig) => (
        <SignalementCard key={sig.id_signalement} signalement={sig} />
      ))}
    </div>
  );
};

export default ListeSignalements;
