import React, { useEffect, useState } from 'react';
import { useSocket } from '../socket/socket.jsx';
import GameCanvas from '../components/GameCanvas.jsx';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Host = () => {
  const socket = useSocket();
  const [sessionId, setSessionId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.emit('create-session', (response) => {
      if (response.success) {
        setSessionId(response.sessionId);
      }
    });

    socket.on('player-joined', (player) => {
      setPlayers((prev) => [...prev, player]);
    });

    socket.on('player-left', ({ socketId }) => {
      setPlayers((prev) => prev.filter((p) => p.socketId !== socketId));
    });

    socket.on('game-started', () => {
      setGameStarted(true);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-started');
    };
  }, [socket]);

  const handleStartGame = () => {
    socket.emit('start-game', { sessionId });
  };

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          Creating Session...
        </div>
      </div>
    );
  }

  const joinUrl = `http://${window.location.hostname}:5173/join/${sessionId}`;

  if (gameStarted) {
    return <GameCanvas sessionId={sessionId} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row text-white">
      {/* Left side: QR Code and URL */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 border-b md:border-b-0 md:border-r border-slate-800">
        <h2 className="text-3xl font-bold mb-4 text-slate-200">Session ID: <span className="text-indigo-400 tracking-wider font-mono">{sessionId}</span></h2>
        
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-500/10 mb-8">
          <QRCodeSVG value={joinUrl} size={256} bgColor={"#ffffff"} fgColor={"#0f172a"} level={"Q"} />
        </div>
        
        <p className="text-slate-400 text-lg mb-2">Scan QR or go to:</p>
        <code className="bg-slate-800 px-4 py-2 rounded-lg text-cyan-400 font-mono text-xl">{joinUrl}</code>
      </div>

      {/* Right side: Players List */}
      <div className="w-full md:w-1/3 min-w-[320px] bg-slate-800/50 p-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Users className="text-indigo-400" />
            Connected Players
          </h3>
          <span className="bg-indigo-500 px-3 py-1 rounded-full text-sm font-medium">{players.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          <AnimatePresence>
            {players.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-slate-500 text-center py-12"
              >
                Waiting for players to join...
              </motion.div>
            ) : (
              players.map((player) => (
                <motion.div
                  key={player.socketId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-slate-800 p-4 rounded-xl flex items-center gap-4 border border-slate-700 shadow-sm"
                >
                  <div 
                    className="w-10 h-10 rounded-full shadow-inner" 
                    style={{ backgroundColor: player.color }}
                  ></div>
                  <span className="font-medium text-lg text-slate-200">{player.name}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8">
          <button
            onClick={handleStartGame}
            disabled={players.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              players.length > 0 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play fill="currentColor" className="w-6 h-6" />
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Host;
