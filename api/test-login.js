'use strict';

const bcrypt = require('bcrypt');
const { pool } = require('./src/config/database');

async function testLogin() {
    try {
        // 1. Récupérer le hash actuel
        const { rows } = await pool.query(
            "SELECT id_utilisateur, email, nom_utilisateur, mot_de_passe_hash, est_actif, est_bloque FROM utilisateurs WHERE email = 'manager@webrojo.mg'"
        );
        
        if (rows.length === 0) {
            console.log('❌ Utilisateur manager@webrojo.mg non trouvé!');
            process.exit(1);
        }
        
        const user = rows[0];
        console.log('\n=== Utilisateur trouvé ===');
        console.log('ID:', user.id_utilisateur);
        console.log('Email:', user.email);
        console.log('Nom utilisateur:', user.nom_utilisateur);
        console.log('Est actif:', user.est_actif);
        console.log('Est bloqué:', user.est_bloque);
        console.log('Hash (20 chars):', user.mot_de_passe_hash?.substring(0, 20) + '...');
        
        // 2. Tester le mot de passe
        const motDePasse = 'Manager123!';
        console.log('\n=== Test mot de passe ===');
        console.log('Mot de passe testé:', motDePasse);
        
        if (!user.mot_de_passe_hash) {
            console.log('❌ Pas de hash de mot de passe!');
            
            // Créer le hash
            console.log('\n=== Création du hash ===');
            const newHash = await bcrypt.hash(motDePasse, 10);
            await pool.query(
                'UPDATE utilisateurs SET mot_de_passe_hash = $1, est_actif = true, est_bloque = false WHERE email = $2',
                [newHash, 'manager@webrojo.mg']
            );
            console.log('✅ Hash créé et sauvegardé');
        } else {
            const isValid = await bcrypt.compare(motDePasse, user.mot_de_passe_hash);
            console.log('Résultat:', isValid ? '✅ VALIDE' : '❌ INVALIDE');
            
            if (!isValid) {
                console.log('\n=== Réinitialisation du mot de passe ===');
                const newHash = await bcrypt.hash(motDePasse, 10);
                await pool.query(
                    'UPDATE utilisateurs SET mot_de_passe_hash = $1, est_actif = true, est_bloque = false WHERE email = $2',
                    [newHash, 'manager@webrojo.mg']
                );
                console.log('✅ Mot de passe réinitialisé à:', motDePasse);
            }
        }
        
        // 3. Vérifier que est_actif est true
        if (!user.est_actif) {
            await pool.query("UPDATE utilisateurs SET est_actif = true WHERE email = 'manager@webrojo.mg'");
            console.log('✅ Compte activé');
        }
        
        if (user.est_bloque) {
            await pool.query("UPDATE utilisateurs SET est_bloque = false WHERE email = 'manager@webrojo.mg'");
            console.log('✅ Compte débloqué');
        }
        
        console.log('\n✅ Compte prêt pour connexion!');
        console.log('Email: manager@webrojo.mg');
        console.log('Mot de passe: Manager123!');
        
    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        process.exit(0);
    }
}

testLogin();
