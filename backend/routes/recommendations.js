const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const Recommendation = require('../models/Recommendation');
const StudentProfile = require('../models/StudentProfile');

// Generate and store recommendations for a user
router.get('/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const recommendations = [];
    
    // Get user's profile for streak
    const profile = await StudentProfile.findById(user_id);
    const streakDays = profile?.streak_days || 0;
    
    // Rule 1: Check subject balance (Math vs English)
    const subjectBalanceQuery = `
      SELECT 
        s.name,
        SUM(sl.minutes) as total_minutes
      FROM study_logs sl
      JOIN subjects s ON sl.subject_id = s.id
      WHERE sl.user_id = $1
      AND sl.date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY s.name
      ORDER BY total_minutes DESC
    `;
    const subjectResult = await pool.query(subjectBalanceQuery, [user_id]);
    const subjectData = subjectResult.rows;
    
    let mathMinutes = 0;
    let englishMinutes = 0;
    
    subjectData.forEach(subject => {
      const name = subject.name.toLowerCase();
      if (name.includes('math')) {
        mathMinutes = parseInt(subject.total_minutes) || 0;
      } else if (name.includes('english')) {
        englishMinutes = parseInt(subject.total_minutes) || 0;
      }
    });
    
    if (mathMinutes > englishMinutes && englishMinutes > 0) {
      const ratio = mathMinutes / englishMinutes;
      if (ratio > 1.5) {
        recommendations.push({
          type: 'subject_balance',
          priority: 'medium',
          title: 'Balance Your Subjects',
          message: 'You\'re studying math more than English. Try English next to keep a good balance!',
          action: 'Study English for 30 minutes today'
        });
      }
    } else if (mathMinutes > 0 && englishMinutes === 0) {
      recommendations.push({
        type: 'subject_balance',
        priority: 'high',
        title: 'Try Something New',
        message: 'You\'ve been focusing on math. Give English a try today!',
        action: 'Start with an English chapter'
      });
    }
    
    // Rule 2: Check grade trend (compare this week vs last week)
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);
    
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
    lastWeekEnd.setHours(23, 59, 59, 999);
    
    // Calculate average grade for this week
    const thisWeekQuery = `
      SELECT 
        AVG(
          CASE 
            WHEN minutes >= 120 AND completed THEN 10
            WHEN minutes >= 90 AND minutes <= 119 THEN 8
            WHEN minutes >= 60 AND minutes <= 89 THEN 6
            WHEN minutes >= 30 AND minutes <= 59 THEN 4
            ELSE 0
          END
        ) as avg_grade
      FROM study_logs
      WHERE user_id = $1
      AND date >= $2
      AND date <= $3
    `;
    const thisWeekResult = await pool.query(thisWeekQuery, [
      user_id, 
      thisWeekStart.toISOString().split('T')[0],
      thisWeekEnd.toISOString().split('T')[0]
    ]);
    const thisWeekAvg = parseFloat(thisWeekResult.rows[0].avg_grade) || 0;
    
    // Calculate average grade for last week
    const lastWeekQuery = `
      SELECT 
        AVG(
          CASE 
            WHEN minutes >= 120 AND completed THEN 10
            WHEN minutes >= 90 AND minutes <= 119 THEN 8
            WHEN minutes >= 60 AND minutes <= 89 THEN 6
            WHEN minutes >= 30 AND minutes <= 59 THEN 4
            ELSE 0
          END
        ) as avg_grade
      FROM study_logs
      WHERE user_id = $1
      AND date >= $2
      AND date <= $3
    `;
    const lastWeekResult = await pool.query(lastWeekQuery, [
      user_id,
      lastWeekStart.toISOString().split('T')[0],
      lastWeekEnd.toISOString().split('T')[0]
    ]);
    const lastWeekAvg = parseFloat(lastWeekResult.rows[0].avg_grade) || 0;
    
    if (lastWeekAvg > 0 && thisWeekAvg < lastWeekAvg) {
      const dropPercentage = ((lastWeekAvg - thisWeekAvg) / lastWeekAvg * 100).toFixed(1);
      recommendations.push({
        type: 'grade_trend',
        priority: 'high',
        title: 'Grade Trend Alert',
        message: `Your average grade dropped by ${dropPercentage}% compared to last week. Let's improve!`,
        action: 'Review chapters 3-5 in math to strengthen your understanding'
      });
    }
    
    // Rule 3: Streak motivation
    if (streakDays >= 5 && streakDays < 7) {
      recommendations.push({
        type: 'streak_motivation',
        priority: 'low',
        title: 'On Fire! 🔥',
        message: `You're on a ${streakDays}-day streak! Can you reach 7 days?`,
        action: 'Study today to keep your streak going!'
      });
    } else if (streakDays >= 7 && streakDays < 14) {
      recommendations.push({
        type: 'streak_motivation',
        priority: 'low',
        title: 'Streak Champion! 🏆',
        message: `Amazing ${streakDays}-day streak! Can you reach 14 days?`,
        action: 'Keep the momentum going!'
      });
    } else if (streakDays === 0) {
      recommendations.push({
        type: 'streak_motivation',
        priority: 'medium',
        title: 'Start Your Streak',
        message: 'Begin your study streak today! Every day counts.',
        action: 'Study for at least 30 minutes today'
      });
    }
    
    // Additional recommendation: Low study time
    const weeklyStudyQuery = `
      SELECT SUM(minutes) as total_minutes
      FROM study_logs
      WHERE user_id = $1
      AND date >= CURRENT_DATE - INTERVAL '7 days'
    `;
    const weeklyStudyResult = await pool.query(weeklyStudyQuery, [user_id]);
    const weeklyMinutes = parseInt(weeklyStudyResult.rows[0].total_minutes) || 0;
    
    if (weeklyMinutes < 300) { // Less than 5 hours per week
      recommendations.push({
        type: 'study_time',
        priority: 'high',
        title: 'Increase Study Time',
        message: `You've studied ${Math.round(weeklyMinutes / 60)} hours this week. Aim for 10 hours!`,
        action: 'Set a goal to study 2 hours today'
      });
    }
    
    // Store recommendations in database
    for (const rec of recommendations) {
      await Recommendation.create({
        user_id,
        recommendation_type: rec.type,
        title: rec.title,
        message: rec.message,
        action: rec.action,
        priority: rec.priority
      });
    }
    
    res.json({
      recommendations,
      total_recommendations: recommendations.length,
      streak_days: streakDays,
      weekly_study_minutes: weeklyMinutes,
      this_week_avg_grade: thisWeekAvg.toFixed(1),
      last_week_avg_grade: lastWeekAvg.toFixed(1)
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Get stored recommendations for a user
router.get('/stored/:user_id', async (req, res) => {
  try {
    const recommendations = await Recommendation.findByUserId(req.params.user_id);
    
    // Filter out read recommendations if requested
    const { unread_only } = req.query;
    const filtered = unread_only 
      ? recommendations.filter(r => !r.read)
      : recommendations;
    
    res.json(filtered);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Mark recommendation as read
router.put('/:id/read', async (req, res) => {
  try {
    const recommendation = await Recommendation.markAsRead(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    
    res.json(recommendation);
  } catch (error) {
    console.error('Mark recommendation read error:', error);
    res.status(500).json({ error: 'Failed to mark recommendation as read' });
  }
});

// Delete recommendation
router.delete('/:id', async (req, res) => {
  try {
    const recommendation = await Recommendation.delete(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    
    res.json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    console.error('Delete recommendation error:', error);
    res.status(500).json({ error: 'Failed to delete recommendation' });
  }
});

// Clear all read recommendations for a user
router.delete('/clear/:user_id', async (req, res) => {
  try {
    const query = `
      DELETE FROM recommendations 
      WHERE user_id = $1 AND read = true
      RETURNING *
    `;
    const result = await pool.query(query, [req.params.user_id]);
    
    res.json({
      message: 'Cleared read recommendations',
      deleted_count: result.rows.length
    });
  } catch (error) {
    console.error('Clear recommendations error:', error);
    res.status(500).json({ error: 'Failed to clear recommendations' });
  }
});

module.exports = router;
