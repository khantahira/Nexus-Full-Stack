const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registration Method
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists matching this configuration parameters' });
    }

    user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });
    return res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (err) {
    console.error("❌ Register Engine Core Error Stack:", err.message);
    return res.status(500).json({ message: 'Server exception encountered inside authentication register middleware modules' });
  }
};

// Login System Fixed to map with User Instance validation schema custom function wrappers
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid server authentication validation records mismatch parameters' });
    }

    // ✅ Fix: Call the clean model custom reference compare handler instead of standalone method operations
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid server authentication validation records mismatch parameters' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });
    return res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("❌ Login Engine Core Error Stack:", err.message);
    return res.status(500).json({ message: 'Server exception encountered inside authentication login middleware modules' });
  }
};

// Authentication Verification Route Data Element
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Server user retrieval runtime exceptions detected' });
  }
};
