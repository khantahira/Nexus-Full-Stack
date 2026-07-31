const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    required: true, 
    minlength: 6 
  },
  role: { 
    type: String, 
    enum: ['entrepreneur', 'investor'], 
    required: true 
  },

  // ===== Profile Fields =====
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },

  // For Entrepreneur
  startupName: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  fundingStage: {
    type: String,
    default: ''
  },
  pitch: {
    type: String,
    default: ''
  },

  // For Investor
  investmentFocus: {
    type: String,
    default: ''
  },
  investmentRange: {
    type: String,
    default: ''
  },
  preferredStages: {
    type: [String],
    default: []
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);