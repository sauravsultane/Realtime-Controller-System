import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../socket/socket.jsx';
import { Zap } from 'lucide-react';

const Controller = () => {
  const { sessionId } = useParams();
  const socket = useSocket();
  const joystickRef = useRef(null);
  
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Joystick center coordinates
  const centerRef = useRef({ x: 0, y: 0 });
  const maxRadius = 60; // Max distance for stick

  useEffect(() => {
    // Prevent default touch behaviors (like scrolling) to maintain controller feel
    const preventDefault = (e) => e.preventDefault();
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    // We send periodic updates while dragging
    let intervalId;
    if (isDragging) {
      intervalId = setInterval(() => {
        emitInput();
      }, 50); // 20 updates per second
    } else {
      // Send a neutral state once when stopped
      emitInput({ x: 0, y: 0, action: false });
    }

    return () => {
      document.removeEventListener('touchmove', preventDefault);
      clearInterval(intervalId);
    };
  }, [isDragging, joystickPos]);

  const emitInput = (overridePos = null, overrideAction = false) => {
    if (!socket || !sessionId) return;
    
    // Normalize x, y between -1 and 1 based on maxRadius
    const pos = overridePos || joystickPos;
    const normalizedX = pos.x / maxRadius;
    const normalizedY = pos.y / maxRadius;

    socket.emit('controller-input', {
      sessionId,
      x: normalizedX,
      y: normalizedY,
      action: overrideAction
    });
  };

  const handleTouchStart = (e) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    setIsDragging(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    // Use the first touch
    const touch = e.touches[0];
    
    let deltaX = touch.clientX - centerRef.current.x;
    let deltaY = touch.clientY - centerRef.current.y;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxRadius) {
      const ratio = maxRadius / distance;
      deltaX *= ratio;
      deltaY *= ratio;
    }
    
    setJoystickPos({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setJoystickPos({ x: 0, y: 0 });
  };

  const handleActionTouch = () => {
    if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
    emitInput(joystickPos, true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-between py-12 px-8 safe-area select-none overflow-hidden touch-none">
      
      {/* Top Header */}
      <div className="w-full flex justify-between items-center px-4">
        <div className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700 font-mono text-cyan-400 font-bold tracking-wider">
          {sessionId}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Connected
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col sm:flex-row items-center justify-center sm:justify-between px-4 sm:px-12 gap-12 sm:gap-0 mt-8 mb-8">
        
        {/* Joystick Area */}
        <div 
          className="relative w-48 h-48 bg-slate-800/80 rounded-full border-4 border-slate-700 shadow-inner flex items-center justify-center isolate"
          ref={joystickRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {/* Stick visual */}
          <div 
            className="absolute w-20 h-20 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full shadow-lg shadow-black/50 border-2 border-slate-500 z-10 transition-transform duration-75 ease-out"
            style={{ 
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          ></div>
        </div>

        {/* Action Button Area */}
        <div className="flex items-center justify-center">
          <button 
            className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.4)] border-4 border-pink-400/50 flex items-center justify-center active:scale-95 active:shadow-inner transition-transform"
            onTouchStart={handleActionTouch}
          >
            <Zap className="w-12 h-12 text-white/90 drop-shadow-md" fill="currentColor" />
          </button>
        </div>

      </div>

      {/* Visual instructions */}
      <div className="text-slate-500 text-sm uppercase tracking-widest font-bold">
        Controller Active
      </div>
    </div>
  );
};

export default Controller;
