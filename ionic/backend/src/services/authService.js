const { getAuth, getFirestore } = require('../config/firebase');
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectionService = require('./connectionService');

class AuthService {
  constructor() {
    this.useFirebase = true;
  }

  // Déterminer quel mode utiliser
  async determineMode() {
    const isOnline = await connectionService.checkInternetConnection();
    this.useFirebase = isOnline;
    return this.useFirebase ? 'firebase' : 'local';
  }

  // ==================== INSCRIPTION ====================
  
  async register(email, password, displayName = null) {
    const mode = await this.determineMode();
    console.log(`📝 Inscription via ${mode}`);

    if (this.useFirebase) {
      return await this.registerFirebase(email, password, displayName);
    } else {
      return await this.registerLocal(email, password, displayName);
    }
  }

  async registerFirebase(email, password, displayName) {
    try {
      const auth = getAuth();
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: displayName || email.split('@')[0]
      });

      // Stocker aussi dans Firestore
      const firestore = getFirestore();
      await firestore.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL || null,
        phoneNumber: userRecord.phoneNumber || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        mode: 'firebase',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        }
      };
    } catch (error) {
      console.error('Erreur inscription Firebase:', error);
      throw new Error(error.message);
    }
  }

  async registerLocal(email, password, displayName) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Générer un UID unique
      const uid = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Insérer l'utilisateur
      const result = await db.query(
        `INSERT INTO users (uid, email, password, display_name) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [uid, email, hashedPassword, displayName || email.split('@')[0]]
      );

      const user = result.rows[0];

      return {
        success: true,
        mode: 'local',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.display_name
        }
      };
    } catch (error) {
      console.error('Erreur inscription locale:', error);
      throw new Error(error.message);
    }
  }

  // ==================== CONNEXION ====================

  async login(email, password) {
    const mode = await this.determineMode();
    console.log(`🔐 Connexion via ${mode}`);

    if (this.useFirebase) {
      return await this.loginFirebase(email, password);
    } else {
      return await this.loginLocal(email, password);
    }
  }

  async loginFirebase(email, password) {
    try {
      // Firebase Admin SDK ne peut pas authentifier directement avec email/password
      // Il faut utiliser le SDK client côté front-end
      // Ici, on vérifie juste si l'utilisateur existe
      const auth = getAuth();
      const user = await auth.getUserByEmail(email);

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Créer un custom token pour le client
      const customToken = await auth.createCustomToken(user.uid);

      return {
        success: true,
        mode: 'firebase',
        customToken,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }
      };
    } catch (error) {
      console.error('Erreur connexion Firebase:', error);
      throw new Error(error.message);
    }
  }

  async loginLocal(email, password) {
    try {
      // Récupérer l'utilisateur
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Email ou mot de passe incorrect');
      }

      const user = result.rows[0];

      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Créer un JWT
      const token = jwt.sign(
        { uid: user.uid, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        mode: 'local',
        token,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.display_name,
          photoURL: user.photo_url,
          phoneNumber: user.phone_number
        }
      };
    } catch (error) {
      console.error('Erreur connexion locale:', error);
      throw new Error(error.message);
    }
  }

  // ==================== MISE À JOUR UTILISATEUR ====================

  async updateUser(uid, updates) {
    const mode = await this.determineMode();
    console.log(`✏️ Mise à jour utilisateur via ${mode}`);

    if (this.useFirebase) {
      return await this.updateUserFirebase(uid, updates);
    } else {
      return await this.updateUserLocal(uid, updates);
    }
  }

  async updateUserFirebase(uid, updates) {
    try {
      const auth = getAuth();
      const firestore = getFirestore();

      // Préparer les mises à jour pour Auth
      const authUpdates = {};
      if (updates.email) authUpdates.email = updates.email;
      if (updates.password) authUpdates.password = updates.password;
      if (updates.displayName) authUpdates.displayName = updates.displayName;
      if (updates.photoURL) authUpdates.photoURL = updates.photoURL;
      if (updates.phoneNumber) authUpdates.phoneNumber = updates.phoneNumber;

      // Mettre à jour Firebase Auth
      if (Object.keys(authUpdates).length > 0) {
        await auth.updateUser(uid, authUpdates);
      }

      // Mettre à jour Firestore
      const firestoreUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      delete firestoreUpdates.password; // Ne pas stocker le password dans Firestore

      await firestore.collection('users').doc(uid).update(firestoreUpdates);

      // Récupérer l'utilisateur mis à jour
      const updatedUser = await auth.getUser(uid);

      return {
        success: true,
        mode: 'firebase',
        user: {
          uid: updatedUser.uid,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          photoURL: updatedUser.photoURL,
          phoneNumber: updatedUser.phoneNumber
        }
      };
    } catch (error) {
      console.error('Erreur mise à jour Firebase:', error);
      throw new Error(error.message);
    }
  }

  async updateUserLocal(uid, updates) {
    try {
      const setClauses = [];
      const values = [];
      let paramCount = 1;

      // Construire la requête SQL dynamiquement
      if (updates.email) {
        setClauses.push(`email = $${paramCount++}`);
        values.push(updates.email);
      }
      if (updates.password) {
        const hashedPassword = await bcrypt.hash(updates.password, 10);
        setClauses.push(`password = $${paramCount++}`);
        values.push(hashedPassword);
      }
      if (updates.displayName) {
        setClauses.push(`display_name = $${paramCount++}`);
        values.push(updates.displayName);
      }
      if (updates.photoURL) {
        setClauses.push(`photo_url = $${paramCount++}`);
        values.push(updates.photoURL);
      }
      if (updates.phoneNumber) {
        setClauses.push(`phone_number = $${paramCount++}`);
        values.push(updates.phoneNumber);
      }

      if (setClauses.length === 0) {
        throw new Error('Aucune mise à jour fournie');
      }

      values.push(uid);

      const query = `
        UPDATE users 
        SET ${setClauses.join(', ')}
        WHERE uid = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      const user = result.rows[0];

      return {
        success: true,
        mode: 'local',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.display_name,
          photoURL: user.photo_url,
          phoneNumber: user.phone_number
        }
      };
    } catch (error) {
      console.error('Erreur mise à jour locale:', error);
      throw new Error(error.message);
    }
  }

  // ==================== RÉCUPÉRER UTILISATEUR ====================

  async getUser(uid) {
    const mode = await this.determineMode();

    if (this.useFirebase) {
      const auth = getAuth();
      const user = await auth.getUser(uid);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber
      };
    } else {
      const result = await db.query(
        'SELECT * FROM users WHERE uid = $1',
        [uid]
      );
      if (result.rows.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }
      const user = result.rows[0];
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
        phoneNumber: user.phone_number
      };
    }
  }
}

module.exports = new AuthService();
