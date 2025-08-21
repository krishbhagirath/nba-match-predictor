import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import GamesPage from './components/GamesPage';
import AnimatedBackground from "./components/AnimatedBackground";

function App() {
  return (
    <Router>
      <AnimatedBackground />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<GamesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 