import React from 'react';
import './SignalementModal.css';

const SignalementModal = ({ signalement, onClose, isPublic = false }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatBudget = (budget) => {
        if (!budget) return '-';
        return (budget / 1000000).toFixed(2) + 'M Ar';
    };

    const calculateDaysRemaining = () => {
        if (!signalement.date_fin_travaux) return null;
        const end = new Date(signalement.date_fin_travaux);
        const today = new Date();
        const days = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return days;
    };

    const daysRemaining = calculateDaysRemaining();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="modal-header">
                    <h2>{signalement.titre_signalement}</h2>
                    <span 
                        className="modal-status"
                        style={{ backgroundColor: signalement.code_couleur }}
                    >
                        {signalement.libelle_statut}
                    </span>
                </div>

                <div className="modal-body">
                    {/* Description */}
                    <section className="modal-section">
                        <h3>📝 Description</h3>
                        <p>{signalement.description_signalement}</p>
                    </section>

                    {/* Informations de base */}
                    <section className="modal-section">
                        <h3>ℹ️ Informations Générales</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>📅 Date du signalement:</label>
                                <span>{formatDate(signalement.date_signalement)}</span>
                            </div>
                            <div className="info-item">
                                <label>📍 Localisation:</label>
                                <span>{signalement.nom_ville} {signalement.nom_route ? ` - ${signalement.nom_route}` : ''}</span>
                            </div>
                            <div className="info-item">
                                <label>📌 Adresse complète:</label>
                                <span>{signalement.adresse_complete || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>⚠️ Gravité:</label>
                                <span className={`gravite-tag gravite-${signalement.niveau_gravite.toLowerCase()}`}>
                                    {signalement.niveau_gravite}
                                </span>
                            </div>
                            <div className="info-item">
                                <label>🔧 Type de problème:</label>
                                <span>{signalement.type_probleme}</span>
                            </div>
                            <div className="info-item">
                                <label>👤 Créateur:</label>
                                <span>{signalement.nom_createur}</span>
                            </div>
                        </div>
                    </section>

                    {/* Données techniques */}
                    <section className="modal-section">
                        <h3>📐 Données Techniques</h3>
                        <div className="tech-grid">
                            <div className="tech-item">
                                <label>Surface endommagée:</label>
                                <span>{signalement.surface_endommagee_m2 ? `${signalement.surface_endommagee_m2.toFixed(2)} m²` : '-'}</span>
                            </div>
                            <div className="tech-item">
                                <label>Profondeur:</label>
                                <span>{signalement.profondeur_cm ? `${signalement.profondeur_cm} cm` : '-'}</span>
                            </div>
                            <div className="tech-item">
                                <label>Longueur:</label>
                                <span>{signalement.longueur_m ? `${signalement.longueur_m} m` : '-'}</span>
                            </div>
                            <div className="tech-item">
                                <label>Largeur:</label>
                                <span>{signalement.largeur_m ? `${signalement.largeur_m} m` : '-'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Budget & Réparation - masqué en vue publique */}
                    {!isPublic && (
                        <section className="modal-section">
                            <h3>💰 Réparation & Budget</h3>
                            <div className="budget-grid">
                                {signalement.niveau_reparation && (
                                    <div className="budget-item">
                                        <label>Niveau de réparation:</label>
                                        <span className="budget-value">{signalement.niveau_reparation} / 10</span>
                                    </div>
                                )}
                                {signalement.prix_par_m2 && (
                                    <div className="budget-item">
                                        <label>Prix par m²:</label>
                                        <span className="budget-value">{parseFloat(signalement.prix_par_m2).toLocaleString('fr-FR')} Ar</span>
                                    </div>
                                )}
                                <div className="budget-item">
                                    <label>Budget estimé:</label>
                                    <span className="budget-value">{formatBudget(signalement.budget_estime_ar)}</span>
                                </div>
                                <div className="budget-item">
                                    <label>Budget réalisé:</label>
                                    <span className="budget-value">{formatBudget(signalement.budget_reel_ar)}</span>
                                </div>
                                {signalement.etat_reparation && (
                                    <div className="budget-item">
                                        <label>État réparation:</label>
                                        <span className={`etat-tag etat-${signalement.etat_reparation}`}>
                                            {signalement.etat_reparation === 'prevue' ? 'Prévue' : 
                                             signalement.etat_reparation === 'en_cours' ? 'En cours' : 'Terminée'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {signalement.prix_par_m2 && signalement.niveau_reparation && signalement.surface_endommagee_m2 && (
                                <div className="budget-formula">
                                    <small>
                                        📐 Formule : {parseFloat(signalement.prix_par_m2).toLocaleString('fr-FR')} Ar/m² 
                                        × niveau {signalement.niveau_reparation} 
                                        × {parseFloat(signalement.surface_endommagee_m2).toFixed(2)} m² 
                                        = <strong>{formatBudget(signalement.budget_estime_ar)}</strong>
                                    </small>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Travaux */}
                    {signalement.date_debut_travaux && (
                        <section className="modal-section">
                            <h3>🔨 Suivi des Travaux</h3>
                            <div className="work-info">
                                <div className="work-item">
                                    <label>📅 Début des travaux:</label>
                                    <span>{formatDate(signalement.date_debut_travaux)}</span>
                                </div>
                                {signalement.date_fin_travaux && (
                                    <>
                                        <div className="work-item">
                                            <label>✅ Fin prévue:</label>
                                            <span>{formatDate(signalement.date_fin_travaux)}</span>
                                        </div>
                                        {daysRemaining && daysRemaining > 0 && (
                                            <div className="work-item remaining">
                                                <label>⏱️ Temps restant:</label>
                                                <span>{daysRemaining} jours</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {signalement.duree_estimee_jours && (
                                    <div className="work-item">
                                        <label>⏳ Durée estimée:</label>
                                        <span>{signalement.duree_estimee_jours} jours</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Entreprise */}
                    {signalement.nom_entreprise && (
                        <section className="modal-section">
                            <h3>🏢 Entreprise en Charge</h3>
                            <div className="company-info">
                                <div className="company-item">
                                    <label>Nom:</label>
                                    <span>{signalement.nom_entreprise}</span>
                                </div>
                                {signalement.telephone_entreprise && (
                                    <div className="company-item">
                                        <label>📞 Téléphone:</label>
                                        <a href={`tel:${signalement.telephone_entreprise}`}>
                                            {signalement.telephone_entreprise}
                                        </a>
                                    </div>
                                )}
                                {signalement.email_entreprise && (
                                    <div className="company-item">
                                        <label>📧 Email:</label>
                                        <a href={`mailto:${signalement.email_entreprise}`}>
                                            {signalement.email_entreprise}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Manager responsable */}
                    {signalement.nom_manager && (
                        <section className="modal-section">
                            <h3>👨‍💼 Manager Responsable</h3>
                            <p>{signalement.nom_manager}</p>
                        </section>
                    )}

                    {/* Photos */}
                    {signalement.nombre_photos > 0 && signalement.photos_urls && signalement.photos_urls.length > 0 && (
                        <section className="modal-section">
                            <h3>📸 Photos ({signalement.nombre_photos})</h3>
                            <div className="photos-gallery">
                                {signalement.photos_urls.map((photoUrl, index) => (
                                    <div key={index} className="photo-item">
                                        <a 
                                            href={photoUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="photo-link"
                                        >
                                            <img 
                                                src={photoUrl} 
                                                alt={`Photo ${index + 1}`}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23eee" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif"%3EPhoto non disponible%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                        </a>
                                        <span className="photo-num">Photo {index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Métadonnées */}
                    <section className="modal-section metadata">
                        <h3>📊 Métadonnées</h3>
                        <div className="metadata-grid">
                            <div className="metadata-item">
                                <label>Mises à jour:</label>
                                <span>{signalement.nombre_mises_a_jour}</span>
                            </div>
                            <div className="metadata-item">
                                <label>Dernière modification:</label>
                                <span>{formatDate(signalement.date_modification)}</span>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="modal-footer">
                    <button className="btn-close" onClick={onClose}>Fermer</button>
                    <button 
                        className="btn-map"
                        onClick={() => {
                            window.open(
                                `https://www.openstreetmap.org/?mlat=${signalement.latitude}&mlon=${signalement.longitude}&zoom=18`,
                                '_blank'
                            );
                        }}
                    >
                        🗺️ Voir sur OpenStreetMap
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignalementModal;
