const { pool } = require('../config/database');

class Gamification {
  static async create({ user_id, xp = 0, level = 1, streak = 0 }) {
    const query = `
      INSERT INTO gamification (user_id, xp, level, streak)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        xp = EXCLUDED.xp,
        level = EXCLUDED.level,
        streak = EXCLUDED.streak,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [user_id, xp, level, streak];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM gamification WHERE user_id = $1';
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }

  static async addXP(user_id, amount) {
    const query = `
      UPDATE gamification 
      SET xp = xp + $1,
          level = floor((xp + $1) / 500) + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [amount, user_id]);
    return result.rows[0];
  }

  static async updateStreak(user_id, streak) {
    const query = `
      UPDATE gamification 
      SET streak = $1,
          last_active_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [streak, user_id]);
    return result.rows[0];
  }

  static async incrementStreak(user_id) {
    const query = `
      UPDATE gamification 
      SET streak = streak + 1,
          last_active_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }

  static async resetStreak(user_id) {
    const query = `
      UPDATE gamification 
      SET streak = 1,
          last_active_date = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }

  static async update(user_id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) return null;

    values.push(user_id);
    const query = `
      UPDATE gamification 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Gamification;
