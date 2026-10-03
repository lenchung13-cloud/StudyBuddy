const { pool } = require('../config/database');

class UnlockedReward {
  static async unlock({ user_id, reward_type, reward_id }) {
    const query = `
      INSERT INTO unlocked_rewards (user_id, reward_type, reward_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, reward_type, reward_id) DO NOTHING
      RETURNING *
    `;
    const values = [user_id, reward_type, reward_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM unlocked_rewards WHERE user_id = $1 ORDER BY unlocked_at DESC';
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async findByType(user_id, reward_type) {
    const query = `
      SELECT * FROM unlocked_rewards 
      WHERE user_id = $1 AND reward_type = $2 
      ORDER BY unlocked_at DESC
    `;
    const result = await pool.query(query, [user_id, reward_type]);
    return result.rows;
  }

  static async hasReward(user_id, reward_type, reward_id) {
    const query = `
      SELECT * FROM unlocked_rewards 
      WHERE user_id = $1 AND reward_type = $2 AND reward_id = $3
    `;
    const result = await pool.query(query, [user_id, reward_type, reward_id]);
    return result.rows.length > 0;
  }

  static async delete(user_id, reward_type, reward_id) {
    const query = `
      DELETE FROM unlocked_rewards 
      WHERE user_id = $1 AND reward_type = $2 AND reward_id = $3 
      RETURNING *
    `;
    const result = await pool.query(query, [user_id, reward_type, reward_id]);
    return result.rows[0];
  }
}

module.exports = UnlockedReward;
