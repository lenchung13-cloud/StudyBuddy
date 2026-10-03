const express = require('express');
const router = express.Router();
const StudyLog = require('../models/StudyLog');
const StudentProfile = require('../models/StudentProfile');
const { pool } = require('../config/database');

// Get overall progress for a user
router.get('/user/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    
    // Get study logs
    const studyLogs = await StudyLog.findByUserId(user_id);
    
    // Calculate total study time
    const totalMinutes = studyLogs.reduce((acc, log) => acc + (log.minutes || 0), 0);
    
    // Get completed chapters
    const completedChapters = studyLogs.filter(log => log.completed).length;
    
    // Get student profile
    const profile = await StudentProfile.findById(user_id);
    
    res.json({
      total_study_minutes: totalMinutes,
      completed_chapters: completedChapters,
      total_points: profile?.total_points || 0,
      current_level: profile?.current_level || 1,
      streak_days: profile?.streak_days || 0
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Create study log
router.post('/study-logs', async (req, res) => {
  try {
    const { user_id, subject_id, chapter_id, minutes, date, completed, notes } = req.body;
    
    const studyLog = await StudyLog.create({
      user_id,
      subject_id,
      chapter_id,
      minutes,
      date,
      completed,
      notes
    });
    
    // Update student streak if completed
    if (completed) {
      const profile = await StudentProfile.findById(user_id);
      const today = new Date().toISOString().split('T')[0];
      const lastStudy = profile?.last_study_date;
      
      if (lastStudy) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastStudy === yesterdayStr) {
          await StudentProfile.updateStreak(user_id, (profile?.streak_days || 0) + 1);
        } else if (lastStudy !== today) {
          await StudentProfile.updateStreak(user_id, 1);
        }
      } else {
        await StudentProfile.updateStreak(user_id, 1);
      }
    }
    
    res.json(studyLog);
  } catch (error) {
    console.error('Create study log error:', error);
    res.status(500).json({ error: 'Failed to create study log' });
  }
});

// Get study logs for a user
router.get('/study-logs/user/:user_id', async (req, res) => {
  try {
    const studyLogs = await StudyLog.findByUserId(req.params.user_id);
    res.json(studyLogs);
  } catch (error) {
    console.error('Get study logs error:', error);
    res.status(500).json({ error: 'Failed to get study logs' });
  }
});

// Get weekly progress for a user
router.get('/weekly/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    const query = `
      SELECT * FROM weekly_progress 
      WHERE user_id = $1 
      AND week_start >= $2 
      AND week_end <= $3
    `;
    const result = await pool.query(query, [user_id, weekStartStr, weekEndStr]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      // Calculate current week progress
      const totalMinutes = await StudyLog.getTotalStudyTime(user_id, weekStartStr, weekEndStr);
      const studyLogs = await StudyLog.findByUserId(user_id);
      const daysCompleted = new Set(studyLogs.filter(log => {
        const logDate = log.date;
        return logDate >= weekStartStr && logDate <= weekEndStr && log.completed;
      }).map(log => log.date)).size;
      
      res.json({
        user_id,
        week_start: weekStartStr,
        week_end: weekEndStr,
        total_minutes: totalMinutes,
        days_completed: daysCompleted,
        average_grade: null
      });
    }
  } catch (error) {
    console.error('Get weekly progress error:', error);
    res.status(500).json({ error: 'Failed to get weekly progress' });
  }
});

module.exports = router;
