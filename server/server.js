// server/server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocketHandlers } from './socket/socketHandler.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for dev. In prod, lock this down.
    methods: ['GET', 'POST']
  }
});

// Setup Socket handlers
setupSocketHandlers(io);

// Basic route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realtime_game';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
