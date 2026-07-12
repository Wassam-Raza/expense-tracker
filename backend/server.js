require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.get('/', (_,res) => res.json({ message: 'Expense Tracker API running' }));
app.get('/api/test-db', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
      status: states[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    if (require.main === module) {
      app.listen(process.env.PORT || 5000, () => console.log('Server running on port ' + (process.env.PORT || 5000)));
    }
  })
  .catch(err => { console.error(err.message); });

module.exports = app;