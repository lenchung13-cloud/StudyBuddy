const express = require('express');
const router = express.Router();
const StudentProfile = require('../models/StudentProfile');
const Badge = require('../models/Badge');
const UnlockedReward = require('../models/UnlockedReward');

// Get gamification data for a user
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.user_id);
    
    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    
    res.json({
      total_points: profile.total_points,
      current_level: profile.current_level,
      streak_days: profile.streak_days,
      last_study_date: profile.last_study_date
    });
  } catch (error) {
    console.error('Get gamification error:', error);
    res.status(500).json({ error: 'Failed to get gamification data' });
  }
});

// Add points to user
router.post('/add-points', async (req, res) => {
  try {
    const { user_id, points } = req.body;
    
    const profile = await StudentProfile.addPoints(user_id, points);
    res.json(profile);
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

// Update streak
router.put('/streak/:user_id', async (req, res) => {
  try {
    const { streak_days } = req.body;
    
    const profile = await StudentProfile.updateStreak(req.params.user_id, streak_days);
    res.json(profile);
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
});

// Get badges for a user
router.get('/badges/:user_id', async (req, res) => {
  try {
    const badges = await Badge.findByUserId(req.params.user_id);
    res.json(badges);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

// Award badge to user
router.post('/badges/award', async (req, res) => {
  try {
    const { user_id, badge_id, badge_name, badge_icon } = req.body;
    
    // Check if already has badge
    const hasBadge = await Badge.hasBadge(user_id, badge_id);
    if (hasBadge) {
      return res.status(400).json({ error: 'Badge already awarded' });
    }
    
    const badge = await Badge.award({
      user_id,
      badge_id,
      badge_name,
      badge_icon
    });
    
    // Award points for earning badge
    await StudentProfile.addPoints(user_id, 200);
    
    res.json(badge);
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

// Get unlocked rewards for a user
router.get('/rewards/:user_id', async (req, res) => {
  try {
    const rewards = await UnlockedReward.findByUserId(req.params.user_id);
    res.json(rewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ error: 'Failed to get rewards' });
  }
});

// Unlock reward for user
router.post('/rewards/unlock', async (req, res) => {
  try {
    const { user_id, reward_type, reward_id, cost } = req.body;
    
    // Check if already unlocked
    const hasReward = await UnlockedReward.hasReward(user_id, reward_type, reward_id);
    if (hasReward) {
      return res.status(400).json({ error: 'Reward already unlocked' });
    }
    
    // Check if user has enough points
    const profile = await StudentProfile.findById(user_id);
    if (!profile || profile.total_points < cost) {
      return res.status(400).json({ error: 'Not enough points' });
    }
    
    // Deduct points
    await StudentProfile.addPoints(user_id, -cost);
    
    // Unlock reward
    const reward = await UnlockedReward.unlock({
      user_id,
      reward_type,
      reward_id
    });
    
    res.json(reward);
  } catch (error) {
    console.error('Unlock reward error:', error);
    res.status(500).json({ error: 'Failed to unlock reward' });
  }
});

module.exports = router;
