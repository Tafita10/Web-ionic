import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Page de Connexion Manager
 * 
 * Fonctionnalités:
 * - Connexion avec email et mot de passe
 * - Validation des champs
 * - Gestion des erreurs
 * 
 * Note: L'inscription est réservée aux managers (via le tableau de bord)
 */
const LoginPage = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    
    // État du formulaire
    const [formData, setFormData] = useState({
        email: '',
        mot_de_passe: ''
    });
    
    // État de l'UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Gestion des changements de champs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    // Validation du formulaire
    const validateForm = () => {
        if (!formData.email || !formData.mot_de_passe) {
            setError('Email et mot de passe requis');
            return false;
        }
        
        if (formData.mot_de_passe.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return false;
        }
        
        return true;
    };

    // Connexion
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        setError('');
        
        const loginData = {
            identifiant: formData.email,
            mot_de_passe: formData.mot_de_passe
        };
        
        console.log('Envoi login:', loginData);
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || data.erreur || 'Erreur de connexion');
            }
            
            // Stocker le token et les infos utilisateur
            // L'API retourne jetonAcces et jetonRefresh (français)
            const token = data.jetonAcces || data.data?.accessToken || data.data?.token;
            const refreshToken = data.jetonRefresh || data.data?.refreshToken;
            const utilisateur = data.utilisateur || data.data?.utilisateur;
            
            if (!token) {
                throw new Error('Token non reçu du serveur');
            }
            
            localStorage.setItem('token', token);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(utilisateur));
            
            setSuccess('Connexion réussie !');
            
            // Callback et redirection
            if (onLoginSuccess) {
                onLoginSuccess({ token, utilisateur });
            }
            
            setTimeout(() => {
                navigate('/manager');
            }, 500);
            
        } catch (err) {
            setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <span className="logo-icon">🛣️</span>
                        <h1></h1>
                    </div>
                    <p className="login-subtitle">
                        Espace Manager - Connexion
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="alert alert-success">
                        <span className="alert-icon">✅</span>
                        {success}
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleLogin} className="login-form">

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email ou nom d'utilisateur</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="email ou nom d'utilisateur"
                            required
                            autoComplete="email"
                        />
                    </div>

                    {/* Mot de passe */}
                    <div className="form-group">
                        <label htmlFor="mot_de_passe">Mot de passe</label>
                        <input
                            type="password"
                            id="mot_de_passe"
                            name="mot_de_passe"
                            value={formData.mot_de_passe}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Bouton submit */}
                    <button 
                        type="submit" 
                        className={`btn-submit ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Connexion...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">🔐</span>
                                Se connecter
                            </>
                        )}
                    </button>
                </form>

                {/* Info: inscription par manager uniquement */}
                <div className="login-footer">
                    <p className="info-text">
                        Les comptes sont créés par le manager.
                    </p>
                </div>

                {/* Retour visiteur */}
                <div className="back-visitor">
                    <button 
                        type="button"
                        className="btn-back"
                        onClick={() => navigate('/')}
                    >
                        ← Retour à la carte publique
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
