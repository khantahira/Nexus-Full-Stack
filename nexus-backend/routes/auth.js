// ==========================================
// NEXUS - AUTH ROUTES (Real Implementation)
// ==========================================
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/User');

// JWT Secret from .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in .env file!");
}

// ====================== REGISTER ======================
router.post('/register', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('role', 'Role must be either entrepreneur or investor').isIn(['entrepreneur', 'investor'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: "Error", 
      errors: errors.array() 
    });
  }

  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ 
        status: "Error", 
        msg: "User already exists with this email" 
      });
    }

    user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: "Success",
      token,
      user: { name, email, role }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "Error", 
      msg: "Server Error" 
    });
  }
});

// ====================== LOGIN ======================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        status: "Error", 
        msg: "Invalid credentials" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ 
        status: "Error", 
        msg: "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: "Success",
      token,
      user: { 
        id: user.id,
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "Error", 
      msg: "Server Error" 
    });
  }
});

// ====================== GET PROFILE (Protected) ======================
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: "Error", msg: "User not found" });
    }
    res.json({ status: "Success", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Error", msg: "Server Error" });
  }
});

module.exports = router;