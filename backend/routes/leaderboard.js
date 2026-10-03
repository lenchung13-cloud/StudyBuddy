const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { school_id, limit = 50 } = req.query;
    
    let query = `
      SELECT l.*, sp.full_name, s.name as school_name
      FROM leaderboard l
      JOIN student_profiles sp ON l.user_id = sp.id
      LEFT JOIN schools s ON l.school_id = s.id
    `;
    
    const params = [];
    
    if (school_id) {
      query += ' WHERE l.school_id = $1';
      params.push(school_id);
    }
    
    query += ' ORDER BY l.xp DESC, l.updated_at ASC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    
    // Add ranks
    const leaderboard = result.rows.map((row, index) => ({
      ...row,
      rank: index + 1
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get user's rank on leaderboard
router.get('/rank/:user_id', async (req, res) => {
  try {
    const query = `
      SELECT 
        l.*,
        sp.full_name,
        s.name as school_name,
        (SELECT COUNT(*) + 1 FROM leaderboard ll WHERE ll.xp > l.xp) as rank
      FROM leaderboard l
      JOIN student_profiles sp ON l.user_id = sp.id
      LEFT JOIN schools s ON l.school_id = s.id
      WHERE l.user_id = $1
    `;
    
    const result = await pool.query(query, [req.params.user_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found on leaderboard' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Failed to get user rank' });
  }
});

// Update leaderboard entry
router.post('/sync', async (req, res) => {
  try {
    const { user_id, privacy_alias, xp, level, school_id } = req.body;
    
    const query = `
      INSERT INTO leaderboard (user_id, privacy_alias, xp, level, school_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        privacy_alias = EXCLUDED.privacy_alias,
        xp = EXCLUDED.xp,
        level = EXCLUDED.level,
        school_id = EXCLUDED.school_id,
        updated_at = NOW()
      RETURNING *
    `;
    
    const result = await pool.query(query, [user_id, privacy_alias, xp, level, school_id]);
    
    // Update ranks
    await pool.query(`
      WITH ranked AS (
        SELECT id, RANK() OVER (ORDER BY xp DESC) as new_rank
        FROM leaderboard
      )
      UPDATE leaderboard l
      SET rank = r.new_rank
      FROM ranked r
      WHERE l.id = r.id
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Sync leaderboard error:', error);
    res.status(500).json({ error: 'Failed to sync leaderboard' });
  }
});

// Get leaderboard stats
router.get('/stats', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_students,
        SUM(xp) as total_xp,
        AVG(xp) as average_xp,
        MAX(xp) as top_score
      FROM leaderboard
    `;
    
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard stats' });
  }
});

module.exports = router;
