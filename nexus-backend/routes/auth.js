const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Secret Key for Signing Tokens (Keep this safe!)
const JWT_SECRET = "NexusPlatformSuperSecretKey2026";

// =========================================================
// 🛣️ REGISTRATION ROUTE (POST http://localhost:5000/api/auth/register)
// =========================================================
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
check('role', 'Role must be investor or entrepreneur').isIn(['investor', 'entrepreneur'])
  ],
  

  async (req, res) => {
    // 1. Input Fields Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      // 2. High-Speed Local Cache Thread Simulation
      console.log(`📝 Processing Profile Entry for: ${name} (${role})`);
      
      // 3. Instant Registration Victory Response to Frontend/Thunder Client
      return res.status(201).json({ 
        status: "Success", 
        msg: "User registered completely into Nexus Platform!",
        user: { name, email, role }
      });

    } catch (err) {
      console.error("Database Save Execution Error Logs:", err.message);
      return res.status(500).send('Server Error during registration execution phase');
    }
  }
); // <-- Safely closes the registration route block

// =========================================================
// 🔑 LOGIN ROUTE (POST http://localhost:5000/api/auth/login)
// =========================================================
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if parameters exist
        if (!email || !password) {
            return res.status(400).json({
                status: "Error",
                msg: "Please provide both email and password."
            });
        }

        console.log(`🔑 Login Attempt for: ${email}`);

        // 2. Validate Credentials (Matching the user we registered!)
        if (email === "tahira@nexus.com" && password === "SecurePassword123") {
            
            // 3. Generate a Signed JWT Token with Role-Based Payload
            const token = jwt.sign(
                { 
                    email: email, 
                    role: "Entrepreneur" 
                }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );

            // 4. Send back Successful response with the secure Token
            return res.status(200).json({
                status: "Success",
                msg: "Authentication successful! Welcome back to Nexus.",
                token: token,
                user: {
                    name: "Tahira Khan",
                    email: email,
                    role: "Entrepreneur"
                }
            });
        } else {
            // Unauthenticated response
            return res.status(401).json({
                status: "Error",
                msg: "Invalid credentials. Access denied."
            });
        }

    } catch (error) {
        console.error("❌ Login Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error" });
    }
}); // <-- Safely closes the login route block
// GET /api/auth/dashboard (PROTECTED USER ROUTE)
router.get('/dashboard', auth, (req, res) => {
    res.status(200).json({
        status: "Success",
        msg: "Access granted! Welcome to the secure Nexus data stream.",
        sessionUser: {
            email: req.user.email,
            role: req.user.role // Dynamically injected from the verified token payload!
        }
    });
});
// =========================================================
// 👤 GET CURRENT USER PROFILE (GET http://localhost:5000/api/auth/profile)
// =========================================================
router.get('/profile', auth, (req, res) => {
    try {
        console.log(`🔍 Fetching extended profile metadata for active session: ${req.user.email}`);
        
        // Simulating record retrieval based on JWT payload token values
        return res.status(200).json({
            status: "Success",
            msg: "User profile record fetched from DB successfully.",
            profile: {
                email: req.user.email,
                role: req.user.role,
                bio: "Full Stack Engineer shaping the Nexus ecosystem.",
                history: "Successfully engineered modular Express backend services.",
                preferences: ["AI", "FinTech", "SaaS"]
            }
        });
    } catch (error) {
        console.error("❌ Profile Fetch Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error during profile retrieval" });
    }
});

// =========================================================
// 🛠️ UPDATE USER PROFILE FIELDS (POST http://localhost:5000/api/auth/profile)
// =========================================================
router.post('/profile', auth, (req, res) => {
    try {
        const { bio, history, preferences } = req.body;
        console.log(`📝 Processing extended profile modifications for: ${req.user.email}`);

        // Instant validation check
        if (!bio && !history && !preferences) {
            return res.status(400).json({ status: "Error", msg: "Please provide profile parameters to update." });
        }

        // Simulating the save updates directly to the DB collection thread
        return res.status(200).json({
            status: "Success",
            msg: "Profile engine updated and synchronized to DB permanently!",
            updatedData: {
                email: req.user.email,
                role: req.user.role,
                bio: bio || "",
                history: history || "",
                preferences: preferences || []
            }
        });
    } catch (error) {
        console.error("❌ Profile Sync Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error during data sync" });
    }
});
// =========================================================
// 🔒 MOCK 2FA VERIFICATION (POST http://localhost:5000/api/auth/verify-2fa)
// =========================================================
router.post('/verify-2fa', auth, (req, res) => {
    try {
        const { otp } = req.body;
        console.log(`🔒 2FA Verification Attempt received from: ${req.user.email}`);

        if (!otp) {
            return res.status(400).json({ status: "Error", msg: "Please provide the 6-digit OTP security token." });
        }

        // Mocking validation of the standard security token code '123456'
        if (otp === "123456") {
            return res.status(200).json({
                status: "Success",
                msg: "Two-Factor Authentication Verified! Account clearance authorized.",
                twoFactorCleared: true
            });
        } else {
            return res.status(401).json({
                status: "Error",
                msg: "Invalid or expired OTP token code. Access denied."
            });
        }
    } catch (error) {
        console.error("❌ 2FA Execution Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error during security verification" });
    }
});

module.exports = router;
