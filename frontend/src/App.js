import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import VncPage from './VncPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/vnc" element={<VncPage />} />
      </Routes>
    </Router>
  );
}

export default App;
