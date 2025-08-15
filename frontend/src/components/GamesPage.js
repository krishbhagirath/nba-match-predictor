import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GamesPage.css';

const GamesPage = () => {
  const [showLastWeek, setShowLastWeek] = useState(false);

  // Sample data for upcoming games (this will eventually come from your Flask backend)
  // TODO: Replace with API call to Flask backend endpoint
  // Example: const [upcomingGames, setUpcomingGames] = useState([]);
  // useEffect(() => { fetchUpcomingGames(); }, []);
  const upcomingGames = [
    {
      id: 1,
      homeTeam: { name: "Lakers", logo: "🏀" },
      awayTeam: { name: "Warriors", logo: "🏀" },
      date: "Dec 15, 2024",
      time: "7:30 PM",
      venue: "Crypto.com Arena"
    },
    {
      id: 2,
      homeTeam: { name: "Celtics", logo: "🏀" },
      awayTeam: { name: "Heat", logo: "🏀" },
      date: "Dec 16, 2024",
      time: "6:00 PM",
      venue: "TD Garden"
    },
    {
      id: 3,
      homeTeam: { name: "Bulls", logo: "🏀" },
      awayTeam: { name: "Bucks", logo: "🏀" },
      date: "Dec 17, 2024",
      time: "8:00 PM",
      venue: "United Center"
    },
    {
      id: 4,
      homeTeam: { name: "Nets", logo: "🏀" },
      awayTeam: { name: "Knicks", logo: "🏀" },
      date: "Dec 18, 2024",
      time: "7:30 PM",
      venue: "Barclays Center"
    },
    {
      id: 5,
      homeTeam: { name: "Suns", logo: "🏀" },
      awayTeam: { name: "Clippers", logo: "🏀" },
      date: "Dec 19, 2024",
      time: "10:00 PM",
      venue: "Footprint Center"
    },
    {
      id: 6,
      homeTeam: { name: "Mavericks", logo: "🏀" },
      awayTeam: { name: "Rockets", logo: "🏀" },
      date: "Dec 20, 2024",
      time: "8:30 PM",
      venue: "American Airlines Center"
    },
    {
      id: 7,
      homeTeam: { name: "Trail Blazers", logo: "🏀" },
      awayTeam: { name: "Jazz", logo: "🏀" },
      date: "Dec 21, 2024",
      time: "9:00 PM",
      venue: "Moda Center"
    }
  ];

  // Sample data for last week's predictions (this will eventually come from your Flask backend)
  // TODO: Replace with API call to Flask backend endpoint
  // Example: const [lastWeekGames, setLastWeekGames] = useState([]);
  // useEffect(() => { fetchLastWeekGames(); }, []);
  const lastWeekGames = [
    {
      id: 1,
      homeTeam: { name: "Lakers", logo: "🏀" },
      awayTeam: { name: "Warriors", logo: "🏀" },
      date: "Dec 8, 2024",
      prediction: "Lakers Win",
      actual: "Lakers Win",
      correct: true
    },
    {
      id: 2,
      homeTeam: { name: "Celtics", logo: "🏀" },
      awayTeam: { name: "Heat", logo: "🏀" },
      date: "Dec 9, 2024",
      prediction: "Celtics Win",
      actual: "Heat Win",
      correct: false
    },
    {
      id: 3,
      homeTeam: { name: "Bulls", logo: "🏀" },
      awayTeam: { name: "Bucks", logo: "🏀" },
      date: "Dec 10, 2024",
      prediction: "Bucks Win",
      actual: "Bucks Win",
      correct: true
    },
    {
      id: 4,
      homeTeam: { name: "Nets", logo: "🏀" },
      awayTeam: { name: "Knicks", logo: "🏀" },
      date: "Dec 11, 2024",
      prediction: "Nets Win",
      actual: "Nets Win",
      correct: true
    },
    {
      id: 5,
      homeTeam: { name: "Suns", logo: "🏀" },
      awayTeam: { name: "Clippers", logo: "🏀" },
      date: "Dec 12, 2024",
      prediction: "Suns Win",
      actual: "Clippers Win",
      correct: false
    },
    {
      id: 6,
      homeTeam: { name: "Mavericks", logo: "🏀" },
      awayTeam: { name: "Rockets", logo: "🏀" },
      date: "Dec 13, 2024",
      prediction: "Mavericks Win",
      actual: "Mavericks Win",
      correct: true
    },
    {
      id: 7,
      homeTeam: { name: "Trail Blazers", logo: "🏀" },
      awayTeam: { name: "Jazz", logo: "🏀" },
      date: "Dec 14, 2024",
      prediction: "Jazz Win",
      actual: "Trail Blazers Win",
      correct: false
    }
  ];

  const toggleView = () => {
    setShowLastWeek(!showLastWeek);
  };

  return (
    <div className="games-page">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🏀 NBA Predictor
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/games" className="nav-link">Games & Predictions</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="games-container">
        <div className="games-header">
          <h1>Games & Predictions</h1>
          <p>View upcoming games and past prediction results</p>
        </div>

        {/* Toggle Button */}
        <button 
          className="toggle-button"
          onClick={toggleView}
        >
          {showLastWeek ? "View Upcoming Games" : "View Last Week's Predictions"}
        </button>

        {/* Games Content */}
        <div className="games-content">
          {showLastWeek ? (
            // Last Week's Predictions Section
            <div className="games-section">
              <h2 className="section-title">Last Week's Predictions</h2>
              <div className="prediction-stats">
                <p>Accuracy: {lastWeekGames.filter(game => game.correct).length}/{lastWeekGames.length} ({Math.round((lastWeekGames.filter(game => game.correct).length / lastWeekGames.length) * 100)}%)</p>
              </div>
              {lastWeekGames.map(game => (
                <div key={game.id} className="game-card prediction-card">
                  <div className="team-info">
                    <div className="team-logo">{game.homeTeam.logo}</div>
                    <span className="team-name">{game.homeTeam.name}</span>
                  </div>
                  <span className="vs-text">vs</span>
                  <div className="team-info">
                    <span className="team-name">{game.awayTeam.name}</span>
                    <div className="team-logo">{game.awayTeam.logo}</div>
                  </div>
                  <div className="prediction-details">
                    <div className="prediction">
                      <strong>Prediction:</strong> {game.prediction}
                    </div>
                    <div className="actual">
                      <strong>Actual:</strong> {game.actual}
                    </div>
                    <div className="prediction-result">
                      {game.correct ? (
                        <span className="result-icon correct">✓</span>
                      ) : (
                        <span className="result-icon incorrect">✗</span>
                      )}
                      <span>{game.correct ? 'Correct' : 'Incorrect'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Upcoming Games Section
            <div className="games-section">
              <h2 className="section-title">Upcoming Games (Next 7 Days)</h2>
              {upcomingGames.map(game => (
                <div key={game.id} className="game-card">
                  <div className="team-info">
                    <div className="team-logo">{game.homeTeam.logo}</div>
                    <span className="team-name">{game.homeTeam.name}</span>
                  </div>
                  <span className="vs-text">vs</span>
                  <div className="team-info">
                    <span className="team-name">{game.awayTeam.name}</span>
                    <div className="team-logo">{game.awayTeam.logo}</div>
                  </div>
                  <div className="game-details">
                    <div className="game-date">{game.date}</div>
                    <div className="game-time">{game.time}</div>
                    <div className="game-venue">{game.venue}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Backend Integration Notes */}
        <div className="backend-notes">
          <h3>Backend Integration Notes:</h3>
          <ul>
            <li>Replace static data with API calls to Flask backend</li>
            <li>Set up endpoints for upcoming games and prediction results</li>
            <li>Implement real-time data updates</li>
            <li>Add authentication for admin features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GamesPage; 