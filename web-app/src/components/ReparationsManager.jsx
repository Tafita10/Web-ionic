import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReparationsManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Gestion des Réparations
 * 
 * Fonctionnalités:
 * - Liste des signalements sans réparation
 * - Création de réparations avec niveau (1-10)
 * - Prix/m² global défini dans Paramètres
 * - Calcul automatique: budget_estime = prix_par_m2 × niveau × surface_m2
 * - Suivi de l'état des réparations
 */
const ReparationsManager = () => {
    const [signalementsSansReparation, setSignalementsSansReparation] = useState([]);
    const [reparations, setReparations] = useState([]);
    const [entreprises, setEntreprises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSignalement, setSelectedSignalement] = useState(null);
    
    // Charger le prix_par_m2 global depuis les paramètres
    const getGlobalPrixParM2 = () => {
        try {
            const params = JSON.parse(localStorage.getItem('webrojo_params') || '{}');
            return params.prixParM2 || 5000;
        } catch {
            return 5000;
        }
    };
    
    const [prixParM2Global] = useState(getGlobalPrixParM2());
    
    const [formData, setFormData] = useState({
        niveau_reparation: 5,
        id_entreprise_assignee: '',
        duree_estimee_jours: 7,
        commentaire: ''
    });

    const token = localStorage.getItem('token') || '';
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Charger les signalements sans réparation
    const fetchSignalementsSansReparation = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/signalements`, { headers });
            const signalements = response.data.data || [];
            // Filtrer ceux qui n'ont pas de réparation associée
            const repResponse = await axios.get(`${API_URL}/manager/reparations`, { headers });
            const reparationsExistantes = repResponse.data.data || [];
            const idsAvecReparation = reparationsExistantes.map(r => r.id_signalement);
            const sanReparation = signalements.filter(s => !idsAvecReparation.includes(s.id_signalement));
            setSignalementsSansReparation(sanReparation);
            setReparations(reparationsExistantes);
        } catch (err) {
            console.error('Erreur chargement signalements:', err);
        }
    };

    // Charger les entreprises
    const fetchEntreprises = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/entreprises`, { headers });
            setEntreprises(response.data.data || []);
        } catch (err) {
            console.error('Erreur chargement entreprises:', err);
        }
    };

    // Créer une réparation
    const creerReparation = async (e) => {
        e.preventDefault();
        if (!selectedSignalement) return;

        const surface = selectedSignalement.surface_endommagee_m2 || 0;
        const budgetEstime = prixParM2Global * formData.niveau_reparation * surface;

        try {
            await axios.post(
                `${API_URL}/manager/reparations`,
                {
                    id_signalement: selectedSignalement.id_signalement,
                    niveau_reparation: formData.niveau_reparation,
                    prix_par_m2: prixParM2Global,
                    budget_estime_ar: budgetEstime,
                    id_entreprise_assignee: formData.id_entreprise_assignee || null,
                    duree_estimee_jours: formData.duree_estimee_jours,
                    commentaire: formData.commentaire
                },
                { headers }
            );
            setShowModal(false);
            setSelectedSignalement(null);
            resetForm();
            fetchSignalementsSansReparation();
        } catch (err) {
            console.error('Erreur création réparation:', err);
            alert('Erreur lors de la création de la réparation');
        }
    };

    // Mettre à jour l'état d'une réparation
    const updateEtatReparation = async (idReparation, nouvelEtat) => {
        try {
            await axios.put(
                `${API_URL}/manager/reparations/${idReparation}`,
                { etat_reparation: nouvelEtat },
                { headers }
            );
            fetchSignalementsSansReparation();
        } catch (err) {
            console.error('Erreur mise à jour état:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            niveau_reparation: 5,
            id_entreprise_assignee: '',
            duree_estimee_jours: 7,
            commentaire: ''
        });
    };

    const ouvrirModal = (signalement) => {
        setSelectedSignalement(signalement);
        setShowModal(true);
    };

    // Calcul du budget estimé en temps réel
    const calculBudgetEstime = () => {
        if (!selectedSignalement) return 0;
        const surface = selectedSignalement.surface_endommagee_m2 || 0;
        return prixParM2Global * formData.niveau_reparation * surface;
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchSignalementsSansReparation(), fetchEntreprises()]);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return <div className="reparations-loading">Chargement...</div>;
    }

    return (
        <div className="reparations-manager">
            <header className="reparations-header">
                <h1>🔧 Gestion des Réparations</h1>
                <p>Créer et suivre les réparations pour les signalements</p>
            </header>

            {/* Statistiques des réparations */}
            <section className="reparations-stats">
                <div className="stat-card">
                    <span className="stat-icon">📋</span>
                    <div className="stat-info">
                        <span className="stat-value">{signalementsSansReparation.length}</span>
                        <span className="stat-label">Sans réparation</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">⏳</span>
                    <div className="stat-info">
                        <span className="stat-value">{reparations.filter(r => r.etat_reparation === 'prevue').length}</span>
                        <span className="stat-label">Prévues</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🔄</span>
                    <div className="stat-info">
                        <span className="stat-value">{reparations.filter(r => r.etat_reparation === 'en_cours').length}</span>
                        <span className="stat-label">En cours</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">✅</span>
                    <div className="stat-info">
                        <span className="stat-value">{reparations.filter(r => r.etat_reparation === 'terminee').length}</span>
                        <span className="stat-label">Terminées</span>
                    </div>
                </div>
            </section>

            {/* Signalements sans réparation */}
            <section className="signalements-sans-reparation">
                <h2>📍 Signalements sans réparation</h2>
                {signalementsSansReparation.length === 0 ? (
                    <p className="no-data">Tous les signalements ont une réparation associée</p>
                ) : (
                    <div className="signalements-grid">
                        {signalementsSansReparation.map(sig => (
                            <div key={sig.id_signalement} className="signalement-card-mini">
                                <div className="card-header-mini">
                                    <h4>{sig.titre_signalement}</h4>
                                    <span className={`gravite-badge gravite-${(sig.niveau_gravite || 'moyen').toLowerCase()}`}>
                                        {sig.niveau_gravite || 'N/A'}
                                    </span>
                                </div>
                                <div className="card-info">
                                    <p><strong>Surface:</strong> {sig.surface_endommagee_m2 || 0} m²</p>
                                    <p><strong>Type:</strong> {sig.type_probleme || 'N/A'}</p>
                                    <p><strong>Date:</strong> {new Date(sig.date_signalement).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <button 
                                    className="btn-creer-reparation"
                                    onClick={() => ouvrirModal(sig)}
                                >
                                    ➕ Créer réparation
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Réparations existantes */}
            <section className="reparations-existantes">
                <h2>🔧 Réparations en cours</h2>
                {reparations.length === 0 ? (
                    <p className="no-data">Aucune réparation créée</p>
                ) : (
                    <div className="reparations-table-container">
                        <table className="reparations-table">
                            <thead>
                                <tr>
                                    <th>Signalement</th>
                                    <th>Niveau</th>
                                    <th>Prix/m²</th>
                                    <th>Budget estimé</th>
                                    <th>Entreprise</th>
                                    <th>État</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reparations.map(rep => (
                                    <tr key={rep.id_reparation}>
                                        <td>{rep.titre_signalement || `#${rep.id_signalement}`}</td>
                                        <td className="center">
                                            <span className="niveau-badge">{rep.niveau_reparation}</span>
                                        </td>
                                        <td className="right">{Number(rep.prix_par_m2).toLocaleString()} Ar</td>
                                        <td className="right">
                                            <strong>{Number(rep.budget_estime_ar).toLocaleString()} Ar</strong>
                                        </td>
                                        <td>{rep.nom_entreprise || '-'}</td>
                                        <td>
                                            <span className={`etat-badge etat-${rep.etat_reparation}`}>
                                                {rep.etat_reparation === 'prevue' ? 'Prévue' : 
                                                 rep.etat_reparation === 'en_cours' ? 'En cours' : 'Terminée'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {rep.etat_reparation === 'prevue' && (
                                                    <button 
                                                        className="btn-action btn-start"
                                                        onClick={() => updateEtatReparation(rep.id_reparation, 'en_cours')}
                                                        title="Démarrer"
                                                    >
                                                        ▶️
                                                    </button>
                                                )}
                                                {rep.etat_reparation === 'en_cours' && (
                                                    <button 
                                                        className="btn-action btn-complete"
                                                        onClick={() => updateEtatReparation(rep.id_reparation, 'terminee')}
                                                        title="Terminer"
                                                    >
                                                        ✅
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Modal création réparation */}
            {showModal && selectedSignalement && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Créer une réparation</h3>
                            <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="signalement-info">
                                <h4>{selectedSignalement.titre_signalement}</h4>
                                <p><strong>Surface:</strong> {selectedSignalement.surface_endommagee_m2 || 0} m²</p>
                                <p><strong>Type:</strong> {selectedSignalement.type_probleme}</p>
                            </div>

                            <form onSubmit={creerReparation}>
                                <div className="form-group">
                                    <label>Niveau de réparation (1-10)</label>
                                    <input 
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={formData.niveau_reparation}
                                        onChange={e => setFormData({...formData, niveau_reparation: parseInt(e.target.value)})}
                                    />
                                    <span className="niveau-display">{formData.niveau_reparation}</span>
                                </div>

                                <div className="budget-calcul">
                                    <div className="prix-global-info">
                                        <small>💡 Prix/m² global (défini dans Paramètres)</small>
                                    </div>
                                    <div className="formule">
                                        <span>{prixParM2Global.toLocaleString()} Ar/m²</span>
                                        <span>×</span>
                                        <span>niveau {formData.niveau_reparation}</span>
                                        <span>×</span>
                                        <span>{selectedSignalement.surface_endommagee_m2 || 0} m²</span>
                                    </div>
                                    <div className="budget-result">
                                        <strong>= {calculBudgetEstime().toLocaleString()} Ar</strong>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Entreprise assignée</label>
                                    <select 
                                        value={formData.id_entreprise_assignee}
                                        onChange={e => setFormData({...formData, id_entreprise_assignee: e.target.value})}
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        {entreprises.map(ent => (
                                            <option key={ent.id_entreprise} value={ent.id_entreprise}>
                                                {ent.nom_entreprise} ({ent.note_evaluation}⭐)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Durée estimée (jours)</label>
                                    <input 
                                        type="number"
                                        value={formData.duree_estimee_jours}
                                        onChange={e => setFormData({...formData, duree_estimee_jours: parseInt(e.target.value)})}
                                        min="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Commentaire</label>
                                    <textarea 
                                        value={formData.commentaire}
                                        onChange={e => setFormData({...formData, commentaire: e.target.value})}
                                        placeholder="Notes sur la réparation..."
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        Créer la réparation
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReparationsManager;
