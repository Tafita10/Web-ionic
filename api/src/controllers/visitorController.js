'use strict';

const asyncHandler = require('../middlewares/asyncHandler');
const { pool } = require('../config/database');
const logger = require('../config/logger');

/**
 * Récupère les statistiques publiques
 * 
 * RÈGLE MÉTIER AVANCEMENT:
 * - nouveau = 0%
 * - en cours = 50%
 * - terminé = 100%
 * - Avancement global = moyenne de tous les pourcentages
 */
const getStatistiques = asyncHandler(async (req, res) => {
    // Requête avec le calcul correct de l'avancement
    const query = `
        SELECT 
            COUNT(*)::INTEGER AS nombre_total_signalements,
            COUNT(*) FILTER (WHERE s.id_statut = 1)::INTEGER AS nombre_nouveau,
            COUNT(*) FILTER (WHERE s.id_statut = 2)::INTEGER AS nombre_en_cours,
            COUNT(*) FILTER (WHERE s.id_statut = 3)::INTEGER AS nombre_termine,
            COALESCE(SUM(s.surface_endommagee_m2), 0)::DECIMAL AS surface_totale_m2,
            COALESCE(SUM(r.budget_estime_ar), 0)::DECIMAL AS budget_total_estime_ar,
            -- Calcul correct: moyenne basée sur les statuts
            -- nouveau=0%, en_cours=50%, termine=100%
            CASE 
                WHEN COUNT(*) > 0 THEN 
                    ROUND(
                        (
                            (COUNT(*) FILTER (WHERE s.id_statut = 1) * 0) +
                            (COUNT(*) FILTER (WHERE s.id_statut = 2) * 50) +
                            (COUNT(*) FILTER (WHERE s.id_statut = 3) * 100)
                        )::DECIMAL / COUNT(*)::DECIMAL
                    , 2)
                ELSE 0 
            END AS pourcentage_avancement
        FROM signalements s
        LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
        WHERE s.est_visible_public = TRUE
    `;
    
    const result = await pool.query(query);
    const stats = result.rows[0] || {
        nombre_total_signalements: 0,
        nombre_nouveau: 0,
        nombre_en_cours: 0,
        nombre_termine: 0,
        surface_totale_m2: 0,
        budget_total_estime_ar: 0,
        pourcentage_avancement: 0
    };
    
    res.json({
        success: true,
        data: {
            nombre_total: parseInt(stats.nombre_total_signalements) || 0,
            nombre_nouveau: parseInt(stats.nombre_nouveau) || 0,
            nombre_en_cours: parseInt(stats.nombre_en_cours) || 0,
            nombre_termine: parseInt(stats.nombre_termine) || 0,
            surface_totale_m2: parseFloat(stats.surface_totale_m2) || 0,
            budget_total_ar: parseFloat(stats.budget_total_estime_ar) || 0,
            pourcentage_avancement: parseFloat(stats.pourcentage_avancement) || 0
        }
    });
});

/**
 * Récupère tous les signalements publics avec filtres optionnels
 */
const getSignalementsPublics = asyncHandler(async (req, res) => {
    const { statut, gravite, ville, limit = 100, offset = 0 } = req.query;
    
    let query = `
        SELECT 
            s.id_signalement,
            s.titre_signalement,
            s.description_signalement,
            s.date_signalement,
            s.longitude,
            s.latitude,
            st.libelle_statut,
            st.code_couleur,
            v.nom_ville,
            r_route.nom_route,
            s.type_probleme,
            s.niveau_gravite,
            s.surface_endommagee_m2,
            r.budget_estime_ar,
            e.nom_entreprise,
            s.nombre_photos,
            s.photos_urls,
            s.nombre_mises_a_jour,
            u_createur.nom_complet AS nom_createur
        FROM signalements s
        LEFT JOIN statuts_signalement st ON s.id_statut = st.id_statut
        LEFT JOIN villes v ON s.id_ville = v.id_ville
        LEFT JOIN routes r_route ON s.id_route = r_route.id_route
        LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
        LEFT JOIN entreprises_construction e ON r.id_entreprise_assignee = e.id_entreprise
        LEFT JOIN utilisateurs u_createur ON s.id_utilisateur_createur = u_createur.id_utilisateur
        WHERE s.est_visible_public = TRUE
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (statut) {
        query += ` AND st.libelle_statut = $${paramCount}`;
        params.push(statut);
        paramCount++;
    }
    
    if (gravite) {
        query += ` AND s.niveau_gravite = $${paramCount}`;
        params.push(gravite);
        paramCount++;
    }
    
    if (ville) {
        query += ` AND s.id_ville = $${paramCount}`;
        params.push(parseInt(ville));
        paramCount++;
    }
    
    query += ` ORDER BY s.date_signalement DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    // Construire la requête de comptage correctement
    const countQuery = `
        SELECT COUNT(*) as total
        FROM signalements s
        LEFT JOIN statuts_signalement st ON s.id_statut = st.id_statut
        WHERE s.est_visible_public = TRUE
        ${statut ? `AND st.libelle_statut = $1` : ''}
        ${gravite ? `AND s.niveau_gravite = $${statut ? 2 : 1}` : ''}
        ${ville ? `AND s.id_ville = $${(statut ? 1 : 0) + (gravite ? 1 : 0) + 1}` : ''}
    `;
    const countParams = params.slice(0, -2);
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
        success: true,
        data: result.rows,
        total: parseInt(countResult.rows[0]?.total || 0),
        limit: parseInt(limit),
        offset: parseInt(offset)
    });
});

/**
 * Récupère les détails complets d'un signalement
 */
const getSignalementDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT 
            s.id_signalement,
            s.titre_signalement,
            s.description_signalement,
            s.date_signalement,
            s.longitude,
            s.latitude,
            st.libelle_statut,
            st.code_couleur,
            v.nom_ville,
            r_route.nom_route,
            s.adresse_complete,
            s.type_probleme,
            s.niveau_gravite,
            s.surface_endommagee_m2,
            s.profondeur_cm,
            s.longueur_m,
            s.largeur_m,
            r.budget_estime_ar,
            r.budget_reel_ar,
            e.nom_entreprise,
            e.telephone AS telephone_entreprise,
            e.email AS email_entreprise,
            s.nombre_photos,
            s.photos_urls,
            s.nombre_mises_a_jour,
            r.date_debut_travaux,
            r.date_fin_travaux,
            r.duree_estimee_jours,
            u_createur.nom_complet AS nom_createur,
            u_createur.email AS email_createur,
            u_manager.nom_complet AS nom_manager,
            s.date_modification
        FROM signalements s
        LEFT JOIN statuts_signalement st ON s.id_statut = st.id_statut
        LEFT JOIN villes v ON s.id_ville = v.id_ville
        LEFT JOIN routes r_route ON s.id_route = r_route.id_route
        LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
        LEFT JOIN entreprises_construction e ON r.id_entreprise_assignee = e.id_entreprise
        LEFT JOIN utilisateurs u_createur ON s.id_utilisateur_createur = u_createur.id_utilisateur
        LEFT JOIN utilisateurs u_manager ON s.id_manager_responsable = u_manager.id_utilisateur
        WHERE s.id_signalement = $1 AND s.est_visible_public = TRUE
    `;
    
    const result = await pool.query(query, [parseInt(id)]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Signalement non trouvé'
        });
    }
    
    res.json({
        success: true,
        data: result.rows[0]
    });
});

/**
 * Récupère les données optimisées pour la carte
 */
const getMapData = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            s.id_signalement,
            s.titre_signalement,
            s.longitude,
            s.latitude,
            st.code_couleur,
            st.libelle_statut,
            s.niveau_gravite,
            s.date_signalement,
            s.surface_endommagee_m2,
            r.budget_estime_ar,
            e.nom_entreprise,
            s.nombre_photos
        FROM signalements s
        LEFT JOIN statuts_signalement st ON s.id_statut = st.id_statut
        LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
        LEFT JOIN entreprises_construction e ON r.id_entreprise_assignee = e.id_entreprise
        WHERE s.est_visible_public = TRUE
        ORDER BY s.date_signalement DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
        success: true,
        data: result.rows
    });
});

/**
 * Récupère la liste des villes avec statistiques
 */
const getVilles = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            v.id_ville,
            v.nom_ville,
            v.longitude,
            v.latitude,
            v.population,
            COUNT(s.id_signalement) AS nombre_signalements,
            COUNT(s.id_signalement) FILTER (WHERE s.id_statut = 1) AS nombre_nouveau,
            COUNT(s.id_signalement) FILTER (WHERE s.id_statut = 2) AS nombre_en_cours,
            COUNT(s.id_signalement) FILTER (WHERE s.id_statut = 3) AS nombre_termine
        FROM villes v
        LEFT JOIN signalements s ON v.id_ville = s.id_ville AND s.est_visible_public = TRUE
        GROUP BY v.id_ville, v.nom_ville, v.longitude, v.latitude, v.population
        ORDER BY nombre_signalements DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
        success: true,
        data: result.rows
    });
});

module.exports = {
    getStatistiques,
    getSignalementsPublics,
    getSignalementDetail,
    getMapData,
    getVilles
};
