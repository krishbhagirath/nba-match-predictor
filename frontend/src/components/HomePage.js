import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/451px-National_Basketball_Association_logo.svg.png" 
              alt="NBA Logo" 
              style={{ height: '40px', verticalAlign: 'middle', marginRight: '8px' }} 
            />
            NBA Predictor
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/games" className="nav-link">Games & Predictions</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-container">
        {/* Logo + text side-by-side */}
        <div className="home-header">
          <img
            className="brand-logo"
            src="https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/451px-National_Basketball_Association_logo.svg.png"
            alt="NBA Logo"
          />

          <div className="home-text">
            <h1 className="project-title">NBA Match Predictor</h1>
            <p className="project-subtitle">
              Advanced Machine Learning for Basketball Game Predictions
            </p>
          </div>
        </div>

        {/* Call to Action Button */}
        <Link to="/games" className="cta-button">
          View Games & Predictions
        </Link>
        
        {/* Additional Info */}
        <div className="project-info">
          <p>
            Powered by cutting-edge AI algorithms to predict NBA game outcomes with confidence scores
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 