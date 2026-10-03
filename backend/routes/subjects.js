const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');

// Create subject
router.post('/', async (req, res) => {
  try {
    const { school_id, name, description, chapters } = req.body;
    
    const subject = await Subject.create({
      school_id,
      name,
      description
    });
    
    // Create chapters if provided
    if (chapters && Array.isArray(chapters)) {
      for (let i = 0; i < chapters.length; i++) {
        await Chapter.create({
          subject_id: subject.id,
          chapter_number: i + 1,
          chapter_name: chapters[i].name,
          description: chapters[i].description
        });
      }
    }
    
    // Return subject with chapters
    const subjectWithChapters = await Subject.findById(subject.id);
    res.json(subjectWithChapters);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Get all subjects for a school
router.get('/school/:school_id', async (req, res) => {
  try {
    const subjects = await Subject.findBySchoolId(req.params.school_id);
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to get subjects' });
  }
});

// Get subject by ID
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Failed to get subject' });
  }
});

// Update subject
router.put('/:id', async (req, res) => {
  try {
    const subject = await Subject.update(req.params.id, req.body);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Delete subject
router.delete('/:id', async (req, res) => {
  try {
    const subject = await Subject.delete(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// Add chapter to subject
router.post('/:id/chapters', async (req, res) => {
  try {
    const { chapter_number, chapter_name, description } = req.body;
    
    const chapter = await Chapter.create({
      subject_id: req.params.id,
      chapter_number,
      chapter_name,
      description
    });
    
    res.json(chapter);
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

module.exports = router;
