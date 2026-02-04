import React, { useState } from 'react';
import { clientAPI } from '../../services/apiClient';

const ActionsSync = ({ jeton, onDone, setMessage }) => {
  const [chargement, setChargement] = useState(false);

  const lancer = async (type) => {
    setMessage('');
    setChargement(true);
    try {
      const url = type === 'pull' ? '/sync/pull' : '/sync/push';
      const { data } = await clientAPI.post(url, {}, {
        headers: { Authorization: `Bearer ${jeton}` }
      });
      setMessage(`${type.toUpperCase()} ok (${data.total || data.pousses || data.ajoutes || 0})`);
      onDone();
    } catch (erreur) {
      setMessage(erreur.response?.data?.erreur || 'Erreur de synchronisation');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="actions-sync">
      <button className="btn" onClick={() => lancer('pull')} disabled={chargement}>PULL Firebase</button>
      <button className="btn secondaire" onClick={() => lancer('push')} disabled={chargement}>PUSH Firebase</button>
    </div>
  );
};

export default ActionsSync;
