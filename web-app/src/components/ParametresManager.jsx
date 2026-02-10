import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ParametresManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Clé localStorage pour les paramètres
const PARAMS_KEY = 'webrojo_params';

/**
 * Paramètres du système
 * Configuration globale pour les réparations
 */
const ParametresManager = () => {
    const [params, setParams] = useState({
        prix_par_m2: 5000,
        devise: 'Ar',
        niveaux_reparation: {
            min: 1,
            max: 10
        },
        duree_estimee_default: 7,
        notifications_email: false,
        synchronisation_auto: true
    });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    // Charger les paramètres depuis localStorage
    useEffect(() => {
        const savedParams = localStorage.getItem(PARAMS_KEY);
        if (savedParams) {
            try {
                setParams(JSON.parse(savedParams));
            } catch (e) {
                console.error('Erreur lecture paramètres:', e);
            }
        }
        setLoading(false);
    }, []);

    // Sauvegarder les paramètres
    const sauvegarder = () => {
        localStorage.setItem(PARAMS_KEY, JSON.stringify(params));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    // Réinitialiser les paramètres
    const reinitialiser = () => {
        const defaultParams = {
            prix_par_m2: 5000,
            devise: 'Ar',
            niveaux_reparation: { min: 1, max: 10 },
            duree_estimee_default: 7,
            notifications_email: false,
            synchronisation_auto: true
        };
        setParams(defaultParams);
        localStorage.setItem(PARAMS_KEY, JSON.stringify(defaultParams));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="parametres-manager">
            <header className="section-header">
                <div>
                    <h1>⚙️ Paramètres</h1>
                    <p>Configuration globale du système</p>
                </div>
                {saved && <span className="saved-indicator">✅ Paramètres sauvegardés</span>}
            </header>

            <div className="params-grid">
                {/* Section Réparations */}
                <section className="params-section">
                    <h2>🔧 Réparations</h2>
                    <p className="section-desc">Paramètres par défaut pour le calcul des budgets</p>

                    <div className="param-item highlight">
                        <div className="param-info">
                            <label>Prix par m² (Ar)</label>
                            <p>Prix forfaitaire utilisé pour calculer le budget estimé des réparations</p>
                            <p className="formula">
                                <strong>Formule:</strong> Budget = Prix/m² × Niveau × Surface
                            </p>
                        </div>
                        <div className="param-input">
                            <input
                                type="number"
                                value={params.prix_par_m2}
                                onChange={e => setParams({...params, prix_par_m2: parseInt(e.target.value) || 0})}
                                min="0"
                                step="100"
                            />
                            <span className="unit">Ar</span>
                        </div>
                    </div>

                    <div className="param-item">
                        <div className="param-info">
                            <label>Niveaux de réparation</label>
                            <p>Plage des niveaux de complexité (1 = simple, 10 = très complexe)</p>
                        </div>
                        <div className="param-range">
                            <input
                                type="number"
                                value={params.niveaux_reparation.min}
                                onChange={e => setParams({
                                    ...params, 
                                    niveaux_reparation: {...params.niveaux_reparation, min: parseInt(e.target.value) || 1}
                                })}
                                min="1"
                                max="5"
                            />
                            <span>à</span>
                            <input
                                type="number"
                                value={params.niveaux_reparation.max}
                                onChange={e => setParams({
                                    ...params, 
                                    niveaux_reparation: {...params.niveaux_reparation, max: parseInt(e.target.value) || 10}
                                })}
                                min="5"
                                max="10"
                            />
                        </div>
                    </div>

                    <div className="param-item">
                        <div className="param-info">
                            <label>Durée estimée par défaut</label>
                            <p>Nombre de jours par défaut pour une nouvelle réparation</p>
                        </div>
                        <div className="param-input">
                            <input
                                type="number"
                                value={params.duree_estimee_default}
                                onChange={e => setParams({...params, duree_estimee_default: parseInt(e.target.value) || 7})}
                                min="1"
                            />
                            <span className="unit">jours</span>
                        </div>
                    </div>
                </section>

                {/* Section Système */}
                <section className="params-section">
                    <h2>🖥️ Système</h2>
                    <p className="section-desc">Configuration générale de l'application</p>

                    <div className="param-item">
                        <div className="param-info">
                            <label>Devise</label>
                            <p>Devise utilisée pour les montants</p>
                        </div>
                        <div className="param-input">
                            <select
                                value={params.devise}
                                onChange={e => setParams({...params, devise: e.target.value})}
                            >
                                <option value="Ar">Ariary (Ar)</option>
                                <option value="MGA">MGA</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="USD">Dollar ($)</option>
                            </select>
                        </div>
                    </div>

                    <div className="param-item">
                        <div className="param-info">
                            <label>Notifications email</label>
                            <p>Recevoir des notifications par email pour les nouveaux signalements</p>
                        </div>
                        <div className="param-toggle">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={params.notifications_email}
                                    onChange={e => setParams({...params, notifications_email: e.target.checked})}
                                />
                                <span className="slider"></span>
                            </label>
                            <span>{params.notifications_email ? 'Activé' : 'Désactivé'}</span>
                        </div>
                    </div>

                    <div className="param-item">
                        <div className="param-info">
                            <label>Synchronisation automatique</label>
                            <p>Synchroniser automatiquement avec Firebase</p>
                        </div>
                        <div className="param-toggle">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={params.synchronisation_auto}
                                    onChange={e => setParams({...params, synchronisation_auto: e.target.checked})}
                                />
                                <span className="slider"></span>
                            </label>
                            <span>{params.synchronisation_auto ? 'Activé' : 'Désactivé'}</span>
                        </div>
                    </div>
                </section>

                {/* Section Aperçu du calcul */}
                <section className="params-section preview-section">
                    <h2>📊 Aperçu du calcul</h2>
                    <p className="section-desc">Exemple de calcul de budget pour une réparation</p>

                    <div className="calcul-preview">
                        <div className="calcul-row">
                            <span>Prix par m²</span>
                            <span>{params.prix_par_m2.toLocaleString()} {params.devise}</span>
                        </div>
                        <div className="calcul-row">
                            <span>× Niveau (ex: 5)</span>
                            <span>5</span>
                        </div>
                        <div className="calcul-row">
                            <span>× Surface (ex: 20 m²)</span>
                            <span>20 m²</span>
                        </div>
                        <div className="calcul-row total">
                            <span>= Budget estimé</span>
                            <span>{(params.prix_par_m2 * 5 * 20).toLocaleString()} {params.devise}</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Actions */}
            <div className="params-actions">
                <button className="btn-reset" onClick={reinitialiser}>
                    🔄 Réinitialiser par défaut
                </button>
                <button className="btn-save" onClick={sauvegarder}>
                    💾 Sauvegarder les paramètres
                </button>
            </div>
        </div>
    );
};

export default ParametresManager;
