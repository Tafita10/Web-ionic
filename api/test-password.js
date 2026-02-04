const bcrypt = require('bcrypt');
const { pool } = require('./src/config/database');

async function testPassword() {
  try {
    // Récupérer le hash de la base
    const { rows } = await pool.query(
      'SELECT nom_utilisateur, mot_de_passe_hash FROM utilisateurs WHERE nom_utilisateur = $1',
      ['manager']
    );
    
    if (rows.length === 0) {
      console.log('❌ Utilisateur "manager" non trouvé');
      return;
    }
    
    const user = rows[0];
    console.log('✅ Utilisateur trouvé:', user.nom_utilisateur);
    console.log('Hash en base:', user.mot_de_passe_hash);
    
    // Tester le mot de passe
    const motDePasse = 'password123';
    const isMatch = await bcrypt.compare(motDePasse, user.mot_de_passe_hash);
    
    console.log('\nTest mot de passe "password123":', isMatch ? '✅ VALIDE' : '❌ INVALIDE');
    
    // Créer un nouveau hash pour comparaison
    const newHash = await bcrypt.hash(motDePasse, 12);
    console.log('\nNouveau hash généré:', newHash);
    console.log('Test nouveau hash:', await bcrypt.compare(motDePasse, newHash) ? '✅ VALIDE' : '❌ INVALIDE');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

testPassword();
