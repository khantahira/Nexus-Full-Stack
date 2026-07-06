const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Routes definitions (Yahaan sirf req aur res handling hoti hai)
router.post('/register', (req, res) => register(req, res));
router.post('/login', (req, res) => login(req, res));

module.exports = router;
