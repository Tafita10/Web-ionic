import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Page de Connexion / Inscription Manager
 * 
 * Fonctionnalités:
 * - Connexion avec email et mot de passe
 * - Inscription d'un nouveau compte Manager
 * - Validation des champs
 * - Gestion des erreurs
 */
const LoginPage = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    
    // État pour basculer entre connexion et inscription
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    
    // État du formulaire
    const [formData, setFormData] = useState({
        email: '',
        nom_utilisateur: '',
        mot_de_passe: '',
        confirm_password: '',
        nom: '',
        prenom: ''
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
            setError('Identifiant et mot de passe requis');
            return false;
        }
        
        if (formData.mot_de_passe.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return false;
        }
        
        if (isRegisterMode) {
            if (!formData.email.includes('@')) {
                setError('Format d\'email invalide');
                return false;
            }
            if (!formData.nom || !formData.prenom) {
                setError('Nom et prénom requis pour l\'inscription');
                return false;
            }
            if (!formData.nom_utilisateur) {
                setError('Nom d\'utilisateur requis pour l\'inscription');
                return false;
            }
            if (formData.nom_utilisateur.length < 3) {
                setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
                return false;
            }
            if (formData.mot_de_passe !== formData.confirm_password) {
                setError('Les mots de passe ne correspondent pas');
                return false;
            }
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

    // Inscription
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom_complet: `${formData.prenom} ${formData.nom}`,
                    email: formData.email,
                    nom_utilisateur: formData.nom_utilisateur,
                    mot_de_passe: formData.mot_de_passe
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de l\'inscription');
            }
            
            setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
            
            // Basculer vers le mode connexion après inscription réussie
            setTimeout(() => {
                setIsRegisterMode(false);
                setSuccess('');
            }, 2000);
            
        } catch (err) {
            if (err.message.includes('existe')) {
                setError('Un compte avec cet email existe déjà');
            } else {
                setError(err.message || 'Erreur lors de l\'inscription');
            }
        } finally {
            setLoading(false);
        }
    };

    // Reset du formulaire lors du changement de mode
    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setError('');
        setSuccess('');
        setFormData({
            email: formData.email, // Garder l'email
            nom_utilisateur: '',
            mot_de_passe: '',
            confirm_password: '',
            nom: '',
            prenom: ''
        });
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <span className="logo-icon">🛣️</span>
                        <h1>WebRojo</h1>
                    </div>
                    <p className="login-subtitle">
                        {isRegisterMode 
                            ? 'Créer un compte Manager' 
                            : 'Espace Manager - Connexion'}
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
                <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="login-form">
                    
                    {/* Champs inscription uniquement */}
                    {isRegisterMode && (
                        <>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="prenom">Prénom</label>
                                    <input
                                        type="text"
                                        id="prenom"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        placeholder="Votre prénom"
                                        required={isRegisterMode}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="nom">Nom</label>
                                    <input
                                        type="text"
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        placeholder="Votre nom"
                                        required={isRegisterMode}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="nom_utilisateur">Nom d'utilisateur</label>
                                <input
                                    type="text"
                                    id="nom_utilisateur"
                                    name="nom_utilisateur"
                                    value={formData.nom_utilisateur}
                                    onChange={handleChange}
                                    placeholder="manager123"
                                    required={isRegisterMode}
                                    minLength={3}
                                />
                            </div>
                        </>
                    )}

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">{isRegisterMode ? 'Email' : 'Email ou nom d\'utilisateur'}</label>
                        <input
                            type={isRegisterMode ? 'email' : 'text'}
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={isRegisterMode ? 'manager@webrojo.mg' : 'email ou nom d\'utilisateur'}
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
                            autoComplete={isRegisterMode ? "new-password" : "current-password"}
                        />
                    </div>

                    {/* Confirmation mot de passe (inscription) */}
                    {isRegisterMode && (
                        <div className="form-group">
                            <label htmlFor="confirm_password">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                id="confirm_password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required={isRegisterMode}
                                minLength={6}
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    {/* Bouton submit */}
                    <button 
                        type="submit" 
                        className={`btn-submit ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                {isRegisterMode ? 'Création...' : 'Connexion...'}
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">{isRegisterMode ? '📝' : '🔐'}</span>
                                {isRegisterMode ? 'Créer mon compte' : 'Se connecter'}
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle login/register */}
                <div className="login-footer">
                    <p>
                        {isRegisterMode 
                            ? 'Déjà un compte ?' 
                            : 'Pas encore de compte ?'}
                    </p>
                    <button 
                        type="button" 
                        className="btn-toggle"
                        onClick={toggleMode}
                    >
                        {isRegisterMode ? 'Se connecter' : 'Créer un compte'}
                    </button>
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
