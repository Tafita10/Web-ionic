import React from 'react';
import './StatisticsPanel.css';

const StatisticsPanel = ({ stats, loading }) => {
    if (loading || !stats) {
        return (
            <div className="stats-panel loading">
                <div className="stat-skeleton"></div>
                <div className="stat-skeleton"></div>
                <div className="stat-skeleton"></div>
                <div className="stat-skeleton"></div>
            </div>
        );
    }

    return (
        <div className="stats-panel">
            <div className="stat-card">
                <div className="stat-icon">📍</div>
                <div className="stat-content">
                    <div className="stat-value">{stats.nombre_total}</div>
                    <div className="stat-label">Signalements</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">📏</div>
                <div className="stat-content">
                    <div className="stat-value">{stats.surface_totale_m2?.toFixed(0)}</div>
                    <div className="stat-label">m² à réparer</div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                    <div className="stat-value">{(stats.budget_total_ar / 1000000)?.toFixed(1)}M</div>
                    <div className="stat-label">Budget (Ar)</div>
                </div>
            </div>

            <div className="stat-card progress-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                    <div className="stat-value">{stats.pourcentage_avancement?.toFixed(0)}%</div>
                    <div className="stat-label">Avancement</div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${stats.pourcentage_avancement || 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="stat-card mini">
                <span className="mini-badge nouveau">🔴 {stats.nombre_nouveau}</span>
                <span className="mini-label">Nouveau</span>
            </div>

            <div className="stat-card mini">
                <span className="mini-badge encours">🟠 {stats.nombre_en_cours}</span>
                <span className="mini-label">En cours</span>
            </div>

            <div className="stat-card mini">
                <span className="mini-badge termine">🟢 {stats.nombre_termine}</span>
                <span className="mini-label">Terminé</span>
            </div>
        </div>
    );
};

export default StatisticsPanel;
