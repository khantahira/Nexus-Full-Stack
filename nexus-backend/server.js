// ==========================================
// 1. IMPORTING CORE PACKAGES & TOOLS
// ==========================================
const express = require('express');    
const mongoose = require('mongoose');  
const cors = require('cors');          
const helmet = require('helmet'); 
const http = require('http'); // Native Node module for server mapping
const { Server } = require('socket.io'); // Socket.io engine for WebRTC signaling
const connectDB = require('./config/db');

require('dotenv').config();            

// ==========================================
// 2. INITIALIZING THE EXPRESS APP & SERVER CLUSTER
// ==========================================
const app = express();
const server = http.createServer(app); // Linking Express into the HTTP cluster
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 

// Initialize Database Configuration Layer
connectDB();

// ==========================================
// 3. MIDDLEWARE LAYER (TRAFFIC SHIELDS)
// ==========================================
app.use(helmet({ contentSecurityPolicy: false })); // Keeps CSP clear for stream connections
app.use(cors({
  origin: ['http://localhost:5173', 'https://vercel.app'],
  credentials: true
}));
                     
app.use(express.json());               

// ==========================================
// 4. REST ROUTING CONTROLLERS
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({ status: "Success", message: "Welcome to the Nexus Real-Time Core API Engine!" });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/payments', require('./routes/payments'));


// ==========================================
// 5. 📞 WEBRTC REAL-TIME SIGNALING SERVER ENGINE (SOCKET.IO)
// ==========================================
const io = new Server(server, {
  cors: {
    origin: "*", // Allows any frontend dev client instance to bridge calls
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Real-Time Node Linked: Client Device Connected -> ${socket.id}`);

  // Flow A: User joins a specific call room instance
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log(`👥 Connection Room Link: User [${userId}] entered video room [${roomId}]`);
    
    // Notify other participants in the room to initiate their peer cameras
    socket.to(roomId).emit('user-connected', userId);

    // Flow B: Toggle audio/video status signals across peers
    socket.on('toggle-media', (state) => {
      socket.to(roomId).emit('peer-media-toggled', { userId, state });
    });

    // Flow C: Disconnect / End video session cleanly
    socket.on('disconnect', () => {
      console.log(`❌ Link Severed: User [${userId}] left call room [${roomId}]`);
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});

// ==========================================
// 6. STARTING THE WEB & SOCKET CORES
// ==========================================
// IMPORTANT: We now listen via 'server', NOT 'app' to keep WebSockets alive!
server.listen(PORT, () => {
  console.log(`📡 Server & WebRTC Engine actively listening on: http://localhost:${PORT}`);
});
