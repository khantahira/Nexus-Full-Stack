// ==========================================
// NEXUS BACKEND SERVER - PRODUCTION READY
// ==========================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const connectDB = require('./config/db');

// ==========================================
// INITIALIZE APP & SERVER
// ==========================================
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(helmet({ contentSecurityPolicy: false }));


app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://your-vercel-frontend-url.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

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
// SOCKET.IO - WEBRTC SIGNALING
// ==========================================

 const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      process.env.FRONTEND_URL || 'https://your-vercel-frontend-url.vercel.app'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 User Connected: ${socket.id}`);

  // Join Video Call Room
  socket.on('join-room', ({ roomId, userId }) => {
    if (!roomId || !userId) return;

    socket.join(roomId);
    console.log(`👥 User ${userId} joined room: ${roomId}`);

    socket.to(roomId).emit('user-connected', { userId, socketId: socket.id });
  });

  // WebRTC Signaling
  socket.on('offer', ({ offer, target }) => {
    socket.to(target).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ answer, target }) => {
    socket.to(target).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, target }) => {
    socket.to(target).emit('ice-candidate', { candidate, from: socket.id });
  });

  // Media Toggle
  socket.on('toggle-media', ({ roomId, type, enabled }) => {
    socket.to(roomId).emit('media-toggled', {
      from: socket.id,
      type,
      enabled
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
    io.emit('user-disconnected', socket.id);
  });
});

// ==========================================
// START SERVER
// ==========================================
server.listen(PORT, () => {
  console.log(`🚀 Nexus Server Running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io WebRTC Signaling Active`);
});