import React, { useState } from 'react';
import { clientAPI } from '../../services/apiClient';

const FormulaireSignalement = ({ onSuccess, onCancel, position }) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [typeProbleme, setTypeProbleme] = useState('');
  const [niveauGravite, setNiveauGravite] = useState('Moyen');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const jeton = localStorage.getItem('jeton');
      const { data } = await clientAPI.post('/signalements', {
        titre_signalement: titre,
        description_signalement: description,
        id_ville: 1, // Antananarivo uniquement
        latitude: position?.lat || -18.8792,
        longitude: position?.lng || 47.5079,
        type_probleme: typeProbleme || null,
        niveau_gravite: niveauGravite
      }, {
        headers: { Authorization: `Bearer ${jeton}` }
      });

      setTitre('');
      setDescription('');
      setTypeProbleme('');
      onSuccess?.();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="formulaire-signalement">
      <div className="formulaire-entete">
        <h3>📍 Nouveau signalement</h3>
        {onCancel && (
          <button className="btn-fermer" onClick={onCancel}>✕</button>
        )}
      </div>

      <form onSubmit={soumettre} className="form">
        <div>
          <label>Titre du signalement *</label>
          <input 
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex: Nid de poule sur RN7"
            maxLength="200"
            required
          />
        </div>

        <div>
          <label>Description *</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez le problème..."
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div>
            <label>Ville</label>
            <input value="Antananarivo" disabled style={{background: '#f1f5f9', color: '#64748b'}} />
          </div>

          <div>
            <label>Gravité</label>
            <select value={niveauGravite} onChange={(e) => setNiveauGravite(e.target.value)}>
              <option value="Faible">Faible</option>
              <option value="Moyen">Moyen</option>
              <option value="Élevé">Élevé</option>
            </select>
          </div>
        </div>

        <div>
          <label>Type de problème (optionnel)</label>
          <input 
            value={typeProbleme}
            onChange={(e) => setTypeProbleme(e.target.value)}
            placeholder="Ex: Nid de poule, Chaussée endommagée..."
          />
        </div>

        {position && (
          <div className="info-position">
            <div>📍 <strong>Latitude:</strong> <code>{position.lat.toFixed(6)}</code></div>
            <div>📍 <strong>Longitude:</strong> <code>{position.lng.toFixed(6)}</code></div>
          </div>
        )}

        {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn btn-secondaire" onClick={onCancel}>
              Annuler
            </button>
          )}
          <button type="submit" className="btn" disabled={chargement}>
            {chargement ? 'Envoi...' : '✓ Créer le signalement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormulaireSignalement;
