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
app.use(cors({
  origin: true,
  credentials: true
}));

app.options('*', cors());

// Health Check
app.get('/', (req, res) => res.json({ status: "Success", message: "Nexus Backend Running" }));

// Only Auth Route for now (to make it stable)
app.use('/api/auth', require('./routes/auth'));

// Connect Database
connectDB();

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});