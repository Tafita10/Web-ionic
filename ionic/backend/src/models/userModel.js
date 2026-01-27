const pool = require('../config/database');

class User {
  static async findAll() {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(userData) {
    const { nom, email } = userData;
    const result = await pool.query(
      'INSERT INTO users (nom, email) VALUES ($1, $2) RETURNING *',
      [nom, email]
    );
    return result.rows[0];
  }

  static async update(id, userData) {
    const { nom, email } = userData;
    const result = await pool.query(
      'UPDATE users SET nom = $1, email = $2 WHERE id = $3 RETURNING *',
      [nom, email, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return { message: 'Utilisateur supprimé' };
  }
}

module.exports = User;