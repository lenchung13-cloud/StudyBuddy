const express = require('express');
const router = express.Router();
const AcademicYear = require('../models/AcademicYear');
const School = require('../models/School');
const StudentProfile = require('../models/StudentProfile');

// Create academic year
router.post('/', async (req, res) => {
  try {
    const { school_id, year_name, start_date, end_date } = req.body;
    
    const academicYear = await AcademicYear.create({
      school_id,
      year_name,
      start_date,
      end_date
    });
    
    res.json(academicYear);
  } catch (error) {
    console.error('Create academic year error:', error);
    res.status(500).json({ error: 'Failed to create academic year' });
  }
});

// Get academic year by ID
router.get('/:id', async (req, res) => {
  try {
    const academicYear = await AcademicYear.findById(req.params.id);
    if (!academicYear) {
      return res.status(404).json({ error: 'Academic year not found' });
    }
    
    res.json(academicYear);
  } catch (error) {
    console.error('Get academic year error:', error);
    res.status(500).json({ error: 'Failed to get academic year' });
  }
});

// Get academic years by school ID
router.get('/school/:school_id', async (req, res) => {
  try {
    const academicYears = await AcademicYear.findBySchoolId(req.params.school_id);
    res.json(academicYears);
  } catch (error) {
    console.error('Get academic years error:', error);
    res.status(500).json({ error: 'Failed to get academic years' });
  }
});

// Get academic year tracking with calculations for a user
router.get('/tracking/:user_id', async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.user_id);
    if (!profile || !profile.academic_year_id) {
      return res.status(404).json({ error: 'Academic year not found for user' });
    }

    const academicYear = await AcademicYear.findById(profile.academic_year_id);
    const school = await School.findById(profile.school_id);

    const startDate = new Date(academicYear.start_date);
    const endDate = new Date(academicYear.end_date);
    const today = new Date();

    // Calculate days remaining
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    // Calculate total days in academic year
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Calculate days elapsed
    const daysElapsed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));

    // Calculate weeks completed
    const weeksCompleted = Math.floor(daysElapsed / 7);

    // Calculate total weeks
    const totalWeeks = Math.ceil(totalDays / 7);

    // Calculate progress percentage
    const progressPercentage = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));

    // Calculate weekly targets (10 hours per week, 2 hours per day except Sunday)
    const weeklyTargetHours = 10;
    const dailyTargetHours = 2;
    const studyDaysPerWeek = 6; // Monday to Saturday

    // Calculate monthly milestones (approximate)
    const monthsRemaining = Math.ceil(daysRemaining / 30);
    const totalMonths = Math.ceil(totalDays / 30);
    const monthsCompleted = totalMonths - monthsRemaining;

    res.json({
      school_name: school?.name || 'Unknown School',
      grade_level: profile.grade_level,
      academic_year: academicYear.year_name,
      start_date: academicYear.start_date,
      end_date: academicYear.end_date,
      days_remaining: Math.max(0, daysRemaining),
      days_elapsed: Math.max(0, daysElapsed),
      total_days: totalDays,
      weeks_completed: Math.max(0, weeksCompleted),
      total_weeks: totalWeeks,
      progress_percentage: Math.round(progressPercentage),
      weekly_target_hours: weeklyTargetHours,
      daily_target_hours: dailyTargetHours,
      study_days_per_week: studyDaysPerWeek,
      months_remaining: Math.max(0, monthsRemaining),
      total_months: totalMonths,
      months_completed: Math.max(0, monthsCompleted)
    });
  } catch (error) {
    console.error('Get academic year tracking error:', error);
    res.status(500).json({ error: 'Failed to get academic year tracking' });
  }
});

// Update academic year
router.put('/:id', async (req, res) => {
  try {
    const academicYear = await AcademicYear.update(req.params.id, req.body);
    if (!academicYear) {
      return res.status(404).json({ error: 'Academic year not found' });
    }
    
    res.json(academicYear);
  } catch (error) {
    console.error('Update academic year error:', error);
    res.status(500).json({ error: 'Failed to update academic year' });
  }
});

// Delete academic year
router.delete('/:id', async (req, res) => {
  try {
    const academicYear = await AcademicYear.delete(req.params.id);
    if (!academicYear) {
      return res.status(404).json({ error: 'Academic year not found' });
    }
    
    res.json({ message: 'Academic year deleted successfully' });
  } catch (error) {
    console.error('Delete academic year error:', error);
    res.status(500).json({ error: 'Failed to delete academic year' });
  }
});

module.exports = router;
