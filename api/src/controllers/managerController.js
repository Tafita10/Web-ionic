'use strict';

const asyncHandler = require('../middlewares/asyncHandler');
const { pool } = require('../config/database');
const logger = require('../config/logger');
const reparationService = require('../services/reparationService');

/**
 * ============================================
 * CONTRÔLEUR MANAGER - GESTION DES SIGNALEMENTS
 * ============================================
 * 
 * Fonctionnalités:
 * - Statistiques détaillées avec délai moyen
 * - Changement de statut avec mise à jour des dates
 * - Calcul automatique de l'avancement
 * 
 * Règles métier:
 * - nouveau = 0%
 * - en cours = 50%
 * - terminé = 100%
 * - Avancement global = moyenne des pourcentages
 * ============================================
 */

/**
 * Récupère les statistiques complètes pour le manager
 * Inclut le délai moyen de traitement
 */
const getStatistiquesManager = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            -- Comptages par statut
            COUNT(*)::INTEGER AS nombre_total_travaux,
            COUNT(*) FILTER (WHERE s.id_statut = 1)::INTEGER AS travaux_nouveaux,
            COUNT(*) FILTER (WHERE s.id_statut = 2)::INTEGER AS travaux_en_cours,
            COUNT(*) FILTER (WHERE s.id_statut = 3)::INTEGER AS travaux_termines,
            COUNT(*) FILTER (WHERE s.id_statut = 4)::INTEGER AS travaux_annules,
            
            -- Surface totale
            COALESCE(SUM(s.surface_endommagee_m2), 0)::DECIMAL AS surface_totale_m2,
            
            -- Budgets (depuis la table reparation)
            COALESCE(SUM(r.budget_estime_ar), 0)::DECIMAL AS budget_total_estime_ar,
            COALESCE(SUM(r.budget_reel_ar), 0)::DECIMAL AS budget_total_reel_ar,
            
            -- Avancement global (moyenne des statuts: nouveau=0%, en_cours=50%, termine=100%)
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
            END AS pourcentage_avancement_global,
            
            -- Délai moyen de traitement (jours)
            COALESCE(
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (r.date_fin_travaux - s.date_signalement)) / 86400
                    ) FILTER (WHERE s.id_statut = 3 AND r.date_fin_travaux IS NOT NULL)
                , 1)
            , 0)::DECIMAL AS delai_moyen_traitement_jours,
            
            -- Délai moyen avant démarrage (jours)
            COALESCE(
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (r.date_debut_travaux - s.date_signalement)) / 86400
                    ) FILTER (WHERE r.date_debut_travaux IS NOT NULL)
                , 1)
            , 0)::DECIMAL AS delai_moyen_demarrage_jours,
            
            -- Durée moyenne des travaux (jours)
            COALESCE(
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (r.date_fin_travaux - r.date_debut_travaux)) / 86400
                    ) FILTER (WHERE s.id_statut = 3 AND r.date_fin_travaux IS NOT NULL AND r.date_debut_travaux IS NOT NULL)
                , 1)
            , 0)::DECIMAL AS duree_moyenne_travaux_jours
            
        FROM signalements s
        LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
    `;
    
    const result = await pool.query(query);
    const stats = result.rows[0];
    
    res.json({
        success: true,
        data: {
            // Comptages
            nombre_total_travaux: parseInt(stats.nombre_total_travaux) || 0,
            travaux_nouveaux: parseInt(stats.travaux_nouveaux) || 0,
            travaux_en_cours: parseInt(stats.travaux_en_cours) || 0,
            travaux_termines: parseInt(stats.travaux_termines) || 0,
            travaux_annules: parseInt(stats.travaux_annules) || 0,
            
            // Surface et budgets
            surface_totale_m2: parseFloat(stats.surface_totale_m2) || 0,
            budget_total_estime_ar: parseFloat(stats.budget_total_estime_ar) || 0,
            budget_total_reel_ar: parseFloat(stats.budget_total_reel_ar) || 0,
            
            // Avancement
            pourcentage_avancement_global: parseFloat(stats.pourcentage_avancement_global) || 0,
            
            // Délais
            delai_moyen_traitement_jours: parseFloat(stats.delai_moyen_traitement_jours) || 0,
            delai_moyen_demarrage_jours: parseFloat(stats.delai_moyen_demarrage_jours) || 0,
            duree_moyenne_travaux_jours: parseFloat(stats.duree_moyenne_travaux_jours) || 0
        }
    });
});

/**
 * Récupère tous les signalements avec avancement pour le manager
 */
const getAllSignalements = asyncHandler(async (req, res) => {
    const { statut, gravite, ville, entreprise, limit = 100, offset = 0 } = req.query;
    
    let query = `
        SELECT 
            s.id_signalement,
            s.titre_signalement,
            s.description_signalement,
            s.date_signalement,
            s.longitude,
            s.latitude,
            st.id_statut,
            st.libelle_statut,
            st.code_couleur,
            
            -- Avancement automatique
            CASE st.id_statut
                WHEN 1 THEN 0
                WHEN 2 THEN 50
                WHEN 3 THEN 100
                ELSE 0
            END AS pourcentage_avancement,
            
            v.id_ville,
            v.nom_ville,
            r_route.nom_route,
            s.adresse_complete,
            s.type_probleme,
            s.niveau_gravite,
            s.surface_endommagee_m2,
            s.profondeur_cm,
            s.longueur_m,
            s.largeur_m,
            r.niveau_reparation,
            r.prix_par_m2,
            r.budget_estime_ar,
            r.budget_reel_ar,
            r.etat_reparation,
            e.id_entreprise,
            e.nom_entreprise,
            e.telephone AS telephone_entreprise,
            
            -- Dates par étape
            s.date_signalement AS date_nouveau,
            r.date_debut_travaux AS date_en_cours,
            r.date_fin_travaux AS date_termine,
            r.duree_estimee_jours,
            
            -- Délais calculés
            CASE 
                WHEN r.date_debut_travaux IS NOT NULL THEN
                    ROUND(EXTRACT(EPOCH FROM (r.date_debut_travaux - s.date_signalement)) / 86400, 1)
                ELSE NULL
            END AS delai_avant_demarrage_jours,
            
            CASE 
                WHEN r.date_fin_travaux IS NOT NULL AND r.date_debut_travaux IS NOT NULL THEN
                    ROUND(EXTRACT(EPOCH FROM (r.date_fin_travaux - r.date_debut_travaux)) / 86400, 1)
                ELSE NULL
            END AS duree_travaux_jours,
            
            CASE 
                WHEN r.date_fin_travaux IS NOT NULL THEN
                    ROUND(EXTRACT(EPOCH FROM (r.date_fin_travaux - s.date_signalement)) / 86400, 1)
                ELSE NULL
            END AS delai_total_traitement_jours,
            
            -- Photos
            s.photos_urls,
            s.nombre_photos,
            
            -- Utilisateurs
            s.id_utilisateur_createur,
            u_createur.nom_complet AS nom_createur,
            s.id_manager_responsable,
            u_manager.nom_complet AS nom_manager,
            
            -- Métadonnées
            s.nombre_mises_a_jour,
            s.commentaire_interne,
            s.est_visible_public,
            s.est_synchronise,
            s.date_modification
        FROM signalements s
        LEFT JOIN statuts_signalement st ON s.id_statut = st.id_statut
        LEFT JOIN villes v ON s.id_ville = v.id_ville
        LEFT JOIN routes r_route ON s.id_route = r_route.id_route
        LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
        LEFT JOIN entreprises_construction e ON r.id_entreprise_assignee = e.id_entreprise
        LEFT JOIN utilisateurs u_createur ON s.id_utilisateur_createur = u_createur.id_utilisateur
        LEFT JOIN utilisateurs u_manager ON s.id_manager_responsable = u_manager.id_utilisateur
        WHERE 1=1
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
    
    if (entreprise) {
        query += ` AND r.id_entreprise_assignee = $${paramCount}`;
        params.push(parseInt(entreprise));
        paramCount++;
    }
    
    query += ` ORDER BY s.date_signalement DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    // Compte total
    const countQuery = `SELECT COUNT(*) as total FROM signalements s 
        LEFT JOIN statuts_signalement st ON s.id_statut = st.id_statut
        WHERE 1=1`;
    const countResult = await pool.query(countQuery);
    
    res.json({
        success: true,
        data: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
    });
});

/**
 * Change le statut d'un signalement avec mise à jour automatique des dates
 * 
 * Règles:
 * - nouveau → en cours: remplir date_debut_travaux
 * - en cours → terminé: remplir date_fin_travaux
 */
const changerStatut = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { id_nouveau_statut, commentaire } = req.body;
    const id_manager = req.user?.id_utilisateur || 1; // ID du manager connecté
    
    // Valider le nouveau statut
    if (!id_nouveau_statut || ![1, 2, 3, 4].includes(parseInt(id_nouveau_statut))) {
        return res.status(400).json({
            success: false,
            message: 'Statut invalide. Valeurs acceptées: 1 (Nouveau), 2 (En cours), 3 (Terminé), 4 (Annulé)'
        });
    }
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Récupérer l'ancien statut et les données de réparation
        const selectQuery = `
            SELECT s.id_statut, r.date_debut_travaux, r.date_fin_travaux, r.id_reparation
            FROM signalements s
            LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
            WHERE s.id_signalement = $1
        `;
        const selectResult = await client.query(selectQuery, [parseInt(id)]);
        
        if (selectResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Signalement non trouvé'
            });
        }
        
        const ancien = selectResult.rows[0];
        const nouveauStatut = parseInt(id_nouveau_statut);
        
        // Mettre à jour le statut du signalement
        let updateQuery = `
            UPDATE signalements SET
                id_statut = $1,
                id_manager_responsable = $2,
                date_modification = CURRENT_TIMESTAMP
            WHERE id_signalement = $3 RETURNING *
        `;
        const updateParams = [nouveauStatut, id_manager, parseInt(id)];
        const updateResult = await client.query(updateQuery, updateParams);
        
        // Mettre à jour les dates dans la table reparation (si elle existe)
        if (ancien.id_reparation) {
            if (nouveauStatut === 2 && !ancien.date_debut_travaux) {
                await client.query(
                    `UPDATE reparation SET date_debut_travaux = CURRENT_TIMESTAMP, etat_reparation = 'en_cours' WHERE id_signalement = $1`,
                    [parseInt(id)]
                );
            }
            if (nouveauStatut === 3 && !ancien.date_fin_travaux) {
                await client.query(
                    `UPDATE reparation SET date_fin_travaux = CURRENT_TIMESTAMP, etat_reparation = 'terminee' WHERE id_signalement = $1`,
                    [parseInt(id)]
                );
            }
        }
        
        // Logger le changement dans historique_statuts
        const historiqueQuery = `
            INSERT INTO historique_statuts (
                id_signalement,
                id_statut_ancien,
                id_statut_nouveau,
                id_utilisateur_modificateur,
                commentaire_changement
            ) VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(historiqueQuery, [
            parseInt(id),
            ancien.id_statut,
            nouveauStatut,
            id_manager,
            commentaire || 'Changement de statut par le manager'
        ]);
        
        await client.query('COMMIT');
        
        const signalement = updateResult.rows[0];
        
        // Calculer l'avancement
        const avancement = nouveauStatut === 1 ? 0 : (nouveauStatut === 2 ? 50 : (nouveauStatut === 3 ? 100 : 0));
        
        logger.info(`Statut changé: Signalement ${id}, ${ancien.id_statut} → ${nouveauStatut}`);
        
        res.json({
            success: true,
            message: 'Statut mis à jour avec succès',
            data: {
                id_signalement: signalement.id_signalement,
                ancien_statut: ancien.id_statut,
                nouveau_statut: nouveauStatut,
                pourcentage_avancement: avancement,
                date_debut_travaux: signalement.date_debut_travaux,
                date_fin_travaux: signalement.date_fin_travaux
            }
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

/**
 * Met à jour les données techniques d'un signalement et sa réparation
 * Les champs budget/entreprise sont dans la table reparation
 * budget_estime = prix_par_m2 × niveau × surface_m2 (calculé par le backoffice)
 */
const enrichirSignalement = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        surface_endommagee_m2,
        profondeur_cm,
        longueur_m,
        largeur_m,
        niveau_reparation,
        prix_par_m2,
        budget_reel_ar,
        id_entreprise_assignee,
        duree_estimee_jours,
        commentaire_interne,
        etat_reparation
    } = req.body;
    
    const id_manager = req.user?.id_utilisateur || 1;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. Mettre à jour les données techniques du signalement
        const querySignalement = `
            UPDATE signalements SET
                surface_endommagee_m2 = COALESCE($1, surface_endommagee_m2),
                profondeur_cm = COALESCE($2, profondeur_cm),
                longueur_m = COALESCE($3, longueur_m),
                largeur_m = COALESCE($4, largeur_m),
                commentaire_interne = COALESCE($5, commentaire_interne),
                id_manager_responsable = $6,
                nombre_mises_a_jour = nombre_mises_a_jour + 1,
                date_modification = CURRENT_TIMESTAMP
            WHERE id_signalement = $7
            RETURNING *
        `;
        
        const resultSignalement = await client.query(querySignalement, [
            surface_endommagee_m2 ? parseFloat(surface_endommagee_m2) : null,
            profondeur_cm ? parseFloat(profondeur_cm) : null,
            longueur_m ? parseFloat(longueur_m) : null,
            largeur_m ? parseFloat(largeur_m) : null,
            commentaire_interne || null,
            id_manager,
            parseInt(id)
        ]);
        
        if (resultSignalement.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Signalement non trouvé'
            });
        }
        
        // 2. Créer ou mettre à jour la réparation (UPSERT)
        // Le budget_estime est calculé ICI par le backoffice, PAS par la BDD
        if (niveau_reparation || prix_par_m2 || id_entreprise_assignee || budget_reel_ar || duree_estimee_jours || etat_reparation) {
            await reparationService.upsertReparation(parseInt(id), {
                niveau_reparation,
                prix_par_m2,
                budget_reel_ar,
                id_entreprise_assignee,
                duree_estimee_jours,
                etat_reparation,
                commentaire: commentaire_interne
            }, client);
        } else if (surface_endommagee_m2) {
            // Si seule la surface change, recalculer le budget de la réparation existante
            await reparationService.recalculerBudget(parseInt(id), client);
        }
        
        await client.query('COMMIT');
        
        // Récupérer les données complètes
        const resultComplet = await pool.query(`
            SELECT s.*, r.niveau_reparation, r.prix_par_m2, r.budget_estime_ar, r.budget_reel_ar, 
                   r.etat_reparation, r.date_debut_travaux, r.date_fin_travaux, r.duree_estimee_jours,
                   e.nom_entreprise
            FROM signalements s
            LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
            LEFT JOIN entreprises_construction e ON r.id_entreprise_assignee = e.id_entreprise
            WHERE s.id_signalement = $1
        `, [parseInt(id)]);
        
        logger.info(`Signalement enrichi: ${id}`);
        
        res.json({
            success: true,
            message: 'Signalement enrichi avec succès',
            data: resultComplet.rows[0]
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
});

/**
 * Récupère l'historique des changements de statut d'un signalement
 */
const getHistoriqueStatuts = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT 
            h.id_historique,
            h.date_changement,
            st_ancien.libelle_statut AS statut_ancien,
            st_ancien.code_couleur AS couleur_ancien,
            st_nouveau.libelle_statut AS statut_nouveau,
            st_nouveau.code_couleur AS couleur_nouveau,
            u.nom_complet AS nom_modificateur,
            h.commentaire_changement
        FROM historique_statuts h
        LEFT JOIN statuts_signalement st_ancien ON h.id_statut_ancien = st_ancien.id_statut
        JOIN statuts_signalement st_nouveau ON h.id_statut_nouveau = st_nouveau.id_statut
        JOIN utilisateurs u ON h.id_utilisateur_modificateur = u.id_utilisateur
        WHERE h.id_signalement = $1
        ORDER BY h.date_changement DESC
    `;
    
    const result = await pool.query(query, [parseInt(id)]);
    
    res.json({
        success: true,
        data: result.rows
    });
});

/**
 * Récupère la liste des entreprises
 */
const getEntreprises = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            id_entreprise,
            nom_entreprise,
            numero_registre,
            telephone,
            email,
            specialites,
            nombre_projets_realises,
            note_evaluation,
            est_certifiee
        FROM entreprises_construction
        ORDER BY nom_entreprise ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
        success: true,
        data: result.rows
    });
});

/**
 * Récupère les statistiques par entreprise
 */
const getStatistiquesParEntreprise = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            e.id_entreprise,
            e.nom_entreprise,
            COUNT(s.id_signalement)::INTEGER AS nombre_signalements,
            COUNT(*) FILTER (WHERE s.id_statut = 3)::INTEGER AS signalements_termines,
            COALESCE(SUM(s.surface_endommagee_m2), 0)::DECIMAL AS surface_totale_m2,
            COALESCE(SUM(r.budget_estime_ar), 0)::DECIMAL AS budget_total_ar,
            COALESCE(
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (r.date_fin_travaux - s.date_signalement)) / 86400
                    ) FILTER (WHERE s.id_statut = 3 AND r.date_fin_travaux IS NOT NULL)
                , 1)
            , 0)::DECIMAL AS delai_moyen_traitement_jours
        FROM entreprises_construction e
        LEFT JOIN reparation r ON e.id_entreprise = r.id_entreprise_assignee
        LEFT JOIN signalements s ON r.id_signalement = s.id_signalement
        GROUP BY e.id_entreprise, e.nom_entreprise
        ORDER BY nombre_signalements DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
        success: true,
        data: result.rows
    });
});

/**
 * Statistiques des délais de traitement par type de problème
 * Pour le tableau de bord Manager
 */
const getDelaisParType = asyncHandler(async (req, res) => {
    const query = `
        SELECT 
            COALESCE(s.type_probleme, 'Non spécifié') AS type_probleme,
            COUNT(*) FILTER (WHERE s.id_statut = 3)::INTEGER AS nombre,
            COALESCE(
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (r.date_fin_travaux - s.date_signalement)) / 86400
                    ) FILTER (WHERE s.id_statut = 3 AND r.date_fin_travaux IS NOT NULL)
                , 1)
            , 0)::DECIMAL AS delai_total,
            COALESCE(
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (r.date_debut_travaux - s.date_signalement)) / 86400
                    ) FILTER (WHERE r.date_debut_travaux IS NOT NULL)
                , 1)
            , 0)::DECIMAL AS delai_prise_charge,
            COALESCE(
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (r.date_fin_travaux - r.date_debut_travaux)) / 86400
                    ) FILTER (WHERE s.id_statut = 3 AND r.date_fin_travaux IS NOT NULL AND r.date_debut_travaux IS NOT NULL)
                , 1)
            , 0)::DECIMAL AS duree_travaux
        FROM signalements s
        LEFT JOIN reparation r ON s.id_signalement = r.id_signalement
        WHERE s.type_probleme IS NOT NULL
        GROUP BY s.type_probleme
        HAVING COUNT(*) FILTER (WHERE s.id_statut = 3) > 0
        ORDER BY delai_total ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
        success: true,
        data: result.rows.map(row => ({
            type_probleme: row.type_probleme,
            nombre: parseInt(row.nombre),
            delai_total: parseFloat(row.delai_total),
            delai_prise_charge: parseFloat(row.delai_prise_charge),
            duree_travaux: parseFloat(row.duree_travaux)
        }))
    });
});

/**
 * Récupère toutes les réparations avec détails
 */
const getReparations = asyncHandler(async (req, res) => {
    const { etat, entreprise, limit = 50, offset = 0 } = req.query;
    
    const reparations = await reparationService.listerReparations({
        etat,
        entreprise,
        limite: parseInt(limit),
        offset: parseInt(offset)
    });
    
    res.json({
        success: true,
        data: reparations
    });
});

/**
 * Récupère une réparation par id_signalement
 */
const getReparationBySignalement = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const reparation = await reparationService.getReparationBySignalement(parseInt(id));
    
    if (!reparation) {
        return res.status(404).json({
            success: false,
            message: 'Aucune réparation trouvée pour ce signalement'
        });
    }
    
    res.json({
        success: true,
        data: reparation
    });
});

/**
 * Crée ou met à jour une réparation pour un signalement
 * Le budget_estime est calculé par le backoffice : prix_par_m2 × niveau × surface_m2
 */
const upsertReparation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        niveau_reparation,
        prix_par_m2,
        budget_reel_ar,
        id_entreprise_assignee,
        duree_estimee_jours,
        etat_reparation,
        commentaire
    } = req.body;
    
    if (!niveau_reparation && !prix_par_m2) {
        return res.status(400).json({
            success: false,
            message: 'niveau_reparation et/ou prix_par_m2 sont requis'
        });
    }
    
    const reparation = await reparationService.upsertReparation(parseInt(id), {
        niveau_reparation,
        prix_par_m2,
        budget_reel_ar,
        id_entreprise_assignee,
        duree_estimee_jours,
        etat_reparation,
        commentaire
    });
    
    // Récupérer avec les détails complets
    const resultat = await reparationService.getReparationBySignalement(parseInt(id));
    
    logger.info(`Réparation upsert pour signalement ${id}: budget_estime=${reparation.budget_estime_ar} Ar`);
    
    res.json({
        success: true,
        message: 'Réparation enregistrée avec succès',
        data: resultat
    });
});

/**
 * Crée une nouvelle réparation (POST /reparations)
 */
const createReparation = asyncHandler(async (req, res) => {
    const {
        id_signalement,
        niveau_reparation,
        prix_par_m2,
        budget_estime_ar,
        id_entreprise_assignee,
        duree_estimee_jours,
        commentaire
    } = req.body;
    
    if (!id_signalement || !niveau_reparation || !prix_par_m2) {
        return res.status(400).json({
            success: false,
            message: 'id_signalement, niveau_reparation et prix_par_m2 sont requis'
        });
    }
    
    const reparation = await reparationService.upsertReparation({
        id_signalement,
        niveau_reparation,
        prix_par_m2,
        id_entreprise_assignee,
        duree_estimee_jours,
        etat_reparation: 'prevue',
        commentaire
    });
    
    logger.info(`Réparation créée pour signalement ${id_signalement}: budget_estime=${reparation.budget_estime_ar} Ar`);
    
    res.status(201).json({
        success: true,
        message: 'Réparation créée avec succès',
        data: reparation
    });
});

/**
 * Met à jour une réparation par ID (PUT /reparations/:idReparation)
 */
const updateReparation = asyncHandler(async (req, res) => {
    const { idReparation } = req.params;
    const updateData = req.body;
    
    // Construction de la requête de mise à jour
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    
    const allowedFields = ['niveau_reparation', 'prix_par_m2', 'etat_reparation', 'budget_reel_ar', 
                          'id_entreprise_assignee', 'duree_estimee_jours', 'commentaire',
                          'date_debut_travaux', 'date_fin_travaux'];
    
    for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
            setClauses.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }
    
    // Si changement d'état, mettre à jour les dates
    if (updateData.etat_reparation === 'en_cours' && !updateData.date_debut_travaux) {
        setClauses.push(`date_debut_travaux = CURRENT_TIMESTAMP`);
    }
    if (updateData.etat_reparation === 'terminee' && !updateData.date_fin_travaux) {
        setClauses.push(`date_fin_travaux = CURRENT_TIMESTAMP`);
    }
    
    if (setClauses.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Aucun champ à mettre à jour'
        });
    }
    
    values.push(idReparation);
    const query = `UPDATE reparation SET ${setClauses.join(', ')} WHERE id_reparation = $${paramIndex} RETURNING *`;
    
    const pool = require('../config/database');
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Réparation non trouvée'
        });
    }
    
    logger.info(`Réparation ${idReparation} mise à jour`);
    
    res.json({
        success: true,
        message: 'Réparation mise à jour avec succès',
        data: result.rows[0]
    });
});

/**
 * Supprime une réparation
 */
const deleteReparation = asyncHandler(async (req, res) => {
    const { idReparation } = req.params;
    
    await reparationService.supprimerReparation(parseInt(idReparation));
    
    logger.info(`Réparation supprimée: ${idReparation}`);
    
    res.json({
        success: true,
        message: 'Réparation supprimée avec succès'
    });
});

module.exports = {
    getStatistiquesManager,
    getAllSignalements,
    changerStatut,
    enrichirSignalement,
    getHistoriqueStatuts,
    getEntreprises,
    getStatistiquesParEntreprise,
    getDelaisParType,
    getReparations,
    getReparationBySignalement,
    upsertReparation,
    createReparation,
    updateReparation,
    deleteReparation
};
