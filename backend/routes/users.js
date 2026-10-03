const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { verifySupabaseToken } = require('../middleware/auth');
const { supabase } = require('../config/database');

// Generate privacy alias
const generatePrivacyAlias = () => {
  const adjectives = ['Brave', 'Swift', 'Wise', 'Bright', 'Kind', 'Bold', 'Calm', 'Eager'];
  const animals = ['Lion', 'Eagle', 'Dolphin', 'Wolf', 'Fox', 'Hawk', 'Bear', 'Tiger'];
  const numbers = Math.floor(Math.random() * 99) + 1;
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  
  return `${adj}${animal}${numbers}`;
};

// Register new user (Supabase handles auth, this creates profile)
router.post('/register', verifySupabaseToken, async (req, res) => {
  try {
    const { full_name, school_id, grade_level } = req.body;
    const userId = req.userId;
    const userEmail = req.userEmail;
    
    // Check if profile already exists
    const existingProfile = await StudentProfile.findById(userId);
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists' });
    }
    
    // Create user in local database
    const user = await User.create({
      id: userId,
      email: userEmail,
      password_hash: '', // Not used with Supabase auth
      role: 'student'
    });
    
    // Create student profile
    const privacy_alias = generatePrivacyAlias();
    await StudentProfile.create({
      id: userId,
      school_id,
      full_name,
      age: null,
      grade_level,
      avatar_url: null,
      privacy_alias,
      academic_year_id: null
    });
    
    res.status(201).json({
      message: 'Profile created successfully',
      user: {
        id: userId,
        email: userEmail,
        role: 'student',
        privacy_alias
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login (Supabase handles this, this endpoint syncs user to local DB)
router.post('/login', verifySupabaseToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userEmail = req.userEmail;
    
    // Check if user exists in local DB
    let user = await User.findById(userId);
    
    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        id: userId,
        email: userEmail,
        password_hash: '',
        role: 'student'
      });
    }
    
    // Get user profile
    const profile = await StudentProfile.findById(userId);
    
    res.json({
      message: 'Login successful',
      user: {
        id: userId,
        email: userEmail,
        role: user.role,
        profile: profile || null
      }
    });
  } catch (error) {
    console.error('Login sync error:', error);
    res.status(500).json({ error: 'Login sync failed' });
  }
});

// Get user by ID with profile
router.get('/:id', verifySupabaseToken, async (req, res) => {
  try {
    // Users can only access their own data
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await User.findByIdWithProfile(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user
router.put('/:id', verifySupabaseToken, async (req, res) => {
  try {
    // Users can only update their own data
    if (req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { full_name, age, grade_level, avatar_url, school_id } = req.body;
    
    await StudentProfile.update(req.params.id, {
      full_name,
      age,
      grade_level,
      avatar_url,
      school_id
    });
    
    const updatedUser = await User.findByIdWithProfile(req.params.id);
    const { password_hash: _, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.delete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json({ message: 'User deleted successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
