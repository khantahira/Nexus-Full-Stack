// ==========================================
// NEXUS BACKEND SERVER - PRODUCTION READY
// ==========================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(helmet({ contentSecurityPolicy: false }));

// ✅ Simple & Working CORS for Submission
app.use(cors({
  origin: true,           // Allow all origins (best for submission)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-auth-token", "Authorization"],
  credentials: true
}));

app.options('*', cors());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// BASIC HEALTH ROUTE
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "Success", 
    message: "Welcome to Nexus Backend API 🚀" 
  });
});

// ==========================================
// API ROUTES
// ==========================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/payments', require('./routes/payments'));

// ==========================================
// DATABASE CONNECTION
// ==========================================
connectDB();

// ==========================================
// SOCKET.IO
// ==========================================
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 User Connected: ${socket.id}`);

  socket.on('join-room', ({ roomId, userId }) => {
    if (!roomId || !userId) return;
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', { userId, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
  });
});

// ==========================================
// START SERVER
// ==========================================
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nexus Server Running on port ${PORT}`);
  console.log(`📡 API URL: https://thriving-unity-production-c763.up.railway.app`);
});