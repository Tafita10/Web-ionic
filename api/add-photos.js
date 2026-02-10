'use strict';

const { pool } = require('./src/config/database');

async function addPhotosToSignalements() {
    try {
        // Photos d'exemple (images de routes/nid de poule libres de droits)
        const photos1 = [
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400',
            'https://images.unsplash.com/photo-1574170609303-6c7f6aa1f94f?w=400'
        ];
        
        const photos2 = [
            'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400'
        ];
        
        const photos3 = [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'
        ];

        // Ajouter photos aux signalements
        await pool.query(
            'UPDATE signalements SET photos_urls = $1, nombre_photos = $2 WHERE id_signalement = 4',
            [photos1, photos1.length]
        );
        console.log('✅ Signalement 4: 2 photos ajoutées');

        await pool.query(
            'UPDATE signalements SET photos_urls = $1, nombre_photos = $2 WHERE id_signalement = 5',
            [photos2, photos2.length]
        );
        console.log('✅ Signalement 5: 1 photo ajoutée');

        await pool.query(
            'UPDATE signalements SET photos_urls = $1, nombre_photos = $2 WHERE id_signalement = 6',
            [photos3, photos3.length]
        );
        console.log('✅ Signalement 6: 3 photos ajoutées');

        // Vérifier
        const result = await pool.query(
            'SELECT id_signalement, titre_signalement, nombre_photos, photos_urls FROM signalements WHERE nombre_photos > 0'
        );
        
        console.log('\n📸 Signalements avec photos:');
        result.rows.forEach(row => {
            console.log(`  - ID ${row.id_signalement}: ${row.nombre_photos} photo(s)`);
        });

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        process.exit(0);
    }
}

addPhotosToSignalements();
