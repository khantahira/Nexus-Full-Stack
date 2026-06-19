// ==========================================
// NEXUS BACKEND - STABLE VERSION
// ==========================================

const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Simple & Working
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-auth-token", "Authorization"],
  credentials: true
}));

// Health Route
app.get('/', (req, res) => {
  res.json({ status: "Success", message: "Nexus Backend Running 🚀" });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/payments', require('./routes/payments'));

// Database
connectDB();

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nexus Server Running on port ${PORT}`);
});