import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EntreprisesManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Gestion des Entreprises de Construction
 */
const EntreprisesManager = () => {
    const [entreprises, setEntreprises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEntreprise, setEditingEntreprise] = useState(null);
    const [formData, setFormData] = useState({
        nom_entreprise: '',
        numero_registre: '',
        telephone: '',
        email: '',
        specialites: '',
        note_evaluation: 3.5,
        est_certifiee: false
    });

    const token = localStorage.getItem('token') || '';
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const fetchEntreprises = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/entreprises`, { headers });
            setEntreprises(response.data.data || []);
        } catch (err) {
            console.error('Erreur chargement entreprises:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEntreprise) {
                await axios.put(
                    `${API_URL}/manager/entreprises/${editingEntreprise.id_entreprise}`,
                    formData,
                    { headers }
                );
            } else {
                await axios.post(`${API_URL}/manager/entreprises`, formData, { headers });
            }
            setShowModal(false);
            resetForm();
            fetchEntreprises();
        } catch (err) {
            console.error('Erreur sauvegarde entreprise:', err);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (entreprise) => {
        setEditingEntreprise(entreprise);
        setFormData({
            nom_entreprise: entreprise.nom_entreprise || '',
            numero_registre: entreprise.numero_registre || '',
            telephone: entreprise.telephone || '',
            email: entreprise.email || '',
            specialites: Array.isArray(entreprise.specialites) 
                ? entreprise.specialites.join(', ') 
                : entreprise.specialites || '',
            note_evaluation: entreprise.note_evaluation || 3.5,
            est_certifiee: entreprise.est_certifiee || false
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette entreprise ?')) return;
        try {
            await axios.delete(`${API_URL}/manager/entreprises/${id}`, { headers });
            fetchEntreprises();
        } catch (err) {
            console.error('Erreur suppression:', err);
            alert('Erreur lors de la suppression');
        }
    };

    const resetForm = () => {
        setEditingEntreprise(null);
        setFormData({
            nom_entreprise: '',
            numero_registre: '',
            telephone: '',
            email: '',
            specialites: '',
            note_evaluation: 3.5,
            est_certifiee: false
        });
    };

    const openNewModal = () => {
        resetForm();
        setShowModal(true);
    };

    useEffect(() => {
        fetchEntreprises();
    }, []);

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="entreprises-manager">
            <header className="section-header">
                <div>
                    <h1>🏢 Gestion des Entreprises</h1>
                    <p>Gérer les entreprises de construction partenaires</p>
                </div>
                <button className="btn-primary" onClick={openNewModal}>
                    ➕ Nouvelle entreprise
                </button>
            </header>

            {/* Liste des entreprises */}
            <div className="entreprises-grid">
                {entreprises.length === 0 ? (
                    <p className="no-data">Aucune entreprise enregistrée</p>
                ) : (
                    entreprises.map(ent => (
                        <div key={ent.id_entreprise} className="entreprise-card">
                            <div className="card-header">
                                <h3>{ent.nom_entreprise}</h3>
                                {ent.est_certifiee && <span className="badge-certified">✓ Certifiée</span>}
                            </div>
                            <div className="card-body">
                                <div className="info-row">
                                    <span>📋 Registre:</span>
                                    <span>{ent.numero_registre || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span>📞 Téléphone:</span>
                                    <span>{ent.telephone || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span>📧 Email:</span>
                                    <span>{ent.email || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span>⭐ Note:</span>
                                    <span className="rating">{ent.note_evaluation || 0}/5</span>
                                </div>
                                <div className="info-row">
                                    <span>🔧 Spécialités:</span>
                                    <span className="specialites">
                                        {Array.isArray(ent.specialites) 
                                            ? ent.specialites.join(', ') 
                                            : ent.specialites || 'N/A'}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span>📊 Projets:</span>
                                    <span>{ent.nombre_projets_realises || 0}</span>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button className="btn-edit" onClick={() => handleEdit(ent)}>
                                    ✏️ Modifier
                                </button>
                                <button className="btn-delete" onClick={() => handleDelete(ent.id_entreprise)}>
                                    🗑️ Supprimer
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingEntreprise ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}</h3>
                            <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nom de l'entreprise *</label>
                                <input
                                    type="text"
                                    value={formData.nom_entreprise}
                                    onChange={e => setFormData({...formData, nom_entreprise: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Numéro de registre</label>
                                    <input
                                        type="text"
                                        value={formData.numero_registre}
                                        onChange={e => setFormData({...formData, numero_registre: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Téléphone</label>
                                    <input
                                        type="text"
                                        value={formData.telephone}
                                        onChange={e => setFormData({...formData, telephone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Spécialités (séparées par des virgules)</label>
                                <input
                                    type="text"
                                    value={formData.specialites}
                                    onChange={e => setFormData({...formData, specialites: e.target.value})}
                                    placeholder="goudronnage, terrassement, voirie..."
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Note d'évaluation (0-5)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={formData.note_evaluation}
                                        onChange={e => setFormData({...formData, note_evaluation: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.est_certifiee}
                                            onChange={e => setFormData({...formData, est_certifiee: e.target.checked})}
                                        />
                                        Entreprise certifiée
                                    </label>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingEntreprise ? 'Enregistrer' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntreprisesManager;
