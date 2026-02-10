import React, { useState } from 'react';
import { clientAPI } from '../../services/apiClient';

const ConnexionForm = ({ onLogin, message, setMessage }) => {
  const [mode, setMode] = useState('connexion'); // 'connexion' ou 'inscription'
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nomComplet, setNomComplet] = useState('');
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [email, setEmail] = useState('');
  const [chargement, setChargement] = useState(false);

  const soumettreConnexion = async (e) => {
    e.preventDefault();
    setMessage('');
    setChargement(true);
    try {
      await onLogin({ identifiant, mot_de_passe: motDePasse });
    } catch (erreur) {
      setMessage(erreur.response?.data?.message || 'Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  const soumettreInscription = async (e) => {
    e.preventDefault();
    setMessage('');
    setChargement(true);
    try {
      const { data } = await clientAPI.post('/auth/register', {
        nom_complet: nomComplet,
        nom_utilisateur: nomUtilisateur,
        email: email,
        mot_de_passe: motDePasse
      });
      // Auto-connexion après inscription
      await onLogin({ identifiant: email, mot_de_passe: motDePasse });
      setMessage('Compte créé avec succès !');
    } catch (erreur) {
      setMessage(erreur.response?.data?.message || 'Erreur d\'inscription');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="tabs">
        <button 
          className={mode === 'connexion' ? 'active' : ''} 
          onClick={() => setMode('connexion')}
        >
          Connexion
        </button>
        <button 
          className={mode === 'inscription' ? 'active' : ''} 
          onClick={() => setMode('inscription')}
        >
          Inscription
        </button>
      </div>

      {mode === 'connexion' ? (
        <form className="form" onSubmit={soumettreConnexion}>
          <h3>Connexion Utilisateur / Manager</h3>
          <label>Email ou nom d'utilisateur</label>
          <input 
            value={identifiant} 
            onChange={(e) => setIdentifiant(e.target.value)} 
            placeholder=""
            required 
          />

          <label>Mot de passe</label>
          <input 
            type="password" 
            value={motDePasse} 
            onChange={(e) => setMotDePasse(e.target.value)} 
            placeholder="password123"
            required 
          />

          <button className="btn" type="submit" disabled={chargement}>
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <p className="hint">💡 Compte manager par défaut: password123</p>
        </form>
      ) : (
        <form className="form" onSubmit={soumettreInscription}>
          <h3>Créer un compte Utilisateur</h3>
          <label>Nom complet</label>
          <input 
            value={nomComplet} 
            onChange={(e) => setNomComplet(e.target.value)} 
            placeholder="Jean Rakoto"
            required 
          />

          <label>Nom d'utilisateur</label>
          <input 
            value={nomUtilisateur} 
            onChange={(e) => setNomUtilisateur(e.target.value)} 
            placeholder="jrakoto"
            required 
          />

          <label>Email</label>
          <input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="jean@example.com"
            required 
          />

          <label>Mot de passe</label>
          <input 
            type="password" 
            value={motDePasse} 
            onChange={(e) => setMotDePasse(e.target.value)} 
            placeholder="Minimum 8 caractères"
            minLength="8"
            required 
          />

          <button className="btn" type="submit" disabled={chargement}>
            {chargement ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
      )}

      {message && <div className="alerte">{message}</div>}
    </div>
  );
};

export default ConnexionForm;
