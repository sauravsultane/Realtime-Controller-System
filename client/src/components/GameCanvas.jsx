import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../socket/socket.jsx';

const GameCanvas = ({ sessionId }) => {
  const canvasRef = useRef(null);
  const socket = useSocket();
  const [gameState, setGameState] = useState({ players: [] });
  
  // Listen for game state updates
  useEffect(() => {
    if (!socket) return;
    
    socket.on('game-state-update', (state) => {
      setGameState(state);
    });
    
    return () => {
      socket.off('game-state-update');
    };
  }, [socket]);

  // Render loop based on state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a'; // slate-900 background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw players
      gameState.players.forEach(player => {
        // Draw shadow
        ctx.beginPath();
        ctx.arc(player.x, player.y + 6, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // Draw Player Ship/Dot
        ctx.beginPath();
        ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = player.color || '#fff';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff33';
        ctx.stroke();

        // Draw Player Name
        ctx.fillStyle = '#fff';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x, player.y - 30);
      });

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pointer-events-none">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4">
           <span className="text-slate-400 font-medium">Session</span>
           <span className="text-indigo-400 font-mono text-xl tracking-wider font-bold">{sessionId}</span>
        </div>
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 px-6 py-3 rounded-2xl shadow-xl">
           <span className="text-slate-200 font-bold">{gameState.players.length} Players Active</span>
        </div>
      </div>
      
      {/* Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
        width={1024} 
        height={768}
        // In a real app we'd resize window logic here, keeping it fixed for logic simplicity
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
};

export default GameCanvas;
