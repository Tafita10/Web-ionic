'use strict';

const createError = require('http-errors');
const { pool } = require('../config/database');

/**
 * ============================================
 * SERVICE REPARATION
 * ============================================
 * Gestion financière et opérationnelle des réparations
 * 
 * PRINCIPE CLÉ :
 *   budget_estime = prix_par_m2 × niveau_reparation × surface_m2
 *   Ce calcul est effectué ICI (backoffice), PAS dans la base de données.
 *   La surface_m2 provient exclusivement de la table signalements.
 * ============================================
 */

/**
 * Calcule le budget estimé selon la formule métier
 * @param {number} prix_par_m2 - Prix forfaitaire par m² (Ariary)
 * @param {number} niveau_reparation - Niveau de complexité (1-10)  
 * @param {number} surface_m2 - Surface endommagée en m² (vient de signalements)
 * @returns {number} Budget estimé en Ariary
 */
const calculerBudgetEstime = (prix_par_m2, niveau_reparation, surface_m2) => {
    const prix = parseFloat(prix_par_m2) || 0;
    const niveau = parseInt(niveau_reparation) || 1;
    const surface = parseFloat(surface_m2) || 0;
    return Math.round(prix * niveau * surface * 100) / 100; // arrondi 2 décimales
};

/**
 * Récupère la surface_m2 d'un signalement
 */
const getSurfaceSignalement = async (idSignalement, client = pool) => {
    const { rows } = await client.query(
        'SELECT surface_endommagee_m2 FROM signalements WHERE id_signalement = $1',
        [idSignalement]
    );
    if (rows.length === 0) throw createError(404, 'Signalement non trouvé');
    return parseFloat(rows[0].surface_endommagee_m2) || 0;
};

/**
 * Crée ou met à jour une réparation (UPSERT)
 * Le budget_estime_ar est calculé automatiquement par le backoffice
 */
const upsertReparation = async (idSignalement, donnees, client = pool) => {
    const {
        niveau_reparation,
        prix_par_m2,
        budget_reel_ar,
        id_entreprise_assignee,
        duree_estimee_jours,
        etat_reparation,
        commentaire
    } = donnees;

    // 1. Récupérer la surface depuis signalements
    const surface_m2 = await getSurfaceSignalement(idSignalement, client);

    // 2. Calcul du budget_estime dans le backoffice
    const niveau = parseInt(niveau_reparation) || 1;
    const prix = parseFloat(prix_par_m2) || 0;
    const budget_estime_ar = calculerBudgetEstime(prix, niveau, surface_m2);

    // 3. UPSERT dans la table reparation
    const query = `
        INSERT INTO reparation (
            id_signalement, niveau_reparation, prix_par_m2, budget_estime_ar,
            budget_reel_ar, id_entreprise_assignee, duree_estimee_jours,
            etat_reparation, commentaire
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'prevue'), $9)
        ON CONFLICT (id_signalement) DO UPDATE SET
            niveau_reparation = COALESCE($2, reparation.niveau_reparation),
            prix_par_m2 = COALESCE($3, reparation.prix_par_m2),
            budget_estime_ar = $4,
            budget_reel_ar = COALESCE($5, reparation.budget_reel_ar),
            id_entreprise_assignee = COALESCE($6, reparation.id_entreprise_assignee),
            duree_estimee_jours = COALESCE($7, reparation.duree_estimee_jours),
            etat_reparation = COALESCE($8, reparation.etat_reparation),
            commentaire = COALESCE($9, reparation.commentaire),
            date_modification = CURRENT_TIMESTAMP
        RETURNING *
    `;

    const { rows } = await client.query(query, [
        parseInt(idSignalement),
        niveau || null,
        prix || null,
        budget_estime_ar,
        budget_reel_ar ? parseFloat(budget_reel_ar) : null,
        id_entreprise_assignee ? parseInt(id_entreprise_assignee) : null,
        duree_estimee_jours ? parseInt(duree_estimee_jours) : null,
        etat_reparation || null,
        commentaire || null
    ]);

    return rows[0];
};

/**
 * Recalcule le budget_estime pour une réparation existante
 * Utile quand la surface du signalement est modifiée
 */
const recalculerBudget = async (idSignalement, client = pool) => {
    // Récupérer les paramètres actuels de la réparation
    const { rows: repRows } = await client.query(
        'SELECT niveau_reparation, prix_par_m2 FROM reparation WHERE id_signalement = $1',
        [idSignalement]
    );

    if (repRows.length === 0) return null; // Pas de réparation associée

    const { niveau_reparation, prix_par_m2 } = repRows[0];
    const surface_m2 = await getSurfaceSignalement(idSignalement, client);
    const budget_estime_ar = calculerBudgetEstime(prix_par_m2, niveau_reparation, surface_m2);

    // Mettre à jour le budget_estime
    const { rows } = await client.query(
        `UPDATE reparation SET budget_estime_ar = $1, date_modification = CURRENT_TIMESTAMP
         WHERE id_signalement = $2 RETURNING *`,
        [budget_estime_ar, idSignalement]
    );

    return rows[0];
};

/**
 * Récupère une réparation par id_signalement
 */
const getReparationBySignalement = async (idSignalement) => {
    const { rows } = await pool.query(
        `SELECT r.*, s.surface_endommagee_m2, s.titre_signalement, e.nom_entreprise
         FROM reparation r
         JOIN signalements s ON r.id_signalement = s.id_signalement
         LEFT JOIN entreprises_construction e ON r.id_entreprise_assignee = e.id_entreprise
         WHERE r.id_signalement = $1`,
        [idSignalement]
    );
    return rows[0] || null;
};

/**
 * Liste toutes les réparations avec détails
 */
const listerReparations = async ({ etat, entreprise, limite = 50, offset = 0 } = {}) => {
    const filtres = [];
    const valeurs = [];

    if (etat) {
        valeurs.push(etat);
        filtres.push(`r.etat_reparation = $${valeurs.length}`);
    }
    if (entreprise) {
        valeurs.push(parseInt(entreprise));
        filtres.push(`r.id_entreprise_assignee = $${valeurs.length}`);
    }

    const where = filtres.length ? `WHERE ${filtres.join(' AND ')}` : '';

    const { rows } = await pool.query(
        `SELECT 
            r.*,
            s.titre_signalement,
            s.surface_endommagee_m2,
            s.niveau_gravite,
            s.type_probleme,
            s.date_signalement,
            st.libelle_statut,
            st.code_couleur,
            v.nom_ville,
            e.nom_entreprise,
            e.telephone AS telephone_entreprise
         FROM reparation r
         JOIN signalements s ON r.id_signalement = s.id_signalement
         LEFT JOIN statuts_signalement st ON s.id_statut = st.id_statut
         LEFT JOIN villes v ON s.id_ville = v.id_ville
         LEFT JOIN entreprises_construction e ON r.id_entreprise_assignee = e.id_entreprise
         ${where}
         ORDER BY r.date_creation DESC
         LIMIT $${valeurs.length + 1} OFFSET $${valeurs.length + 2}`,
        [...valeurs, limite, offset]
    );

    return rows;
};

/**
 * Supprime une réparation
 */
const supprimerReparation = async (idReparation) => {
    const { rowCount } = await pool.query(
        'DELETE FROM reparation WHERE id_reparation = $1',
        [idReparation]
    );
    if (rowCount === 0) throw createError(404, 'Réparation non trouvée');
    return true;
};

module.exports = {
    calculerBudgetEstime,
    getSurfaceSignalement,
    upsertReparation,
    recalculerBudget,
    getReparationBySignalement,
    listerReparations,
    supprimerReparation
};
