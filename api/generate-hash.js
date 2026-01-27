const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 12);
  console.log('Mot de passe:', password);
  console.log('Hash BCrypt:', hash);
  console.log('\nCommande SQL:');
  console.log(`UPDATE utilisateurs SET mot_de_passe_hash = '${hash}' WHERE nom_utilisateur = 'manager';`);
}

generateHash();
