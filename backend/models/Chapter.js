const { pool } = require('../config/database');

class Chapter {
  static async create({ subject_id, chapter_number, chapter_name, description }) {
    const query = `
      INSERT INTO chapters (subject_id, chapter_number, chapter_name, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [subject_id, chapter_number, chapter_name, description];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findBySubjectId(subject_id) {
    const query = 'SELECT * FROM chapters WHERE subject_id = $1 ORDER BY chapter_number';
    const result = await pool.query(query, [subject_id]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM chapters WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updates) {
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

    values.push(id);
    const query = `
      UPDATE chapters 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM chapters WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async deleteBySubjectId(subject_id) {
    const query = 'DELETE FROM chapters WHERE subject_id = $1 RETURNING *';
    const result = await pool.query(query, [subject_id]);
    return result.rows;
  }
}

module.exports = Chapter;
