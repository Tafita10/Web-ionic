import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import StatisticsPanel from './StatisticsPanel';
import SignalementModal from './SignalementModal';
import './VisitorModule.css';

const VisitorModule = () => {
    const [signalements, setSignalements] = useState([]);
    const [stats, setStats] = useState(null);
    const [villes, setVilles] = useState([]);
    const [selectedSignalement, setSelectedSignalement] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        statut: '',
        gravite: '',
        ville: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // Récupérer les statistiques
    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE}/visitor/stats`);
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des stats:', err);
            setError('Impossible de charger les statistiques');
        }
    }, [API_BASE]);

    // Récupérer les signalements
    const fetchSignalements = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.statut) params.append('statut', filters.statut);
            if (filters.gravite) params.append('gravite', filters.gravite);
            if (filters.ville) params.append('ville', filters.ville);
            
            const response = await axios.get(`${API_BASE}/visitor/signalements?${params}`);
            if (response.data.success) {
                setSignalements(response.data.data);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des signalements:', err);
            setError('Impossible de charger les signalements');
        } finally {
            setLoading(false);
        }
    }, [filters, API_BASE]);

    // Récupérer les villes
    const fetchVilles = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE}/visitor/villes`);
            if (response.data.success) {
                setVilles(response.data.data);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des villes:', err);
        }
    }, [API_BASE]);

    // Charger les données au montage et lors des changements de filtres
    useEffect(() => {
        fetchStats();
        fetchVilles();
    }, [fetchStats, fetchVilles]);

    useEffect(() => {
        fetchSignalements();
    }, [fetchSignalements]);

    // Ouvrir le modal d'un signalement
    const handleSelectSignalement = async (id) => {
        try {
            const response = await axios.get(`${API_BASE}/visitor/signalements/${id}`);
            if (response.data.success) {
                setSelectedSignalement(response.data.data);
                setShowModal(true);
            }
        } catch (err) {
            console.error('Erreur lors du chargement du signalement:', err);
            setError('Impossible de charger les détails du signalement');
        }
    };

    // Fermer le modal
    const handleCloseModal = () => {
        setShowModal(false);
        setTimeout(() => setSelectedSignalement(null), 300);
    };

    // Réinitialiser les filtres
    const handleResetFilters = () => {
        setFilters({ statut: '', gravite: '', ville: '' });
    };

    return (
        <div className="visitor-module">
            <div className="visitor-header">
                <h1>🗺️ Carte Interactive - Signalements Routiers</h1>
                <p>Explorez les problèmes routiers à Antananarivo et suivez les travaux de réparation</p>
            </div>

            <div className="visitor-container">
                {/* Panneau des statistiques */}
                <StatisticsPanel stats={stats} loading={loading} />

                {/* Section principale */}
                <div className="visitor-main">
                    {/* Filtres */}
                    <div className="filters-section">
                        <h3>Filtrer par:</h3>
                        <div className="filters-group">
                            <select
                                value={filters.statut}
                                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                                className="filter-select"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="Nouveau">🔴 Nouveau</option>
                                <option value="En cours">🟠 En cours</option>
                                <option value="Terminé">🟢 Terminé</option>
                                <option value="Annulé">⚫ Annulé</option>
                            </select>

                            <select
                                value={filters.gravite}
                                onChange={(e) => setFilters({ ...filters, gravite: e.target.value })}
                                className="filter-select"
                            >
                                <option value="">Toutes les gravités</option>
                                <option value="Faible">Faible</option>
                                <option value="Moyen">Moyen</option>
                                <option value="Élevé">Élevé</option>
                                <option value="Critique">Critique</option>
                            </select>

                            <select
                                value={filters.ville}
                                onChange={(e) => setFilters({ ...filters, ville: e.target.value })}
                                className="filter-select"
                            >
                                <option value="">Toutes les villes</option>
                                {villes.map((ville) => (
                                    <option key={ville.id_ville} value={ville.id_ville}>
                                        {ville.nom_ville} ({ville.nombre_signalements})
                                    </option>
                                ))}
                            </select>

                            <button 
                                onClick={handleResetFilters}
                                className="btn-reset"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    {/* Carte */}
                    <div className="map-container">
                        <MapComponent 
                            signalements={signalements}
                            onSelectSignalement={handleSelectSignalement}
                            loading={loading}
                        />
                    </div>

                    {/* Message d'erreur */}
                    {error && (
                        <div className="error-message">
                            <span>⚠️ {error}</span>
                            <button onClick={() => setError(null)}>✕</button>
                        </div>
                    )}
                </div>

                {/* Tableau de signalements */}
                <div className="signalements-table-section">
                    <h3>📋 Liste des Signalements ({signalements.length})</h3>
                    {loading ? (
                        <div className="loading">Chargement en cours...</div>
                    ) : signalements.length === 0 ? (
                        <div className="empty-state">Aucun signalement trouvé</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="signalements-table">
                                <thead>
                                    <tr>
                                        <th>Titre</th>
                                        <th>Statut</th>
                                        <th>Gravité</th>
                                        <th>Ville</th>
                                        <th>Surface (m²)</th>
                                        <th>Budget (Ar)</th>
                                        <th>Photos</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {signalements.map((sig) => (
                                        <tr key={sig.id_signalement}>
                                            <td className="title-cell">{sig.titre_signalement}</td>
                                            <td>
                                                <span 
                                                    className="status-badge"
                                                    style={{ backgroundColor: sig.code_couleur }}
                                                >
                                                    {sig.libelle_statut}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`gravite-badge gravite-${(sig.niveau_gravite || 'moyen').toLowerCase()}`}>
                                                    {sig.niveau_gravite || 'Non défini'}
                                                </span>
                                            </td>
                                            <td>{sig.nom_ville}</td>
                                            <td className="numeric">
                                                {sig.surface_endommagee_m2 ? parseFloat(sig.surface_endommagee_m2).toFixed(2) : '-'}
                                            </td>
                                            <td className="numeric">
                                                {sig.budget_estime_ar ? `${(parseFloat(sig.budget_estime_ar) / 1000000).toFixed(1)}M` : '-'}
                                            </td>
                                            <td className="text-center">
                                                {sig.nombre_photos > 0 ? (
                                                    <span className="photo-badge">📸 {sig.nombre_photos}</span>
                                                ) : (
                                                    <span className="no-photo">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <button 
                                                    onClick={() => handleSelectSignalement(sig.id_signalement)}
                                                    className="btn-details"
                                                >
                                                    Détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal des détails */}
            {showModal && selectedSignalement && (
                <SignalementModal 
                    signalement={selectedSignalement}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default VisitorModule;
