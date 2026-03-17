import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../socket/socket.jsx';
import { Gamepad2, ArrowRight } from 'lucide-react';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const Join = () => {
  const { sessionId: paramSessionId } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();
  
  const [sessionId, setSessionId] = useState(paramSessionId !== 'manual' ? paramSessionId : '');
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !sessionId.trim() || !socket) return;
    
    setIsJoining(true);
    setError('');

    socket.emit('join-session', { sessionId, name, color }, (response) => {
      if (response.success) {
        navigate(`/controller/${sessionId}`);
      } else {
        setError(response.error || 'Failed to join session');
        setIsJoining(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white safe-area">
      <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-700/50 p-4 rounded-full mb-4">
            <Gamepad2 className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold">Join Game</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Session ID</label>
            <input
              type="text"
              required
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3"
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-lg font-mono outline-none transition-all placeholder:text-slate-600 uppercase tracking-widest text-center"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Player 1"
              maxLength={12}
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-lg font-medium outline-none transition-all placeholder:text-slate-600 text-center"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm font-medium mb-3">Choose Color</label>
            <div className="flex justify-between gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-800 shadow-lg' : 'hover:scale-110 opacity-70'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isJoining || !name.trim() || !sessionId.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isJoining ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Ready to Play <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Join;
