const { pool } = require('../config/database');

class StudyLog {
  static async create({ user_id, subject_id, chapter_id, minutes, date, completed, notes }) {
    const query = `
      INSERT INTO study_logs (user_id, subject_id, chapter_id, minutes, date, completed, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [user_id, subject_id, chapter_id, minutes, date, completed || false, notes];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM study_logs WHERE user_id = $1 ORDER BY date DESC';
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async findByUserIdAndDate(user_id, date) {
    const query = 'SELECT * FROM study_logs WHERE user_id = $1 AND date = $2';
    const result = await pool.query(query, [user_id, date]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM study_logs WHERE id = $1';
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
      UPDATE study_logs 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM study_logs WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getTotalStudyTime(user_id, startDate, endDate) {
    const query = `
      SELECT SUM(minutes) as total_minutes
      FROM study_logs
      WHERE user_id = $1
      AND date >= $2
      AND date <= $3
    `;
    const result = await pool.query(query, [user_id, startDate, endDate]);
    return result.rows[0].total_minutes || 0;
  }
}

module.exports = StudyLog;
