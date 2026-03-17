import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, MonitorPlay } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-900 text-white">
      <div className="flex items-center gap-4 mb-8">
        <Gamepad2 className="w-16 h-16 text-indigo-500" />
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          SyncPlay
        </h1>
      </div>
      
      <p className="text-slate-400 mb-12 text-lg text-center max-w-md">
        A real-time multiplayer experience where your phone is the controller.
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <button
          onClick={() => navigate('/host')}
          className="flex flex-col items-center justify-center gap-3 w-48 h-48 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all border border-slate-700 hover:border-indigo-500 shadow-lg hover:shadow-indigo-500/20 group"
        >
          <MonitorPlay className="w-12 h-12 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span className="text-xl font-medium">Host a Game</span>
        </button>

        <button
          onClick={() => navigate('/join/manual')}
          className="flex flex-col items-center justify-center gap-3 w-48 h-48 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all border border-slate-700 hover:border-cyan-500 shadow-lg hover:shadow-cyan-500/20 group"
        >
          <Gamepad2 className="w-12 h-12 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <span className="text-xl font-medium">Join a Game</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
