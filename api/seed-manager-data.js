/**
 * Script pour ajouter des données de test pour le Manager
 * - Signalements avec différents statuts (Nouveau, En cours, Terminé)
 * - Dates d'avancement pour chaque étape
 * - Données pour calculer les statistiques de délai
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  database: 'webrojo_db',
  user: 'webrojo_user',
  password: 'webrojo_password_2026'
});

// Données de signalements variées
const signalements = [
  // ===== SIGNALEMENTS TERMINÉS (id_statut = 3) =====
  {
    titre: 'Nid de poule réparé - Avenue de l\'Indépendance',
    description: 'Nid de poule de 2m² réparé avec succès. Travaux de goudronnage effectués.',
    longitude: 47.5205,
    latitude: -18.9137,
    id_statut: 3, // Terminé
    type_probleme: 'Nid de poule',
    niveau_gravite: 'Critique',
    surface_m2: 2.5,
    budget_estime: 850000,
    budget_reel: 920000,
    id_entreprise: 1,
    date_signalement: '2025-12-01 08:30:00',
    date_debut_travaux: '2025-12-10 07:00:00',
    date_fin_travaux: '2025-12-15 17:00:00',
    duree_estimee: 7,
    photos: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400']
  },
  {
    titre: 'Fissure route Analakely réparée',
    description: 'Grande fissure longitudinale colmatée. Revêtement renforcé.',
    longitude: 47.5185,
    latitude: -18.9105,
    id_statut: 3,
    type_probleme: 'Fissure',
    niveau_gravite: 'Moyen',
    surface_m2: 8.0,
    budget_estime: 1200000,
    budget_reel: 1150000,
    id_entreprise: 2,
    date_signalement: '2025-11-15 09:00:00',
    date_debut_travaux: '2025-11-20 08:00:00',
    date_fin_travaux: '2025-11-28 16:00:00',
    duree_estimee: 10,
    photos: ['https://images.unsplash.com/photo-1574170609303-6c7f6aa1f94f?w=400']
  },
  {
    titre: 'Effondrement partiel corrigé - Rue Rainitovo',
    description: 'Zone effondrée stabilisée et recouverte. Drainage amélioré.',
    longitude: 47.5230,
    latitude: -18.9180,
    id_statut: 3,
    type_probleme: 'Effondrement',
    niveau_gravite: 'Critique',
    surface_m2: 15.0,
    budget_estime: 5500000,
    budget_reel: 6200000,
    id_entreprise: 3,
    date_signalement: '2025-10-20 14:00:00',
    date_debut_travaux: '2025-10-25 07:00:00',
    date_fin_travaux: '2025-11-10 18:00:00',
    duree_estimee: 20,
    photos: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400', 'https://images.unsplash.com/photo-1590496793907-51d60c2f1888?w=400']
  },
  {
    titre: 'Revêtement usé remplacé - Boulevard Ratsimandrava',
    description: 'Section de 50m de route entièrement refaite.',
    longitude: 47.5150,
    latitude: -18.9050,
    id_statut: 3,
    type_probleme: 'Usure revêtement',
    niveau_gravite: 'Moyen',
    surface_m2: 200.0,
    budget_estime: 25000000,
    budget_reel: 24500000,
    id_entreprise: 4,
    date_signalement: '2025-09-01 10:00:00',
    date_debut_travaux: '2025-09-15 06:00:00',
    date_fin_travaux: '2025-10-15 17:00:00',
    duree_estimee: 35,
    photos: []
  },
  {
    titre: 'Trous multiples comblés - Rue Razafindrabe',
    description: 'Série de 5 trous comblés avec béton bitumineux.',
    longitude: 47.5280,
    latitude: -18.9200,
    id_statut: 3,
    type_probleme: 'Nid de poule',
    niveau_gravite: 'Critique',
    surface_m2: 6.5,
    budget_estime: 1800000,
    budget_reel: 1750000,
    id_entreprise: 1,
    date_signalement: '2025-12-20 11:00:00',
    date_debut_travaux: '2025-12-28 08:00:00',
    date_fin_travaux: '2026-01-05 16:00:00',
    duree_estimee: 10,
    photos: ['https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400']
  },

  // ===== SIGNALEMENTS EN COURS (id_statut = 2) =====
  {
    titre: 'Réparation en cours - Avenue Grandidier',
    description: 'Travaux de réparation d\'une large zone dégradée. Équipe sur place.',
    longitude: 47.5170,
    latitude: -18.9085,
    id_statut: 2, // En cours
    type_probleme: 'Dégradation générale',
    niveau_gravite: 'Critique',
    surface_m2: 35.0,
    budget_estime: 8500000,
    budget_reel: null,
    id_entreprise: 2,
    date_signalement: '2026-01-10 08:00:00',
    date_debut_travaux: '2026-01-20 07:00:00',
    date_fin_travaux: null,
    date_echeance: '2026-02-15 18:00:00',
    duree_estimee: 25,
    photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400']
  },
  {
    titre: 'Rebouchage nids de poule - Rue Rabearivelo',
    description: 'Intervention en cours sur 3 nids de poule profonds.',
    longitude: 47.5220,
    latitude: -18.9155,
    id_statut: 2,
    type_probleme: 'Nid de poule',
    niveau_gravite: 'Critique',
    surface_m2: 4.2,
    budget_estime: 1200000,
    budget_reel: null,
    id_entreprise: 3,
    date_signalement: '2026-01-15 14:30:00',
    date_debut_travaux: '2026-01-25 08:00:00',
    date_fin_travaux: null,
    date_echeance: '2026-02-05 18:00:00',
    duree_estimee: 12,
    photos: ['https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=400']
  },
  {
    titre: 'Colmatage fissures - Route d\'Ivato',
    description: 'Traitement des fissures avec résine spéciale en cours.',
    longitude: 47.4850,
    latitude: -18.8650,
    id_statut: 2,
    type_probleme: 'Fissure',
    niveau_gravite: 'Moyen',
    surface_m2: 12.0,
    budget_estime: 2800000,
    budget_reel: null,
    id_entreprise: 4,
    date_signalement: '2026-01-08 09:00:00',
    date_debut_travaux: '2026-01-22 07:30:00',
    date_fin_travaux: null,
    date_echeance: '2026-02-10 17:00:00',
    duree_estimee: 18,
    photos: []
  },
  {
    titre: 'Renforcement chaussée - Tsaralalàna',
    description: 'Travaux de renforcement de la structure de chaussée.',
    longitude: 47.5195,
    latitude: -18.9025,
    id_statut: 2,
    type_probleme: 'Affaissement',
    niveau_gravite: 'Critique',
    surface_m2: 45.0,
    budget_estime: 12000000,
    budget_reel: null,
    id_entreprise: 1,
    date_signalement: '2026-01-05 11:00:00',
    date_debut_travaux: '2026-01-18 06:30:00',
    date_fin_travaux: null,
    date_echeance: '2026-02-28 18:00:00',
    duree_estimee: 40,
    photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400']
  },

  // ===== SIGNALEMENTS NOUVEAUX (id_statut = 1) =====
  {
    titre: 'Nouveau signalement - Trou dangereux Ambohijatovo',
    description: 'Trou profond apparu après les pluies. Danger pour les véhicules.',
    longitude: 47.5245,
    latitude: -18.9165,
    id_statut: 1, // Nouveau
    type_probleme: 'Nid de poule',
    niveau_gravite: 'Critique',
    surface_m2: 3.0,
    budget_estime: 950000,
    budget_reel: null,
    id_entreprise: null,
    date_signalement: '2026-02-01 16:00:00',
    date_debut_travaux: null,
    date_fin_travaux: null,
    duree_estimee: 8,
    photos: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400']
  },
  {
    titre: 'Fissure élargie - Rue Andrianampoinimerina',
    description: 'Fissure qui s\'élargit progressivement. À traiter rapidement.',
    longitude: 47.5160,
    latitude: -18.9070,
    id_statut: 1,
    type_probleme: 'Fissure',
    niveau_gravite: 'Critique',
    surface_m2: 5.5,
    budget_estime: 1500000,
    budget_reel: null,
    id_entreprise: null,
    date_signalement: '2026-02-02 10:30:00',
    date_debut_travaux: null,
    date_fin_travaux: null,
    duree_estimee: 10,
    photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400']
  },
  {
    titre: 'Affaissement route Mahamasina',
    description: 'Zone d\'affaissement détectée près du stade. Circulation perturbée.',
    longitude: 47.5130,
    latitude: -18.9120,
    id_statut: 1,
    type_probleme: 'Affaissement',
    niveau_gravite: 'Moyen',
    surface_m2: 18.0,
    budget_estime: 4200000,
    budget_reel: null,
    id_entreprise: null,
    date_signalement: '2026-02-03 08:00:00',
    date_debut_travaux: null,
    date_fin_travaux: null,
    duree_estimee: 15,
    photos: []
  },
  {
    titre: 'Nids de poule multiples - Ankadifotsy',
    description: 'Série de petits trous sur 100m de route.',
    longitude: 47.5300,
    latitude: -18.9250,
    id_statut: 1,
    type_probleme: 'Nid de poule',
    niveau_gravite: 'Moyen',
    surface_m2: 4.0,
    budget_estime: 1100000,
    budget_reel: null,
    id_entreprise: null,
    date_signalement: '2026-01-30 15:00:00',
    date_debut_travaux: null,
    date_fin_travaux: null,
    duree_estimee: 6,
    photos: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400']
  },
  {
    titre: 'Dégradation accotement - Route Digue',
    description: 'Accotement dégradé causant des débordements sur la chaussée.',
    longitude: 47.5080,
    latitude: -18.8980,
    id_statut: 1,
    type_probleme: 'Dégradation générale',
    niveau_gravite: 'Faible',
    surface_m2: 25.0,
    budget_estime: 3500000,
    budget_reel: null,
    id_entreprise: null,
    date_signalement: '2026-01-28 12:00:00',
    date_debut_travaux: null,
    date_fin_travaux: null,
    duree_estimee: 12,
    photos: []
  },
  {
    titre: 'Revêtement décollé - Rue Ramanantsoa',
    description: 'Couche de bitume se décollant sur environ 10m².',
    longitude: 47.5210,
    latitude: -18.9095,
    id_statut: 1,
    type_probleme: 'Usure revêtement',
    niveau_gravite: 'Moyen',
    surface_m2: 10.0,
    budget_estime: 2200000,
    budget_reel: null,
    id_entreprise: null,
    date_signalement: '2026-02-01 09:30:00',
    date_debut_travaux: null,
    date_fin_travaux: null,
    duree_estimee: 8,
    photos: ['https://images.unsplash.com/photo-1574170609303-6c7f6aa1f94f?w=400']
  }
];

async function seedData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Début de l\'insertion des données Manager...\n');
    
    // Supprimer les anciens signalements de test (garder les originaux 1-6)
    await client.query('DELETE FROM signalements WHERE id_signalement > 6');
    console.log('🗑️  Anciens signalements de test supprimés\n');
    
    let inserted = 0;
    
    for (const s of signalements) {
      const query = `
        INSERT INTO signalements (
          titre_signalement, description_signalement, 
          id_ville, longitude, latitude,
          id_statut, type_probleme, niveau_gravite,
          surface_endommagee_m2, budget_estime_ar, budget_reel_ar,
          id_entreprise_assignee, date_signalement,
          date_debut_travaux, date_fin_travaux, date_echeance_prevue,
          duree_estimee_jours, photos_urls,
          id_utilisateur_createur, id_manager_responsable,
          est_visible_public
        ) VALUES (
          $1, $2, 1, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 6, true
        ) RETURNING id_signalement, titre_signalement, id_statut
      `;
      
      const values = [
        s.titre, s.description,
        s.longitude, s.latitude,
        s.id_statut, s.type_probleme, s.niveau_gravite,
        s.surface_m2, s.budget_estime, s.budget_reel,
        s.id_entreprise, s.date_signalement,
        s.date_debut_travaux, s.date_fin_travaux, s.date_echeance || null,
        s.duree_estimee, s.photos.length > 0 ? s.photos : null,
        6 // id_utilisateur_createur = Manager Admin
      ];
      
      const result = await client.query(query, values);
      const row = result.rows[0];
      
      const statuts = { 1: '🆕 Nouveau', 2: '🔧 En cours', 3: '✅ Terminé' };
      console.log(`${statuts[row.id_statut]} ID ${row.id_signalement}: ${row.titre_signalement.substring(0, 50)}...`);
      inserted++;
    }
    
    console.log(`\n✅ ${inserted} signalements insérés avec succès!`);
    
    // Afficher les statistiques
    const stats = await client.query(`
      SELECT 
        ss.libelle_statut,
        COUNT(*) as nombre,
        ROUND(AVG(s.surface_endommagee_m2), 2) as surface_moyenne,
        ROUND(AVG(s.budget_estime_ar), 0) as budget_moyen
      FROM signalements s
      JOIN statuts_signalement ss ON s.id_statut = ss.id_statut
      GROUP BY ss.id_statut, ss.libelle_statut
      ORDER BY ss.id_statut
    `);
    
    console.log('\n📊 STATISTIQUES PAR STATUT:');
    console.log('─'.repeat(70));
    console.log('Statut\t\t\tNombre\tSurface moy.\tBudget moyen');
    console.log('─'.repeat(70));
    
    for (const row of stats.rows) {
      const statut = row.libelle_statut.padEnd(16);
      console.log(`${statut}\t${row.nombre}\t${row.surface_moyenne} m²\t\t${Number(row.budget_moyen).toLocaleString('fr-FR')} Ar`);
    }
    
    // Statistiques de délai pour les travaux terminés
    const delais = await client.query(`
      SELECT 
        type_probleme,
        COUNT(*) as nombre_travaux,
        ROUND(AVG(EXTRACT(DAY FROM (date_fin_travaux - date_signalement))), 1) as delai_moyen_jours,
        ROUND(AVG(EXTRACT(DAY FROM (date_debut_travaux - date_signalement))), 1) as delai_prise_en_charge,
        ROUND(AVG(EXTRACT(DAY FROM (date_fin_travaux - date_debut_travaux))), 1) as duree_travaux
      FROM signalements
      WHERE id_statut = 3 AND date_fin_travaux IS NOT NULL
      GROUP BY type_probleme
      ORDER BY delai_moyen_jours
    `);
    
    console.log('\n📈 DÉLAIS DE TRAITEMENT (Travaux terminés):');
    console.log('─'.repeat(85));
    console.log('Type problème\t\t\tNombre\tDélai total\tPrise en charge\tDurée travaux');
    console.log('─'.repeat(85));
    
    for (const row of delais.rows) {
      const type = (row.type_probleme || 'Non spécifié').padEnd(24);
      console.log(`${type}\t${row.nombre_travaux}\t${row.delai_moyen_jours} jours\t\t${row.delai_prise_en_charge} jours\t\t${row.duree_travaux} jours`);
    }
    
    // Avancement global
    const avancement = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE id_statut = 1) as nouveaux,
        COUNT(*) FILTER (WHERE id_statut = 2) as en_cours,
        COUNT(*) FILTER (WHERE id_statut = 3) as termines,
        COUNT(*) as total,
        ROUND(
          (COUNT(*) FILTER (WHERE id_statut = 1) * 0 +
           COUNT(*) FILTER (WHERE id_statut = 2) * 50 +
           COUNT(*) FILTER (WHERE id_statut = 3) * 100)::numeric / 
          NULLIF(COUNT(*), 0), 1
        ) as avancement_global
      FROM signalements
      WHERE id_statut IN (1, 2, 3)
    `);
    
    const av = avancement.rows[0];
    console.log('\n🎯 AVANCEMENT GLOBAL:');
    console.log('─'.repeat(50));
    console.log(`Nouveaux (0%):\t\t${av.nouveaux} signalements`);
    console.log(`En cours (50%):\t\t${av.en_cours} signalements`);
    console.log(`Terminés (100%):\t${av.termines} signalements`);
    console.log('─'.repeat(50));
    console.log(`TOTAL:\t\t\t${av.total} signalements`);
    console.log(`AVANCEMENT GLOBAL:\t${av.avancement_global}%`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedData().catch(console.error);
