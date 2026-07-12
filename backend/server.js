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

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// Connect for all routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Original local listen fallback
if (require.main === module) {
  connectDB().then(() => {
    app.listen(process.env.PORT || 5000, () => console.log('Server running on port ' + (process.env.PORT || 5000)));
  });
}

module.exports = app;