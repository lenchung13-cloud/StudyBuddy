const { pool } = require('../config/database');

class Subject {
  static async create({ school_id, name, description }) {
    const query = `
      INSERT INTO subjects (school_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [school_id, name, description];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findBySchoolId(school_id) {
    const query = `
      SELECT s.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'chapter_number', c.chapter_number,
                   'chapter_name', c.chapter_name,
                   'description', c.description
                 ) ORDER BY c.chapter_number
               ) FILTER (WHERE c.id IS NOT NULL), 
               '[]'
             ) as chapters
      FROM subjects s
      LEFT JOIN chapters c ON s.id = c.subject_id
      WHERE s.school_id = $1
      GROUP BY s.id
      ORDER BY s.created_at
    `;
    const result = await pool.query(query, [school_id]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT s.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'chapter_number', c.chapter_number,
                   'chapter_name', c.chapter_name,
                   'description', c.description
                 ) ORDER BY c.chapter_number
               ) FILTER (WHERE c.id IS NOT NULL), 
               '[]'
             ) as chapters
      FROM subjects s
      LEFT JOIN chapters c ON s.id = c.subject_id
      WHERE s.id = $1
      GROUP BY s.id
    `;
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
      UPDATE subjects 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM subjects WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async deleteBySchoolId(school_id) {
    const query = 'DELETE FROM subjects WHERE school_id = $1 RETURNING *';
    const result = await pool.query(query, [school_id]);
    return result.rows;
  }
}

module.exports = Subject;
