const { pool } = require('../config/database');

class Badge {
  static async award({ user_id, badge_id, badge_name, badge_icon }) {
    const query = `
      INSERT INTO badges (user_id, badge_id, badge_name, badge_icon)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, badge_id) DO NOTHING
      RETURNING *
    `;
    const values = [user_id, badge_id, badge_name, badge_icon];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM badges WHERE user_id = $1 ORDER BY earned_at DESC';
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async hasBadge(user_id, badge_id) {
    const query = 'SELECT * FROM badges WHERE user_id = $1 AND badge_id = $2';
    const result = await pool.query(query, [user_id, badge_id]);
    return result.rows.length > 0;
  }

  static async delete(user_id, badge_id) {
    const query = 'DELETE FROM badges WHERE user_id = $1 AND badge_id = $2 RETURNING *';
    const result = await pool.query(query, [user_id, badge_id]);
    return result.rows[0];
  }
}

module.exports = Badge;
