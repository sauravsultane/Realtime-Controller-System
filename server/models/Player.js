import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    ref: 'Session'
  },
  socketId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#ffffff',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Player', playerSchema);
