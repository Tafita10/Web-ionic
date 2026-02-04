const { pool } = require('./src/config/database');
const bcrypt = require('bcrypt');

async function setupTestData() {
  try {
    const hash = await bcrypt.hash('password123', 12);
    
    // Create manager user
    await pool.query(`
      INSERT INTO utilisateurs (nom_complet, nom_utilisateur, email, mot_de_passe_hash, telephone, id_type_utilisateur, est_actif, est_verifie)
      VALUES ('Manager Admin', 'manager', 'manager@webrojo.mg', $1, '+261340000000', 1, true, true)
      ON CONFLICT (email) DO UPDATE SET mot_de_passe_hash = $1
    `, [hash]);
    console.log('✅ Manager créé: manager@webrojo.mg / password123');
    
    // Create test user
    await pool.query(`
      INSERT INTO utilisateurs (nom_complet, nom_utilisateur, email, mot_de_passe_hash, telephone, id_type_utilisateur, est_actif, est_verifie)
      VALUES ('User Test', 'user_test', 'user@webrojo.mg', $1, '+261340000001', 2, true, true)
      ON CONFLICT (email) DO UPDATE SET mot_de_passe_hash = $1
    `, [hash]);
    console.log('✅ User créé: user@webrojo.mg / password123');
    
    // Create test signalements
    const { rows: [manager] } = await pool.query(
      'SELECT id_utilisateur FROM utilisateurs WHERE email = $1',
      ['manager@webrojo.mg']
    );
    
    await pool.query(`
      INSERT INTO signalements (
        titre_signalement, description_signalement, id_ville, longitude, latitude,
        id_statut, type_probleme, niveau_gravite, id_utilisateur_createur,
        surface_endommagee_m2, budget_estime_ar
      ) VALUES
        ('Nid de poule Avenue Indépendance', 'Gros trou sur la chaussée', 1, 47.5079, -18.8792, 1, 'Nid-de-poule', 'Élevé', $1, 10.5, 3000000),
        ('Fissure Boulevard Ratsimilaho', 'Fissure dangereuse', 1, 47.5150, -18.8750, 2, 'Fissure', 'Moyen', $1, 25.0, 8000000),
        ('Route dégradée', 'Surface complètement abîmée', 1, 47.5200, -18.8700, 3, 'Dégradation', 'Critique', $1, 50.0, 15000000)
      ON CONFLICT (id_signalement) DO NOTHING
    `, [manager.id_utilisateur]);
    console.log('✅ 3 signalements créés');
    
    const { rows } = await pool.query('SELECT COUNT(*) as count FROM signalements');
    console.log(`✅ Total signalements: ${rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

setupTestData();
