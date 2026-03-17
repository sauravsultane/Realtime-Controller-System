// server/game/gameEngine.js
const activeGames = {}; // sessionId -> { players: { socketId: { x, y, dx, dy, color, name } } }

// Add a player to a game session
export function addPlayerToGame(sessionId, socketId, { name, color }) {
  if (!activeGames[sessionId]) {
    activeGames[sessionId] = { players: {} };
  }
  
  activeGames[sessionId].players[socketId] = {
    socketId,
    name,
    color,
    x: 400 + Math.random() * 200, // random start pos around center
    y: 300 + Math.random() * 200,
    dx: 0,
    dy: 0,
    score: 0
  };
}

// Remove player
export function removePlayerFromGame(sessionId, socketId) {
  if (activeGames[sessionId] && activeGames[sessionId].players[socketId]) {
    delete activeGames[sessionId].players[socketId];
  }
}

// Update player inputs from controller
export function updatePlayerInput(sessionId, socketId, inputData) {
  if (activeGames[sessionId] && activeGames[sessionId].players[socketId]) {
    const player = activeGames[sessionId].players[socketId];
    
    // inputData: { x: Number (-1 to 1), y: Number (-1 to 1), action: Boolean }
    if (inputData.x !== undefined) player.dx = inputData.x * 5; // speed multiplier
    if (inputData.y !== undefined) player.dy = inputData.y * 5; 
    
    // handle actions (like shooting, boosting, etc)
    if (inputData.action) {
       // example: speed boost
       player.dx *= 2;
       player.dy *= 2;
    }
  }
}

// Game loop logic
const gameLoops = {};

export function startGameLoop(io, sessionId) {
  if (gameLoops[sessionId]) return; // Already running

  const TICK_RATE = 1000 / 60; // 60 FPS

  gameLoops[sessionId] = setInterval(() => {
    if (!activeGames[sessionId]) return;
    
    const game = activeGames[sessionId];
    const state = { players: [] };
    
    // Physics and constraints
    for (const socketId in game.players) {
      const player = game.players[socketId];
      
      // Update position
      player.x += player.dx;
      player.y += player.dy;
      
      // Simple bounds checking (assuming canvas of 1024x768 approx)
      if (player.x < 20) { player.x = 20; player.dx = 0; }
      if (player.x > 1004) { player.x = 1004; player.dx = 0; }
      if (player.y < 20) { player.y = 20; player.dy = 0; }
      if (player.y > 748) { player.y = 748; player.dy = 0; }
      
      // Add to state update
      state.players.push({
        socketId: player.socketId,
        name: player.name,
        color: player.color,
        x: player.x,
        y: player.y
      });
    }
    
    // Broadcast state to host screen for this session
    io.to(sessionId).emit('game-state-update', state);
    
  }, TICK_RATE);
}

export function stopGameLoop(sessionId) {
  if (gameLoops[sessionId]) {
    clearInterval(gameLoops[sessionId]);
    delete gameLoops[sessionId];
  }
}
