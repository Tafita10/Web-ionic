import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerDashboard from './components/ManagerDashboard';
import ReparationsManager from './components/ReparationsManager';
import EntreprisesManager from './components/EntreprisesManager';
import ParametresManager from './components/ParametresManager';
import './ManagerPage.css';

/**
 * Page Manager - Interface de gestion avec sidebar
 * Accessible uniquement après authentification
 */
const ManagerPage = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Récupérer les infos utilisateur
    const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('utilisateur');
        navigate('/login');
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'signalements', label: 'Signalements', icon: '📍' },
        { id: 'reparations', label: 'Réparations', icon: '🔧' },
        { id: 'entreprises', label: 'Entreprises', icon: '🏢' },
        { id: 'parametres', label: 'Paramètres', icon: '⚙️' }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <ManagerDashboard />;
            case 'reparations':
                return <ReparationsManager />;
            case 'signalements':
                return <ManagerDashboard filterSection="signalements" />;
            case 'entreprises':
                return <EntreprisesManager />;
            case 'parametres':
                return <ParametresManager />;
            default:
                return <ManagerDashboard />;
        }
    };

    return (
        <div className={`manager-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Sidebar */}
            <aside className="manager-sidebar">
                <div className="sidebar-header">
                    <div className="logo-container">
                        <span className="logo-icon">🛣️</span>
                        {!sidebarCollapsed && <span className="logo-text">WebRojo</span>}
                    </div>
                    <button 
                        className="sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                            title={item.label}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <span className="user-avatar">👤</span>
                        {!sidebarCollapsed && (
                            <div className="user-details">
                                <span className="user-name">{utilisateur.nom_complet || 'Manager'}</span>
                                <span className="user-role">Manager</span>
                            </div>
                        )}
                    </div>
                    <button className="btn-logout" onClick={handleLogout} title="Déconnexion">
                        <span>🚪</span>
                        {!sidebarCollapsed && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="manager-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default ManagerPage;
