require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, supabase } = require('./config/database');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Make pool and supabase available to routes
app.use((req, res, next) => {
  req.pool = pool;
  req.supabase = supabase;
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'connected', timestamp: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Supabase connection test endpoint
app.get('/health/supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      res.status(500).json({ status: 'error', message: 'Supabase connection failed', error: error.message });
    } else {
      res.json({ status: 'ok', supabase: 'connected' });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Supabase connection failed', error: err.message });
  }
});

// API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/academic-years', require('./routes/academicYears'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/recommendations', require('./routes/recommendations'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app, pool };
