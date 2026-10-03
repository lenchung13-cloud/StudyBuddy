const { pool } = require('../config/database');

class AcademicYear {
  static async create({ school_id, year_name, start_date, end_date }) {
    const query = `
      INSERT INTO academic_years (school_id, year_name, start_date, end_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [school_id, year_name, start_date, end_date];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM academic_years WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findBySchoolId(school_id) {
    const query = 'SELECT * FROM academic_years WHERE school_id = $1 ORDER BY start_date DESC';
    const result = await pool.query(query, [school_id]);
    return result.rows;
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
      UPDATE academic_years 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM academic_years WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = AcademicYear;
