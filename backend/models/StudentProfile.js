const { pool } = require('../config/database');

class StudentProfile {
  static async create({ id, school_id, full_name, age, grade_level, avatar_url, privacy_alias, academic_year_id }) {
    const query = `
      INSERT INTO student_profiles (id, school_id, full_name, age, grade_level, avatar_url, privacy_alias, academic_year_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [id, school_id, full_name, age, grade_level, avatar_url, privacy_alias, academic_year_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM student_profiles WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findBySchoolId(school_id) {
    const query = 'SELECT * FROM student_profiles WHERE school_id = $1';
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
      UPDATE student_profiles 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async addPoints(id, points) {
    const query = `
      UPDATE student_profiles 
      SET total_points = total_points + $1,
          current_level = floor((total_points + $1) / 500) + 1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [points, id]);
    return result.rows[0];
  }

  static async updateStreak(id, streak_days) {
    const query = `
      UPDATE student_profiles 
      SET streak_days = $1,
          last_study_date = CURRENT_DATE
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [streak_days, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM student_profiles WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = StudentProfile;
