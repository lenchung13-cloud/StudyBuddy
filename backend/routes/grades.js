const express = require('express');
const router = express.Router();
const StudentProfile = require('../models/StudentProfile');

// Calculate grade based on study minutes and completion status
router.post('/calculate', async (req, res) => {
  try {
    const { user_id, minutes, completed } = req.body;
    
    // Validate input
    if (typeof minutes !== 'number' || minutes < 0) {
      return res.status(400).json({ error: 'Invalid minutes value' });
    }
    
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Invalid completed value' });
    }
    
    // Calculate grade based on rules
    let grade;
    let points;
    
    if (minutes >= 120 && completed) {
      grade = 'A';
      points = 10;
    } else if (minutes >= 90 && minutes <= 119) {
      grade = 'B';
      points = 8;
    } else if (minutes >= 60 && minutes <= 89) {
      grade = 'C';
      points = 6;
    } else if (minutes >= 30 && minutes <= 59) {
      grade = 'D';
      points = 4;
    } else {
      grade = 'F';
      points = 0;
    }
    
    // Get user streak for bonus calculation
    let streakBonus = 1;
    let streakDays = 0;
    
    if (user_id) {
      try {
        const profile = await StudentProfile.findById(user_id);
        if (profile) {
          streakDays = profile.streak_days || 0;
          if (streakDays > 7) {
            streakBonus = 1.5; // 50% bonus for streak > 7 days
          }
        }
      } catch (error) {
        console.error('Error fetching profile for streak bonus:', error);
      }
    }
    
    // Calculate final points with streak bonus
    const finalPoints = Math.round(points * streakBonus);
    
    res.json({
      grade,
      base_points: points,
      streak_bonus: streakBonus,
      streak_days: streakDays,
      final_points: finalPoints,
      minutes_studied: minutes,
      completed,
      message: streakBonus > 1 
        ? `🔥 ${streakDays} day streak bonus applied! +50% points`
        : 'Keep studying to unlock streak bonuses!'
    });
  } catch (error) {
    console.error('Calculate grade error:', error);
    res.status(500).json({ error: 'Failed to calculate grade' });
  }
});

// Get grade for a specific study log entry
router.get('/study-log/:log_id', async (req, res) => {
  try {
    const { pool } = require('../server');
    
    const query = `
      SELECT sl.*, sp.streak_days
      FROM study_logs sl
      LEFT JOIN student_profiles sp ON sl.user_id = sp.id
      WHERE sl.id = $1
    `;
    
    const result = await pool.query(query, [req.params.log_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Study log not found' });
    }
    
    const log = result.rows[0];
    const streakDays = log.streak_days || 0;
    
    // Calculate grade
    let grade;
    let points;
    
    if (log.minutes >= 120 && log.completed) {
      grade = 'A';
      points = 10;
    } else if (log.minutes >= 90 && log.minutes <= 119) {
      grade = 'B';
      points = 8;
    } else if (log.minutes >= 60 && log.minutes <= 89) {
      grade = 'C';
      points = 6;
    } else if (log.minutes >= 30 && log.minutes <= 59) {
      grade = 'D';
      points = 4;
    } else {
      grade = 'F';
      points = 0;
    }
    
    // Apply streak bonus
    const streakBonus = streakDays > 7 ? 1.5 : 1;
    const finalPoints = Math.round(points * streakBonus);
    
    res.json({
      grade,
      base_points: points,
      streak_bonus: streakBonus,
      streak_days: streakDays,
      final_points: finalPoints,
      minutes_studied: log.minutes,
      completed: log.completed,
      date: log.date
    });
  } catch (error) {
    console.error('Get study log grade error:', error);
    res.status(500).json({ error: 'Failed to get study log grade' });
  }
});

// Get grade statistics for a user
router.get('/statistics/:user_id', async (req, res) => {
  try {
    const { pool } = require('../server');
    
    const query = `
      SELECT 
        COUNT(*) as total_logs,
        SUM(CASE WHEN minutes >= 120 AND completed THEN 1 ELSE 0 END) as a_count,
        SUM(CASE WHEN minutes >= 90 AND minutes <= 119 THEN 1 ELSE 0 END) as b_count,
        SUM(CASE WHEN minutes >= 60 AND minutes <= 89 THEN 1 ELSE 0 END) as c_count,
        SUM(CASE WHEN minutes >= 30 AND minutes <= 59 THEN 1 ELSE 0 END) as d_count,
        SUM(CASE WHEN minutes < 30 THEN 1 ELSE 0 END) as f_count,
        AVG(minutes) as avg_minutes,
        SUM(minutes) as total_minutes
      FROM study_logs
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [req.params.user_id]);
    const stats = result.rows[0];
    
    res.json({
      total_study_logs: parseInt(stats.total_logs) || 0,
      grade_distribution: {
        A: parseInt(stats.a_count) || 0,
        B: parseInt(stats.b_count) || 0,
        C: parseInt(stats.c_count) || 0,
        D: parseInt(stats.d_count) || 0,
        F: parseInt(stats.f_count) || 0
      },
      average_minutes: Math.round(stats.avg_minutes) || 0,
      total_minutes: parseInt(stats.total_minutes) || 0
    });
  } catch (error) {
    console.error('Get grade statistics error:', error);
    res.status(500).json({ error: 'Failed to get grade statistics' });
  }
});

module.exports = router;
