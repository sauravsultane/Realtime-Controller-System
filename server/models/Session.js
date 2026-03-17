import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(6).toUpperCase(), // e.g. "A1B2C3"
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Sessions expire after 24 hours
  },
});

export default mongoose.model('Session', sessionSchema);
