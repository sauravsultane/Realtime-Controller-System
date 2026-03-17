// server/socket/socketHandler.js
import Session from '../models/Session.js';
import Player from '../models/Player.js';
import { addPlayerToGame, removePlayerFromGame, updatePlayerInput, startGameLoop, stopGameLoop } from '../game/gameEngine.js';

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Host requests a new session
    socket.on('create-session', async (callback) => {
      try {
        const session = new Session();
        await session.save();
        socket.join(session.sessionId); // Host joins to receive player updates
        callback({ success: true, sessionId: session.sessionId });
      } catch (error) {
        console.error('Error creating session:', error);
        callback({ success: false, error: 'Failed to create session' });
      }
    });

    // Player joins a session
    socket.on('join-session', async ({ sessionId, name, color }, callback) => {
      try {
        const session = await Session.findOne({ sessionId });
        if (!session) {
          return callback({ success: false, error: 'Session not found' });
        }
        if (session.status !== 'waiting') {
           return callback({ success: false, error: 'Session already started' });
        }

        socket.join(sessionId);

        // We can just use memory for active players to be fast, but keeping DB for logs
        const player = new Player({ sessionId, socketId: socket.id, name, color });
        await player.save();

        addPlayerToGame(sessionId, socket.id, { name, color });

        // Notify host
        io.to(sessionId).emit('player-joined', { socketId: socket.id, name, color });
        
        callback({ success: true });
      } catch (error) {
        console.error('Error joining session:', error);
        callback({ success: false, error: 'Failed to join session' });
      }
    });

    // Player sends input
    socket.on('controller-input', (inputData) => {
      // inputData: { sessionId, x, y, action, ... }
      if (inputData.sessionId) {
        updatePlayerInput(inputData.sessionId, socket.id, inputData);
      }
    });

    // Host starts game
    socket.on('start-game', async ({ sessionId }) => {
       await Session.updateOne({ sessionId }, { status: 'playing' });
       io.to(sessionId).emit('game-started');
       startGameLoop(io, sessionId);
    });

    // Disconnect handling
    socket.on('disconnect', async () => {
      console.log(`Disconnected: ${socket.id}`);
      // Find if this socket was a player
      const player = await Player.findOne({ socketId: socket.id });
      if (player) {
        const sessionId = player.sessionId;
        await Player.deleteOne({ socketId: socket.id });
        removePlayerFromGame(sessionId, socket.id);
        io.to(sessionId).emit('player-left', { socketId: socket.id });
      }
    });
  });
}
