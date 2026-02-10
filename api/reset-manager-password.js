'use strict';

const bcrypt = require('bcrypt');
const { pool } = require('./src/config/database');

async function resetManagerPassword() {
    try {
        const hash = await bcrypt.hash('Manager123!', 10);
        
        const result = await pool.query(
            'UPDATE utilisateurs SET mot_de_passe_hash = $1 WHERE email = $2',
            [hash, 'manager@webrojo.mg']
        );
        
        console.log('Mot de passe mis à jour pour manager@webrojo.mg');
        console.log('Nouveau mot de passe: Manager123!');
        console.log('Lignes affectées:', result.rowCount);
        
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        process.exit();
    }
}

resetManagerPassword();
