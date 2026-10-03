const { pool } = require('../config/database');

class TestResult {
  static async create({ user_id, test_id, score, passed }) {
    const query = `
      INSERT INTO test_results (user_id, test_id, score, passed)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [user_id, test_id, score, passed];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(user_id) {
    const query = `
      SELECT tr.*, t.title as test_title, t.subject_id
      FROM test_results tr
      JOIN tests t ON tr.test_id = t.id
      WHERE tr.user_id = $1
      ORDER BY tr.taken_at DESC
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async findByTestId(test_id) {
    const query = 'SELECT * FROM test_results WHERE test_id = $1 ORDER BY taken_at DESC';
    const result = await pool.query(query, [test_id]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM test_results WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM test_results WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = TestResult;
