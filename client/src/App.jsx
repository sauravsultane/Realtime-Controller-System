import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './socket/socket.jsx';

import Home from './pages/Home.jsx';
import Host from './pages/Host.jsx';
import Join from './pages/Join.jsx';
import Controller from './pages/Controller.jsx';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<Host />} />
          <Route path="/join/:sessionId" element={<Join />} />
          <Route path="/controller/:sessionId" element={<Controller />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
