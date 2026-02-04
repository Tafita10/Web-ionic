import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import VisitorPage from './VisitorPage';
import ManagerPage from './ManagerPage';
import LoginPage from './LoginPage';
import './AppRouter.css';

/**
 * AppRouter - Système de navigation principal
 * 
 * Routes:
 * - /           → Module Visiteur (page d'accueil publique)
 * - /visitor    → Module Visiteur (alias)
 * - /login      → Page de connexion/inscription Manager
 * - /manager    → Module Manager (nécessite authentification)
 */

// Composant Navigation avec état d'authentification
const Navigation = ({ isAuthenticated, onLogout }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (onLogout) onLogout();
        navigate('/');
    };

    return (
        <nav className="main-nav">
            <div className="nav-brand">
                <span className="brand-icon">🛣️</span>
                <span className="brand-text">WebRojo</span>
            </div>
            
            <div className="nav-links">
                <Link to="/" className="nav-link">
                    <span className="nav-icon">🗺️</span>
                    <span>Carte Publique</span>
                </Link>
                
                {isAuthenticated ? (
                    <>
                        <Link to="/manager" className="nav-link manager-link">
                            <span className="nav-icon">🛠️</span>
                            <span>Dashboard</span>
                        </Link>
                        <button className="nav-link logout-btn" onClick={handleLogout}>
                            <span className="nav-icon">🚪</span>
                            <span>Déconnexion</span>
                        </button>
                        <span className="user-info">
                            👤 {user.prenom || 'Manager'}
                        </span>
                    </>
                ) : (
                    <Link to="/login" className="nav-link login-link">
                        <span className="nav-icon">🔐</span>
                        <span>Espace Manager</span>
                    </Link>
                )}
            </div>

            <div className="nav-info">
                <span className="city-badge">📍 Antananarivo</span>
            </div>
        </nav>
    );
};

const AppRouter = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Vérification de l'authentification au chargement
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    // Callback après connexion réussie
    const handleLoginSuccess = (userData) => {
        setIsAuthenticated(true);
    };

    // Callback après déconnexion
    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    // Protection de route Manager
    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {/* Navigation principale */}
            <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />

            {/* Contenu des routes */}
            <main className="app-content">
                <Routes>
                    {/* Page d'accueil - Module Visiteur */}
                    <Route path="/" element={<VisitorPage />} />
                    <Route path="/visitor" element={<VisitorPage />} />
                    
                    {/* Page de connexion */}
                    <Route 
                        path="/login" 
                        element={
                            isAuthenticated 
                                ? <Navigate to="/manager" replace />
                                : <LoginPage onLoginSuccess={handleLoginSuccess} />
                        } 
                    />
                    
                    {/* Module Manager - Protégé */}
                    <Route 
                        path="/manager" 
                        element={
                            <ProtectedRoute>
                                <ManagerPage />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Route par défaut - Redirection */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            {/* Footer */}
            <footer className="app-footer">
                <p>© 2026 WebRojo - Signalement Routier Antananarivo</p>
                <p className="footer-links">
                    <a href="#help">Aide</a> | <a href="#contact">Contact</a>
                </p>
            </footer>
        </Router>
    );
};

export default AppRouter;
