const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Investor', 'Entrepreneur'] // Enforces role-based rules!
  },
  // Extended Profile Fields required by your Nexus Blueprint:
  bio: {
    type: String,
    default: ''
  },
  history: {
    type: String, // Extended startup history or investment track-record
    default: ''
  },
  preferences: {
    type: [String], // Array of industries like ['FinTech', 'SaaS', 'AI']
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
