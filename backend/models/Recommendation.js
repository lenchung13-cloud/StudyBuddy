const { pool } = require('../config/database');

class Recommendation {
  static async create({ user_id, message, category }) {
    const query = `
      INSERT INTO recommendations (user_id, message, category)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [user_id, message, category];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM recommendations WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async findUnreadByUserId(user_id) {
    const query = 'SELECT * FROM recommendations WHERE user_id = $1 AND is_read = false ORDER BY created_at DESC';
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async markAsRead(id) {
    const query = `
      UPDATE recommendations 
      SET is_read = true
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async markAllAsRead(user_id) {
    const query = `
      UPDATE recommendations 
      SET is_read = true
      WHERE user_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM recommendations WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Recommendation;
