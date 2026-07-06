const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register User Function
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({ name, email, password, role });
    await user.save();

    // Generate JWT
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallbackSecret', { expiresIn: '7d' });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error inside register controller' });
  }
};

// Login User Function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT for Login
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallbackSecret', { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error inside login controller' });
  }
};

module.exports = {
  register,
  login
};
