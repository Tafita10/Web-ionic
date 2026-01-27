const { pool } = require('./src/config/database');
const bcrypt = require('bcrypt');

async function fixPassword() {
  try {
    const hash = await bcrypt.hash('password123', 12);
    console.log('Hash généré:', hash);
    
    const result = await pool.query(
      'UPDATE utilisateurs SET mot_de_passe_hash = $1 WHERE email = $2 RETURNING email',
      [hash, 'manager@webrojo.mg']
    );
    
    console.log('✅ Mot de passe mis à jour pour:', result.rows[0]?.email);
    
    // Test de vérification
    const { rows } = await pool.query(
      'SELECT mot_de_passe_hash FROM utilisateurs WHERE email = $1',
      ['manager@webrojo.mg']
    );
    
    const isValid = await bcrypt.compare('password123', rows[0].mot_de_passe_hash);
    console.log('✅ Vérification:', isValid ? 'VALIDE' : 'INVALIDE');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixPassword();
