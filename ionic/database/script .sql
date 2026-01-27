-- ============================================
-- SCRIPT SQL COMPLET - TOUTES LES TABLES
-- Projet Cloud P17 - Signalement Routier
-- Version: 1.0 (Janvier 2026)
-- Base: PostgreSQL 15
-- ============================================

-- Supprimer les tables existantes (pour réinitialisation)
DROP TABLE IF EXISTS historique_status CASCADE;
DROP TABLE IF EXISTS sync_logs CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS signalements CASCADE;
DROP TABLE IF EXISTS entreprises CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS villes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS status CASCADE;
DROP TABLE IF EXISTS type_users CASCADE;

-- ============================================
-- TABLE: type_users
-- Types d'utilisateurs du système
-- ============================================
CREATE TABLE type_users (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_type_users_libelle ON type_users(libelle);

-- ============================================
-- TABLE: status
-- Statuts des signalements et réparations
-- ============================================
CREATE TABLE status (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE,
    couleur VARCHAR(7) NOT NULL, -- Code hexadécimal (#FF0000)
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_status_libelle ON status(libelle);

-- ============================================
-- TABLE: villes
-- Villes où se trouvent les signalements
-- ============================================
CREATE TABLE villes (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    code_postal VARCHAR(10),
    pays VARCHAR(50) DEFAULT 'Madagascar',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_villes_nom ON villes(nom);
CREATE INDEX idx_villes_location ON villes(latitude, longitude);

-- ============================================
-- TABLE: routes
-- Routes/Rues de la ville
-- ============================================
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    ville_id INTEGER REFERENCES villes(id) ON DELETE CASCADE,
    type_route VARCHAR(50), -- 'Avenue', 'Rue', 'Boulevard', etc.
    longueur_km DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_routes_nom ON routes(nom);
CREATE INDEX idx_routes_ville_id ON routes(ville_id);

-- ============================================
-- TABLE: entreprises
-- Entreprises de construction/réparation
-- ============================================
CREATE TABLE entreprises (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(100),
    adresse TEXT,
    ville_id INTEGER REFERENCES villes(id),
    siret VARCHAR(50),
    est_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_entreprises_nom ON entreprises(nom);
CREATE INDEX idx_entreprises_ville_id ON entreprises(ville_id);
CREATE INDEX idx_entreprises_est_active ON entreprises(est_active);

-- ============================================
-- TABLE: users
-- Utilisateurs du système
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    adresse TEXT,
    
    -- Type et rôle
    type_user_id INTEGER REFERENCES type_users(id) DEFAULT 2,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('visitor', 'user', 'manager')),
    
    -- Firebase
    firebase_uid VARCHAR(255) UNIQUE,
    
    -- Sécurité
    failed_attempts INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT false,
    blocked_at TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_type_user_id ON users(type_user_id);
CREATE INDEX idx_users_is_blocked ON users(is_blocked);

-- ============================================
-- TABLE: sessions
-- Gestion des sessions JWT
-- ============================================
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

-- ============================================
-- TABLE: login_attempts
-- Historique des tentatives de connexion
-- ============================================
CREATE TABLE login_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    success BOOLEAN DEFAULT false,
    ip_address VARCHAR(45),
    user_agent TEXT,
    failure_reason VARCHAR(255),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);

-- ============================================
-- TABLE: signalements
-- Signalements de problèmes routiers
-- ============================================
CREATE TABLE signalements (
    id SERIAL PRIMARY KEY,
    
    -- Utilisateur
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Localisation
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    ville_id INTEGER REFERENCES villes(id),
    route_id INTEGER REFERENCES routes(id),
    adresse_precise TEXT,
    
    -- Informations du signalement
    description TEXT NOT NULL,
    photo_url TEXT,
    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Statut
    status_id INTEGER REFERENCES status(id) DEFAULT 1,
    
    -- Informations enrichies (ajoutées par Manager)
    surface_m2 DECIMAL(10, 2),
    budget DECIMAL(15, 2),
    entreprise_id INTEGER REFERENCES entreprises(id),
    date_debut DATE,
    date_fin_prevue DATE,
    date_fin_reelle DATE,
    commentaire TEXT,
    priorite INTEGER DEFAULT 3 CHECK (priorite BETWEEN 1 AND 5), -- 1=urgent, 5=faible
    
    -- Synchronisation Firebase
    firebase_id VARCHAR(255) UNIQUE,
    is_synced BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT valid_coordinates CHECK (
        latitude BETWEEN -90 AND 90 AND 
        longitude BETWEEN -180 AND 180
    ),
    CONSTRAINT valid_surface CHECK (surface_m2 IS NULL OR surface_m2 > 0),
    CONSTRAINT valid_budget CHECK (budget IS NULL OR budget >= 0),
    CONSTRAINT valid_dates CHECK (
        (date_debut IS NULL OR date_fin_prevue IS NULL OR date_debut <= date_fin_prevue) AND
        (date_debut IS NULL OR date_fin_reelle IS NULL OR date_debut <= date_fin_reelle)
    )
);

-- Index
CREATE INDEX idx_signalements_user_id ON signalements(user_id);
CREATE INDEX idx_signalements_status_id ON signalements(status_id);
CREATE INDEX idx_signalements_firebase_id ON signalements(firebase_id);
CREATE INDEX idx_signalements_location ON signalements(latitude, longitude);
CREATE INDEX idx_signalements_date ON signalements(date_signalement DESC);
CREATE INDEX idx_signalements_is_synced ON signalements(is_synced);
CREATE INDEX idx_signalements_ville_id ON signalements(ville_id);
CREATE INDEX idx_signalements_route_id ON signalements(route_id);
CREATE INDEX idx_signalements_entreprise_id ON signalements(entreprise_id);
CREATE INDEX idx_signalements_priorite ON signalements(priorite);

-- ============================================
-- TABLE: historique_status
-- Historique des changements de statut
-- ============================================
CREATE TABLE historique_status (
    id SERIAL PRIMARY KEY,
    signalement_id INTEGER REFERENCES signalements(id) ON DELETE CASCADE,
    status_ancien_id INTEGER REFERENCES status(id),
    status_nouveau_id INTEGER REFERENCES status(id) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    commentaire TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_historique_signalement_id ON historique_status(signalement_id);
CREATE INDEX idx_historique_status_ancien ON historique_status(status_ancien_id);
CREATE INDEX idx_historique_status_nouveau ON historique_status(status_nouveau_id);
CREATE INDEX idx_historique_user_id ON historique_status(user_id);
CREATE INDEX idx_historique_changed_at ON historique_status(changed_at DESC);

-- ============================================
-- TABLE: sync_logs
-- Historique des synchronisations Firebase
-- ============================================
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(20) CHECK (sync_type IN ('pull', 'push')) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    records_count INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    duration_ms INTEGER,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_sync_logs_sync_type ON sync_logs(sync_type);
CREATE INDEX idx_sync_logs_synced_at ON sync_logs(synced_at DESC);
CREATE INDEX idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX idx_sync_logs_success ON sync_logs(success);

-- ============================================
-- TRIGGERS: Mise à jour automatique updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entreprises_updated_at 
    BEFORE UPDATE ON entreprises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signalements_updated_at 
    BEFORE UPDATE ON signalements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Enregistrer changement de statut
-- ============================================
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status_id IS DISTINCT FROM NEW.status_id THEN
        INSERT INTO historique_status (
            signalement_id, 
            status_ancien_id, 
            status_nouveau_id,
            commentaire
        )
        VALUES (
            NEW.id,
            OLD.status_id,
            NEW.status_id,
            'Changement automatique de statut'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_status_change
    AFTER UPDATE ON signalements
    FOR EACH ROW
    WHEN (OLD.status_id IS DISTINCT FROM NEW.status_id)
    EXECUTE FUNCTION log_status_change();

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Débloquer un utilisateur
CREATE OR REPLACE FUNCTION unlock_user(user_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE users 
    SET is_blocked = false, 
        failed_attempts = 0,
        blocked_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = user_email;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Incrémenter tentatives échouées
CREATE OR REPLACE FUNCTION increment_failed_attempts(
    user_email VARCHAR, 
    max_attempts INTEGER DEFAULT 3
)
RETURNS BOOLEAN AS $$
DECLARE
    current_attempts INTEGER;
    should_block BOOLEAN;
BEGIN
    UPDATE users 
    SET failed_attempts = failed_attempts + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = user_email
    RETURNING failed_attempts INTO current_attempts;
    
    should_block := current_attempts >= max_attempts;
    
    IF should_block THEN
        UPDATE users 
        SET is_blocked = true,
            blocked_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE email = user_email;
    END IF;
    
    RETURN should_block;
END;
$$ LANGUAGE plpgsql;

-- Réinitialiser tentatives après connexion réussie
CREATE OR REPLACE FUNCTION reset_failed_attempts(user_email VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET failed_attempts = 0, 
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Créer une session
CREATE OR REPLACE FUNCTION create_session(
    p_user_id INTEGER,
    p_token TEXT,
    p_duration INTEGER DEFAULT 86400,
    p_ip_address VARCHAR DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    session_id INTEGER;
BEGIN
    INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
    VALUES (
        p_user_id,
        p_token,
        CURRENT_TIMESTAMP + (p_duration || ' seconds')::INTERVAL,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO session_id;
    
    RETURN session_id;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les sessions d'un utilisateur
CREATE OR REPLACE FUNCTION delete_user_sessions(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE user_id = p_user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Obtenir statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id INTEGER)
RETURNS TABLE (
    total_signalements BIGINT,
    signalements_nouveaux BIGINT,
    signalements_en_cours BIGINT,
    signalements_termines BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE s.status_id = 1),
        COUNT(*) FILTER (WHERE s.status_id = 2),
        COUNT(*) FILTER (WHERE s.status_id = 3)
    FROM signalements s
    WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VUES
-- ============================================

-- Vue: Statistiques globales
CREATE OR REPLACE VIEW v_stats_globales AS
SELECT 
    COUNT(*) as total_signalements,
    COUNT(*) FILTER (WHERE s.status_id = 1) as nouveaux,
    COUNT(*) FILTER (WHERE s.status_id = 2) as en_cours,
    COUNT(*) FILTER (WHERE s.status_id = 3) as termines,
    COALESCE(SUM(s.surface_m2), 0) as surface_totale,
    COALESCE(SUM(s.budget), 0) as budget_total,
    ROUND(
        (COUNT(*) FILTER (WHERE s.status_id = 3)::DECIMAL / 
         NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as pourcentage_termine
FROM signalements s;

-- Vue: Signalements détaillés
CREATE OR REPLACE VIEW v_signalements_details AS
SELECT 
    s.id,
    s.latitude,
    s.longitude,
    s.description,
    s.photo_url,
    s.date_signalement,
    s.surface_m2,
    s.budget,
    s.date_debut,
    s.date_fin_prevue,
    s.date_fin_reelle,
    s.commentaire,
    s.priorite,
    s.firebase_id,
    s.is_synced,
    s.created_at,
    s.updated_at,
    u.id as user_id,
    u.email as user_email,
    u.nom as user_nom,
    u.prenom as user_prenom,
    u.role as user_role,
    st.id as status_id,
    st.libelle as status_libelle,
    st.couleur as status_couleur,
    v.nom as ville_nom,
    r.nom as route_nom,
    e.nom as entreprise_nom,
    e.telephone as entreprise_telephone
FROM signalements s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN status st ON s.status_id = st.id
LEFT JOIN villes v ON s.ville_id = v.id
LEFT JOIN routes r ON s.route_id = r.id
LEFT JOIN entreprises e ON s.entreprise_id = e.id;

-- Vue: Signalements non traités
CREATE OR REPLACE VIEW v_signalements_non_traites AS
SELECT 
    s.id,
    s.latitude,
    s.longitude,
    s.description,
    s.photo_url,
    s.date_signalement,
    u.email as user_email,
    u.nom as user_nom,
    u.prenom as user_prenom,
    st.libelle as status,
    v.nom as ville_nom
FROM signalements s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN status st ON s.status_id = st.id
LEFT JOIN villes v ON s.ville_id = v.id
WHERE s.surface_m2 IS NULL 
   OR s.budget IS NULL 
   OR s.entreprise_id IS NULL;

-- Vue: Utilisateurs bloqués
CREATE OR REPLACE VIEW v_users_bloques AS
SELECT 
    u.id,
    u.email,
    u.nom,
    u.prenom,
    u.role,
    u.failed_attempts,
    u.blocked_at,
    u.last_login,
    u.created_at,
    tu.libelle as type_user
FROM users u
LEFT JOIN type_users tu ON u.type_user_id = tu.id
WHERE u.is_blocked = true;

-- Vue: Historique complet des statuts
CREATE OR REPLACE VIEW v_historique_complet AS
SELECT 
    h.id,
    h.signalement_id,
    s.description as signalement_description,
    sa.libelle as status_ancien,
    sn.libelle as status_nouveau,
    u.nom as user_nom,
    u.prenom as user_prenom,
    h.commentaire,
    h.changed_at
FROM historique_status h
LEFT JOIN signalements s ON h.signalement_id = s.id
LEFT JOIN status sa ON h.status_ancien_id = sa.id
LEFT JOIN status sn ON h.status_nouveau_id = sn.id
LEFT JOIN users u ON h.user_id = u.id
ORDER BY h.changed_at DESC;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Types d'utilisateurs
INSERT INTO type_users (libelle, description) VALUES 
    ('Visiteur', 'Utilisateur non authentifié, accès en lecture seule'),
    ('Utilisateur', 'Utilisateur authentifié, peut créer des signalements'),
    ('Manager', 'Administrateur, peut enrichir et gérer les signalements');

-- Statuts
INSERT INTO status (libelle, couleur, description) VALUES 
    ('Nouveau', '#FF0000', 'Signalement non encore traité'),
    ('En cours', '#FFA500', 'Travaux de réparation en cours'),
    ('Terminé', '#00FF00', 'Réparation terminée avec succès');

-- Villes
INSERT INTO villes (nom, latitude, longitude, code_postal, pays) VALUES 
    ('Antananarivo', -18.8792, 47.5079, '101', 'Madagascar'),
    ('Antsirabe', -19.8667, 47.0333, '110', 'Madagascar'),
    ('Toamasina', -18.1443, 49.4019, '501', 'Madagascar');

-- Routes d'Antananarivo
INSERT INTO routes (nom, ville_id, type_route, longueur_km) VALUES 
    ('Avenue de l''Indépendance', 1, 'Avenue', 3.5),
    ('Rue Rainitovo', 1, 'Rue', 1.2),
    ('Boulevard Ratsimilaho', 1, 'Boulevard', 4.8),
    ('Route Digue', 1, 'Route', 6.3),
    ('Avenue Général de Gaulle', 1, 'Avenue', 2.1);

-- Entreprises
INSERT INTO entreprises (nom, telephone, email, adresse, ville_id, siret, est_active) VALUES 
    ('Entreprise Municipal Antananarivo', '+261 20 22 123 45', 'contact@municipal-tana.mg', 'Antananarivo Centre', 1, 'EM-001-2020', true),
    ('BTP Madagascar SARL', '+261 20 22 456 78', 'info@btpmadagascar.mg', 'Zone Industrielle Forello', 1, 'BTP-002-2019', true),
    ('TravPublic SA', '+261 20 22 789 01', 'contact@travpublic.mg', 'Behoririka', 1, 'TP-003-2018', true),
    ('Construction Route Nationale', '+261 20 22 345 67', 'crn@routenationale.mg', 'Ivato', 1, 'CRN-004-2021', true);

-- Manager par défaut (mot de passe: Manager123!)
INSERT INTO users (email, password_hash, nom, prenom, type_user_id, role, telephone) VALUES 
    ('manager@example.com', '$2b$10$8xKzqVZ9YGHvq5nPvV3tEObh0mPZxLkWqM5wq5GH6KL3XYZvJlHHC', 'Admin', 'Manager', 3, 'manager', '+261 32 00 000 01');

-- Utilisateurs test (mot de passe: User123!)
INSERT INTO users (email, password_hash, nom, prenom, type_user_id, role, telephone) VALUES 
    ('user1@example.com', '$2b$10$XYZ123AbcDEF456GHI789JklMNO012PqrSTU345VwxYZ678ABCdef', 'Rakoto', 'Jean', 2, 'user', '+261 32 11 111 11'),
    ('user2@example.com', '$2b$10$XYZ123AbcDEF456GHI789JklMNO012PqrSTU345VwxYZ678ABCdef', 'Rabe', 'Marie', 2, 'user', '+261 32 22 222 22'),
    ('user3@example.com', '$2b$10$XYZ123AbcDEF456GHI789JklMNO012PqrSTU345VwxYZ678ABCdef', 'Randria', 'Paul', 2, 'user', '+261 32 33 333 33');

-- Signalements de test
INSERT INTO signalements (
    user_id, 
    latitude, 
    longitude, 
    ville_id,
    route_id,
    description, 
    status_id,
    priorite,
    adresse_precise
) VALUES 
    (2, -18.8792, 47.5079, 1, 1, 'Nid de poule important sur l''Avenue de l''Indépendance près de l''Hôtel de Ville', 1, 1, 'Avenue de l''Indépendance, devant Hôtel de Ville'),
    (2, -18.9138, 47.5361, 1, 3, 'Route très endommagée, plusieurs fissures dangereuses', 2, 2, 'Boulevard Ratsimilaho, hauteur marché Analakely'),
    (3, -18.8645, 47.5208, 1, 2, 'Affaissement de chaussée suite aux pluies', 3, 3, 'Rue Rainitovo, intersection avec Rue Raveloson'),
    (3, -18.8950, 47.5400, 1, 4, 'Trou dans la chaussée suite à travaux de canalisations', 1, 2, 'Route Digue, près du stade'),
    (4, -18.8700, 47.5100, 1, 5, 'Dégradation importante de la surface', 1, 4, 'Avenue Général de Gaulle');

-- Enrichir le signalement 2 (en cours)
UPDATE signalements 
SET 
    surface_m2 = 12.5,
    budget = 450000,
    entreprise_id = 2,
    date_debut = CURRENT_DATE,
    date_fin_prevue = CURRENT_DATE + INTERVAL '15 days',
    commentaire = 'Travaux urgents à réaliser - budget alloué'
WHERE id = 2;

-- Enrichir le signalement 3 (terminé)
UPDATE signalements 
SET 
    surface_m2 = 8.7,
    budget = 320000,
    entreprise_id = 3,
    date_debut = CURRENT_DATE - INTERVAL '20 days',
    date_fin_prevue = CURRENT_DATE - INTERVAL '5 days',
    date_fin_reelle = CURRENT_DATE - INTERVAL '3 days',
    commentaire = 'Travaux terminés avec succès - qualité satisfaisante'
WHERE id = 3;

-- ============================================
-- COMMENTAIRES SUR LES TABLES
-- ============================================

COMMENT ON TABLE type_users IS 'Types d''utilisateurs (Visiteur, Utilisateur, Manager)';
COMMENT ON TABLE status IS 'Statuts des signalements (Nouveau, En cours, Terminé)';
COMMENT ON TABLE villes IS 'Villes où se trouvent les signalements';
COMMENT ON TABLE routes IS 'Routes et rues des villes';
COMMENT ON TABLE entreprises IS 'Entreprises de construction et réparation routière';
COMMENT ON TABLE users IS 'Utilisateurs avec gestion des rôles et blocage';
COMMENT ON TABLE sessions IS 'Sessions utilisateurs JWT avec expiration';
COMMENT ON TABLE login_attempts IS 'Historique des tentatives de connexion';
COMMENT ON TABLE signalements IS 'Signalements routiers avec géolocalisation et enrichissement';
COMMENT ON TABLE historique_status IS 'Historique des changements de statut';
COMMENT ON TABLE sync_logs IS 'Logs de synchronisation Firebase';

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

SELECT 
    'Table: ' || table_name || ' - Colonnes: ' || 
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = t.table_name AND table_schema = 'public') as info
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Statistiques
SELECT 'Utilisateurs créés' as info, COUNT(*) as total FROM users
UNION ALL
SELECT 'Signalements créés', COUNT(*) FROM signalements
UNION ALL
SELECT 'Entreprises créées', COUNT(*) FROM entreprises
UNION ALL
SELECT 'Routes créées', COUNT(*) FROM routes;

-- ============================================
-- MESSAGE FINAL
-- ============================================

