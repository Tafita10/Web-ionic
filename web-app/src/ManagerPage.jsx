import React from 'react';
import ManagerDashboard from './components/ManagerDashboard';
import './ManagerPage.css';

/**
 * Page Manager - Interface de gestion des signalements
 * Accessible uniquement après authentification
 */
const ManagerPage = () => {
    return (
        <div className="manager-page">
            <ManagerDashboard />
        </div>
    );
};

export default ManagerPage;
