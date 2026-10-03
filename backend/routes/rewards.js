const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const UnlockedReward = require('../models/UnlockedReward');

// Get all available rewards (static data)
router.get('/available', async (req, res) => {
  try {
    const rewards = {
      avatars: [
        { id: 'avatar_1', name: 'Explorer', cost: 500, icon: '🧭', type: 'avatar' },
        { id: 'avatar_2', name: 'Scholar', cost: 750, icon: '🎓', type: 'avatar' },
        { id: 'avatar_3', name: 'Hero', cost: 1000, icon: '🦸', type: 'avatar' },
        { id: 'avatar_4', name: 'Scientist', cost: 800, icon: '🔬', type: 'avatar' },
        { id: 'avatar_5', name: 'Artist', cost: 600, icon: '🎨', type: 'avatar' }
      ],
      frames: [
        { id: 'frame_1', name: 'Bronze Frame', cost: 300, color: '#cd7f32', type: 'frame' },
        { id: 'frame_2', name: 'Silver Frame', cost: 500, color: '#c0c0c0', type: 'frame' },
        { id: 'frame_3', name: 'Gold Frame', cost: 800, color: '#ffd700', type: 'frame' },
        { id: 'frame_4', name: 'Rainbow Frame', cost: 1200, color: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)', type: 'frame' }
      ],
      themes: [
        { id: 'theme_1', name: 'Ocean Blue', cost: 400, colors: { primary: '#0ea5e9', secondary: '#0284c7' }, type: 'theme' },
        { id: 'theme_2', name: 'Forest Green', cost: 400, colors: { primary: '#22c55e', secondary: '#16a34a' }, type: 'theme' },
        { id: 'theme_3', name: 'Sunset Orange', cost: 400, colors: { primary: '#f97316', secondary: '#ea580c' }, type: 'theme' },
        { id: 'theme_4', name: 'Royal Purple', cost: 600, colors: { primary: '#a855f7', secondary: '#9333ea' }, type: 'theme' }
      ],
      certificates: [
        { id: 'cert_1', name: 'Chapter Completion', cost: 0, autoAward: true },
        { id: 'cert_2', name: 'Weekly Goal Master', cost: 0, autoAward: true },
        { id: 'cert_3', name: 'Subject Champion', cost: 0, autoAward: true },
        { id: 'cert_4', name: 'Academic Excellence', cost: 0, autoAward: true }
      ]
    };
    
    res.json(rewards);
  } catch (error) {
    console.error('Get available rewards error:', error);
    res.status(500).json({ error: 'Failed to get available rewards' });
  }
});

// Get user's unlocked rewards
router.get('/user/:user_id', async (req, res) => {
  try {
    const rewards = await UnlockedReward.findByUserId(req.params.user_id);
    res.json(rewards);
  } catch (error) {
    console.error('Get user rewards error:', error);
    res.status(500).json({ error: 'Failed to get user rewards' });
  }
});

// Get user's rewards by type
router.get('/user/:user_id/:type', async (req, res) => {
  try {
    const rewards = await UnlockedReward.findByType(req.params.user_id, req.params.type);
    res.json(rewards);
  } catch (error) {
    console.error('Get user rewards by type error:', error);
    res.status(500).json({ error: 'Failed to get user rewards by type' });
  }
});

// Record certificate award
router.post('/certificates/award', async (req, res) => {
  try {
    const { user_id, certificate_template_id, certificate_name } = req.body;
    
    const query = `
      INSERT INTO certificate_awards (user_id, certificate_template_id, certificate_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, certificate_template_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(query, [user_id, certificate_template_id, certificate_name]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Award certificate error:', error);
    res.status(500).json({ error: 'Failed to award certificate' });
  }
});

// Get user's certificate awards
router.get('/certificates/user/:user_id', async (req, res) => {
  try {
    const query = `
      SELECT * FROM certificate_awards 
      WHERE user_id = $1 
      ORDER BY awarded_at DESC
    `;
    
    const result = await pool.query(query, [req.params.user_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get certificate awards error:', error);
    res.status(500).json({ error: 'Failed to get certificate awards' });
  }
});

module.exports = router;
