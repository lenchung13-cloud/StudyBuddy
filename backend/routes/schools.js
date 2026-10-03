const express = require('express');
const router = express.Router();
const School = require('../models/School');

// Get all schools
router.get('/', async (req, res) => {
  try {
    const schools = await School.findAll();
    res.json(schools);
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ error: 'Failed to get schools' });
  }
});

// Get school by ID
router.get('/:id', async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.json(school);
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ error: 'Failed to get school' });
  }
});

// Create school
router.post('/', async (req, res) => {
  try {
    const { name, location, contact_email } = req.body;
    const school = await School.create({ name, location, contact_email });
    res.json(school);
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({ error: 'Failed to create school' });
  }
});

// Update school
router.put('/:id', async (req, res) => {
  try {
    const school = await School.update(req.params.id, req.body);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.json(school);
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ error: 'Failed to update school' });
  }
});

// Delete school
router.delete('/:id', async (req, res) => {
  try {
    const school = await School.delete(req.params.id);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ error: 'Failed to delete school' });
  }
});

module.exports = router;
