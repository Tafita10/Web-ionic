import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import SignalementModal from './SignalementModal';
import './ManagerDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Dashboard Manager - Gestion des signalements
 * 
 * Fonctionnalités:
 * - Tableau de statistiques avec délai moyen
 * - Liste des signalements avec changement de statut
 * - Avancement automatique basé sur le statut
 */
const ManagerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [signalements, setSignalements] = useState([]);
    const [delaisParType, setDelaisParType] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSignalement, setSelectedSignalement] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filtres, setFiltres] = useState({
        statut: '',
        gravite: '',
        ville: ''
    });

    // Token d'authentification (à récupérer du contexte d'auth)
    const token = localStorage.getItem('token') || '';

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Charger les statistiques
    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/stats`, { headers });
            setStats(response.data.data);
        } catch (err) {
            console.error('Erreur chargement stats:', err);
            setError('Erreur de chargement des statistiques');
        }
    };

    // Charger les signalements
    const fetchSignalements = async () => {
        try {
            const params = new URLSearchParams();
            if (filtres.statut) params.append('statut', filtres.statut);
            if (filtres.gravite) params.append('gravite', filtres.gravite);
            if (filtres.ville) params.append('ville', filtres.ville);

            const response = await axios.get(`${API_URL}/manager/signalements?${params}`, { headers });
            setSignalements(response.data.data);
        } catch (err) {
            console.error('Erreur chargement signalements:', err);
        }
    };

    // Charger les délais par type de problème
    const fetchDelaisParType = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/delais-par-type`, { headers });
            setDelaisParType(response.data.data || []);
        } catch (err) {
            console.error('Erreur chargement délais par type:', err);
        }
    };

    // Changer le statut d'un signalement
    const changerStatut = async (id, nouveauStatut) => {
        try {
            await axios.put(
                `${API_URL}/manager/signalements/${id}/statut`,
                { id_nouveau_statut: nouveauStatut },
                { headers }
            );
            // Recharger les données
            fetchStats();
            fetchSignalements();
        } catch (err) {
            console.error('Erreur changement statut:', err);
            alert('Erreur lors du changement de statut');
        }
    };

    // Ouvrir le modal d'un signalement depuis la carte
    const handleSelectSignalement = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/manager/signalements`, { headers });
            const sig = (response.data.data || []).find(s => s.id_signalement === id);
            if (sig) {
                setSelectedSignalement(sig);
                setShowModal(true);
            }
        } catch (err) {
            console.error('Erreur chargement signalement:', err);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setTimeout(() => setSelectedSignalement(null), 300);
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchSignalements(), fetchDelaisParType()]);
            setLoading(false);
        };
        loadData();
    }, [filtres]);

    if (loading) {
        return <div className="manager-loading">Chargement...</div>;
    }

    if (error) {
        return <div className="manager-error">{error}</div>;
    }

    return (
        <div className="manager-dashboard">
            <header className="manager-header">
                <h1>🛠️ Dashboard Manager</h1>
                <p>Gestion des signalements routiers</p>
            </header>

            {/* Tableau de statistiques */}
            <section className="stats-section">
                <h2>📊 Tableau de Statistiques</h2>
                <div className="stats-table-container">
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th>Indicateur</th>
                                <th>Valeur</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>📋 Nombre total de travaux</td>
                                <td><strong>{stats?.nombre_total_travaux || 0}</strong></td>
                            </tr>
                            <tr>
                                <td>✅ Travaux terminés</td>
                                <td className="status-termine">{stats?.travaux_termines || 0}</td>
                            </tr>
                            <tr>
                                <td>🔄 Travaux en cours</td>
                                <td className="status-encours">{stats?.travaux_en_cours || 0}</td>
                            </tr>
                            <tr>
                                <td>🆕 Travaux nouveaux</td>
                                <td className="status-nouveau">{stats?.travaux_nouveaux || 0}</td>
                            </tr>
                            <tr className="highlight-row">
                                <td>⏱️ <strong>Délai moyen de traitement</strong></td>
                                <td><strong>{stats?.delai_moyen_traitement_jours || 0} jours</strong></td>
                            </tr>
                            <tr>
                                <td>🚀 Délai moyen avant démarrage</td>
                                <td>{stats?.delai_moyen_demarrage_jours || 0} jours</td>
                            </tr>
                            <tr>
                                <td>🔧 Durée moyenne des travaux</td>
                                <td>{stats?.duree_moyenne_travaux_jours || 0} jours</td>
                            </tr>
                            <tr>
                                <td>📐 Surface totale</td>
                                <td>{stats?.surface_totale_m2?.toFixed(2) || 0} m²</td>
                            </tr>
                            <tr>
                                <td>💰 Budget total estimé</td>
                                <td>{((stats?.budget_total_estime_ar || 0) / 1000000).toFixed(1)} M Ar</td>
                            </tr>
                            <tr className="highlight-row">
                                <td>📈 <strong>Avancement global</strong></td>
                                <td>
                                    <div className="progress-indicator">
                                        <span className="progress-value">{stats?.pourcentage_avancement_global?.toFixed(1) || 0}%</span>
                                        <div className="mini-progress-bar">
                                            <div 
                                                className="mini-progress-fill"
                                                style={{ width: `${stats?.pourcentage_avancement_global || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="avancement-explanation">
                    <h4>📌 Règle de calcul de l'avancement :</h4>
                    <ul>
                        <li><span className="badge-nouveau">Nouveau</span> = 0%</li>
                        <li><span className="badge-encours">En cours</span> = 50%</li>
                        <li><span className="badge-termine">Terminé</span> = 100%</li>
                    </ul>
                    <p>Avancement global = moyenne de tous les pourcentages</p>
                    <p className="example">
                        Exemple: (0 + 50 + 100 + 100) / 4 = <strong>62.5%</strong>
                    </p>
                </div>
            </section>

            {/* Tableau des délais par type de problème */}
            <section className="delais-section">
                <h2>⏱️ Délais de Traitement par Type de Problème</h2>
                <p className="section-desc">Statistiques basées sur les travaux terminés</p>
                
                <div className="delais-table-container">
                    <table className="delais-table">
                        <thead>
                            <tr>
                                <th>Type de problème</th>
                                <th>Nombre terminés</th>
                                <th>Délai total (jours)</th>
                                <th>Prise en charge (jours)</th>
                                <th>Durée travaux (jours)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {delaisParType.length > 0 ? (
                                delaisParType.map((d, index) => (
                                    <tr key={index}>
                                        <td><strong>{d.type_probleme}</strong></td>
                                        <td className="center">{d.nombre}</td>
                                        <td className="center highlight">{d.delai_total}</td>
                                        <td className="center">{d.delai_prise_charge}</td>
                                        <td className="center">{d.duree_travaux}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">
                                        Aucune donnée de délai disponible (nécessite des travaux terminés)
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="delais-legend">
                    <p><strong>Délai total</strong> = Date signalement → Date fin travaux</p>
                    <p><strong>Prise en charge</strong> = Date signalement → Date début travaux</p>
                    <p><strong>Durée travaux</strong> = Date début → Date fin travaux</p>
                </div>
            </section>

            {/* Filtres */}
            <section className="filtres-section">
                <h2>🔍 Filtres</h2>
                <div className="filtres-row">
                    <select 
                        value={filtres.statut} 
                        onChange={(e) => setFiltres({...filtres, statut: e.target.value})}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="Nouveau">Nouveau</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminé">Terminé</option>
                    </select>

                    <select 
                        value={filtres.gravite} 
                        onChange={(e) => setFiltres({...filtres, gravite: e.target.value})}
                    >
                        <option value="">Toutes les gravités</option>
                        <option value="Faible">Faible</option>
                        <option value="Moyen">Moyen</option>
                        <option value="Élevé">Élevé</option>
                        <option value="Critique">Critique</option>
                    </select>

                    <button 
                        className="btn-reset"
                        onClick={() => setFiltres({ statut: '', gravite: '', ville: '' })}
                    >
                        Réinitialiser
                    </button>
                </div>
            </section>

            {/* Carte interactive Manager (avec budget) */}
            <section className="carte-manager-section">
                <h2>🗺️ Carte des Signalements</h2>
                <p className="section-desc">Vue géographique avec budgets estimés</p>
                <div className="manager-map-container">
                    <MapComponent
                        signalements={signalements}
                        onSelectSignalement={handleSelectSignalement}
                        loading={loading}
                        isPublic={false}
                    />
                </div>
            </section>

            {/* Liste des signalements */}
            <section className="signalements-section">
                <h2>📍 Liste des Signalements ({signalements.length})</h2>
                <div className="signalements-grid">
                    {signalements.map((sig) => (
                        <div key={sig.id_signalement} className="signalement-card">
                            <div className="card-header">
                                <h3>{sig.titre_signalement}</h3>
                                <span 
                                    className="status-badge"
                                    style={{ backgroundColor: sig.code_couleur }}
                                >
                                    {sig.libelle_statut}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <span>📅 Signalé le:</span>
                                    <span>{new Date(sig.date_signalement).toLocaleDateString('fr-FR')}</span>
                                </div>
                                
                                <div className="info-row">
                                    <span>📊 Avancement:</span>
                                    <div className="progress-mini">
                                        <div className="progress-bar-mini">
                                            <div 
                                                className="progress-fill-mini"
                                                style={{ width: `${sig.pourcentage_avancement}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">{sig.pourcentage_avancement}%</span>
                                    </div>
                                </div>

                                {sig.date_en_cours && (
                                    <div className="info-row">
                                        <span>🚀 Début travaux:</span>
                                        <span>{new Date(sig.date_en_cours).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                )}

                                {sig.date_termine && (
                                    <div className="info-row">
                                        <span>✅ Fin travaux:</span>
                                        <span>{new Date(sig.date_termine).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                )}

                                {sig.delai_total_traitement_jours && (
                                    <div className="info-row highlight">
                                        <span>⏱️ Délai traitement:</span>
                                        <span><strong>{sig.delai_total_traitement_jours} jours</strong></span>
                                    </div>
                                )}

                                {sig.surface_endommagee_m2 && (
                                    <div className="info-row">
                                        <span>📐 Surface:</span>
                                        <span>{sig.surface_endommagee_m2} m²</span>
                                    </div>
                                )}

                                {sig.budget_estime_ar && (
                                    <div className="info-row">
                                        <span>💰 Budget:</span>
                                        <span>{(sig.budget_estime_ar / 1000000).toFixed(1)} M Ar</span>
                                    </div>
                                )}

                                {sig.nom_entreprise && (
                                    <div className="info-row">
                                        <span>🏢 Entreprise:</span>
                                        <span>{sig.nom_entreprise}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                <label>Changer statut:</label>
                                <div className="status-buttons">
                                    <button 
                                        className={`btn-status btn-nouveau ${sig.id_statut === 1 ? 'active' : ''}`}
                                        onClick={() => changerStatut(sig.id_signalement, 1)}
                                        disabled={sig.id_statut === 1}
                                    >
                                        Nouveau
                                    </button>
                                    <button 
                                        className={`btn-status btn-encours ${sig.id_statut === 2 ? 'active' : ''}`}
                                        onClick={() => changerStatut(sig.id_signalement, 2)}
                                        disabled={sig.id_statut === 2}
                                    >
                                        En cours
                                    </button>
                                    <button 
                                        className={`btn-status btn-termine ${sig.id_statut === 3 ? 'active' : ''}`}
                                        onClick={() => changerStatut(sig.id_signalement, 3)}
                                        disabled={sig.id_statut === 3}
                                    >
                                        Terminé
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            {/* Modal des détails */}
            {showModal && selectedSignalement && (
                <SignalementModal
                    signalement={selectedSignalement}
                    onClose={handleCloseModal}
                    isPublic={false}
                />
            )}
        </div>
    );
};

export default ManagerDashboard;
