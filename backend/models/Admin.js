const { pool } = require('../config/database');

class Admin {
  static async create({ id, school_id, role }) {
    const query = `
      INSERT INTO admins (id, school_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [id, school_id, role];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT a.*, u.email, u.role as user_role
      FROM admins a
      JOIN users u ON a.id = u.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findBySchoolId(school_id) {
    const query = `
      SELECT a.*, u.email, u.role as user_role
      FROM admins a
      JOIN users u ON a.id = u.id
      WHERE a.school_id = $1
    `;
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
      UPDATE admins 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM admins WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Admin;
