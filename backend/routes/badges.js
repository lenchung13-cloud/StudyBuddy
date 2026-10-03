const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const Badge = require('../models/Badge');
const StudentProfile = require('../models/StudentProfile');

// Badge catalogue with earning rules
const BADGE_CATALOGUE = [
  {
    id: 'first_study',
    name: 'First Steps',
    icon: '🚀',
    description: 'Complete your first study session',
    rule: async (user_id) => {
      const query = 'SELECT COUNT(*) as count FROM study_logs WHERE user_id = $1';
      const result = await pool.query(query, [user_id]);
      return parseInt(result.rows[0].count) >= 1;
    }
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    icon: '⚔️',
    description: 'Study for 7 consecutive days',
    rule: async (user_id) => {
      const profile = await StudentProfile.findById(user_id);
      return (profile?.streak_days || 0) >= 7;
    }
  },
  {
    id: 'chapter_master',
    name: 'Chapter Master',
    icon: '📚',
    description: 'Complete 10 chapters',
    rule: async (user_id) => {
      const query = 'SELECT COUNT(*) as count FROM study_logs WHERE user_id = $1 AND completed = true';
      const result = await pool.query(query, [user_id]);
      return parseInt(result.rows[0].count) >= 10;
    }
  },
  {
    id: 'streak_champion',
    name: 'Streak Champion',
    icon: '🔥',
    description: 'Maintain a 14-day streak',
    rule: async (user_id) => {
      const profile = await StudentProfile.findById(user_id);
      return (profile?.streak_days || 0) >= 14;
    }
  },
  {
    id: 'math_whiz',
    name: 'Math Whiz',
    icon: '🧮',
    description: 'Study math for 10+ hours total',
    rule: async (user_id) => {
      const query = `
        SELECT SUM(minutes) as total 
        FROM study_logs sl
        JOIN subjects s ON sl.subject_id = s.id
        WHERE sl.user_id = $1 AND LOWER(s.name) LIKE '%math%'
      `;
      const result = await pool.query(query, [user_id]);
      return (parseInt(result.rows[0].total) || 0) >= 600; // 10 hours = 600 minutes
    }
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    icon: '🌅',
    description: 'Complete 5 study sessions before 9 AM',
    rule: async (user_id) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM study_logs 
        WHERE user_id = $1 
        AND EXTRACT(HOUR FROM created_at) < 9
      `;
      const result = await pool.query(query, [user_id]);
      return parseInt(result.rows[0].count) >= 5;
    }
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    icon: '🦉',
    description: 'Complete 5 study sessions after 9 PM',
    rule: async (user_id) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM study_logs 
        WHERE user_id = $1 
        AND EXTRACT(HOUR FROM created_at) >= 21
      `;
      const result = await pool.query(query, [user_id]);
      return parseInt(result.rows[0].count) >= 5;
    }
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    icon: '⭐',
    description: 'Study every day for a week (7 days)',
    rule: async (user_id) => {
      const query = `
        SELECT COUNT(DISTINCT DATE(date)) as days 
        FROM study_logs 
        WHERE user_id = $1 
        AND date >= CURRENT_DATE - INTERVAL '7 days'
      `;
      const result = await pool.query(query, [user_id]);
      return parseInt(result.rows[0].days) >= 7;
    }
  },
  {
    id: 'grade_a_student',
    name: 'Grade A Student',
    icon: '🏆',
    description: 'Earn 5 A grades',
    rule: async (user_id) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM study_logs 
        WHERE user_id = $1 
        AND minutes >= 120 
        AND completed = true
      `;
      const result = await pool.query(query, [user_id]);
      return parseInt(result.rows[0].count) >= 5;
    }
  },
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    icon: '💪',
    description: 'Study for 50+ hours total',
    rule: async (user_id) => {
      const query = 'SELECT SUM(minutes) as total FROM study_logs WHERE user_id = $1';
      const result = await pool.query(query, [user_id]);
      return (parseInt(result.rows[0].total) || 0) >= 3000; // 50 hours = 3000 minutes
    }
  }
];

// Check and award badges for a user
router.get('/check/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    
    // Get user's current badges
    const currentBadges = await Badge.findByUserId(user_id);
    const currentBadgeIds = new Set(currentBadges.map(b => b.badge_id));
    
    const newlyAwarded = [];
    
    // Check each badge in the catalogue
    for (const badge of BADGE_CATALOGUE) {
      // Skip if already earned
      if (currentBadgeIds.has(badge.id)) {
        continue;
      }
      
      // Check if badge rule is met
      const earned = await badge.rule(user_id);
      
      if (earned) {
        // Award the badge
        const awardedBadge = await Badge.award({
          user_id,
          badge_id: badge.id,
          badge_name: badge.name,
          badge_icon: badge.icon
        });
        
        newlyAwarded.push({
          badge_id: badge.id,
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
          awarded_at: awardedBadge.created_at,
          message: `🎉 Congratulations! You earned the "${badge.name}" badge! ${badge.description}`
        });
        
        // Award points for earning badge
        await StudentProfile.addPoints(user_id, 200);
      }
    }
    
    res.json({
      newly_awarded_badges: newlyAwarded,
      total_new_badges: newlyAwarded.length,
      message: newlyAwarded.length > 0 
        ? `Amazing! You earned ${newlyAwarded.length} new badge${newlyAwarded.length > 1 ? 's' : ''}!`
        : 'Keep studying to earn more badges!'
    });
  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({ error: 'Failed to check badges' });
  }
});

// Get all badges in catalogue
router.get('/catalogue', async (req, res) => {
  try {
    const catalogue = BADGE_CATALOGUE.map(badge => ({
      id: badge.id,
      name: badge.name,
      icon: badge.icon,
      description: badge.description
    }));
    
    res.json(catalogue);
  } catch (error) {
    console.error('Get badge catalogue error:', error);
    res.status(500).json({ error: 'Failed to get badge catalogue' });
  }
});

// Get user's earned badges
router.get('/user/:user_id', async (req, res) => {
  try {
    const badges = await Badge.findByUserId(req.params.user_id);
    
    // Add catalogue information
    const badgesWithDetails = badges.map(userBadge => {
      const catalogueBadge = BADGE_CATALOGUE.find(b => b.id === userBadge.badge_id);
      return {
        ...userBadge,
        description: catalogueBadge?.description || ''
      };
    });
    
    res.json(badgesWithDetails);
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ error: 'Failed to get user badges' });
  }
});

// Manually award a badge (admin function)
router.post('/award', async (req, res) => {
  try {
    const { user_id, badge_id } = req.body;
    
    // Check if badge exists in catalogue
    const catalogueBadge = BADGE_CATALOGUE.find(b => b.id === badge_id);
    if (!catalogueBadge) {
      return res.status(400).json({ error: 'Badge not found in catalogue' });
    }
    
    // Check if already earned
    const hasBadge = await Badge.hasBadge(user_id, badge_id);
    if (hasBadge) {
      return res.status(400).json({ error: 'Badge already earned' });
    }
    
    // Award badge
    const awardedBadge = await Badge.award({
      user_id,
      badge_id,
      badge_name: catalogueBadge.name,
      badge_icon: catalogueBadge.icon
    });
    
    // Award points
    await StudentProfile.addPoints(user_id, 200);
    
    res.json({
      ...awardedBadge,
      description: catalogueBadge.description,
      message: `Badge "${catalogueBadge.name}" awarded to user`
    });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

module.exports = router;
