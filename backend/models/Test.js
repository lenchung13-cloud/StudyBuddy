const { pool } = require('../config/database');

class Test {
  static async create({ subject_id, level, title, questions, passing_score }) {
    const query = `
      INSERT INTO tests (subject_id, level, title, questions, passing_score)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [subject_id, level, title, JSON.stringify(questions), passing_score || 70];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM tests WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findBySubjectId(subject_id) {
    const query = 'SELECT * FROM tests WHERE subject_id = $1 ORDER BY level';
    const result = await pool.query(query, [subject_id]);
    return result.rows;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === 'questions') {
          fields.push(`${key} = $${paramCount}::jsonb`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE tests 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM tests WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Test;
