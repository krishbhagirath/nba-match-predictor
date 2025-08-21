import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LAL, GSW, BOS, MIA, CHI, MIL, BKN, NYK, PHX, LAC, DAL, HOU, POR, UTA,
  ATL, CHA, CLE, DEN, DET, IND, MEM, MIN, NOP, OKC, ORL, PHI, SAC, SAS, TOR, WAS
} from 'react-nba-logos';
import './GamesPage.css';

const GamesPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('current'); // 'current' or 'lastWeek'
  const [slideDirection, setSlideDirection] = useState('');

  // Team logo mapping
  const teamLogos = {
    'Lakers': LAL,
    'Warriors': GSW,
    'Celtics': BOS,
    'Heat': MIA,
    'Bulls': CHI,
    'Bucks': MIL,
    'Nets': BKN,
    'Knicks': NYK,
    'Suns': PHX,
    'Clippers': LAC,
    'Mavericks': DAL,
    'Rockets': HOU,
    'Trail Blazers': POR,
    'Jazz': UTA,
    'Hawks': ATL,
    'Hornets': CHA,
    'Cavaliers': CLE,
    'Nuggets': DEN,
    'Pistons': DET,
    'Pacers': IND,
    'Grizzlies': MEM,
    'Timberwolves': MIN,
    'Pelicans': NOP,
    'Thunder': OKC,
    'Magic': ORL,
    '76ers': PHI,
    'Kings': SAC,
    'Spurs': SAS,
    'Raptors': TOR,
    'Wizards': WAS
  };

  // Generate week dates
  const getWeekDates = () => {
    const today = new Date();
    const weekDates = [];
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Start from Monday (1) and go to Sunday (0)
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  };

  // Sample data for current week games with predictions
  const currentWeekGames = {
    'Monday': [
      {
        id: 1,
        homeTeam: { name: "Lakers", abbreviation: "LAL" },
        awayTeam: { name: "Warriors", abbreviation: "GSW" },
        time: "7:30 PM",
        venue: "Crypto.com Arena",
        prediction: "Lakers Win",
        confidence: 78
      },
      {
        id: 2,
        homeTeam: { name: "Celtics", abbreviation: "BOS" },
        awayTeam: { name: "Heat", abbreviation: "MIA" },
        time: "6:00 PM",
        venue: "TD Garden",
        prediction: "Celtics Win",
        confidence: 82
      }
    ],
    'Tuesday': [
      {
        id: 3,
        homeTeam: { name: "Bulls", abbreviation: "CHI" },
        awayTeam: { name: "Bucks", abbreviation: "MIL" },
        time: "8:00 PM",
        venue: "United Center",
        prediction: "Bucks Win",
        confidence: 71
      }
    ],
    'Wednesday': [
      {
        id: 4,
        homeTeam: { name: "Nets", abbreviation: "BKN" },
        awayTeam: { name: "Knicks", abbreviation: "NYK" },
        time: "7:30 PM",
        venue: "Barclays Center",
        prediction: "Nets Win",
        confidence: 65
      }
    ],
    'Thursday': [
      {
        id: 5,
        homeTeam: { name: "Suns", abbreviation: "PHX" },
        awayTeam: { name: "Clippers", abbreviation: "LAC" },
        time: "10:00 PM",
        venue: "Footprint Center",
        prediction: "Suns Win",
        confidence: 73
      }
    ],
    'Friday': [
      {
        id: 6,
        homeTeam: { name: "Mavericks", abbreviation: "DAL" },
        awayTeam: { name: "Rockets", abbreviation: "HOU" },
        time: "8:30 PM",
        venue: "American Airlines Center",
        prediction: "Mavericks Win",
        confidence: 69
      }
    ],
    'Saturday': [
      {
        id: 7,
        homeTeam: { name: "Trail Blazers", abbreviation: "POR" },
        awayTeam: { name: "Jazz", abbreviation: "UTA" },
        time: "9:00 PM",
        venue: "Moda Center",
        prediction: "Jazz Win",
        confidence: 62
      }
    ],
    'Sunday': [
      {
        id: 8,
        homeTeam: { name: "Lakers", abbreviation: "LAL" },
        awayTeam: { name: "Celtics", abbreviation: "BOS" },
        time: "3:30 PM",
        venue: "Crypto.com Arena",
        prediction: "Lakers Win",
        confidence: 55
      }
    ]
  };

  // Sample data for last week's predictions
  const lastWeekGames = [
    {
      id: 1,
      homeTeam: { name: "Lakers", abbreviation: "LAL" },
      awayTeam: { name: "Warriors", abbreviation: "GSW" },
      date: "Dec 8, 2024",
      prediction: "Lakers Win",
      actual: "Lakers Win",
      correct: true,
      confidence: 78
    },
    {
      id: 2,
      homeTeam: { name: "Celtics", abbreviation: "BOS" },
      awayTeam: { name: "Heat", abbreviation: "MIA" },
      date: "Dec 9, 2024",
      prediction: "Celtics Win",
      actual: "Heat Win",
      correct: false,
      confidence: 82
    },
    {
      id: 3,
      homeTeam: { name: "Bulls", abbreviation: "CHI" },
      awayTeam: { name: "Bucks", abbreviation: "MIL" },
      date: "Dec 10, 2024",
      prediction: "Bucks Win",
      actual: "Bucks Win",
      correct: true,
      confidence: 71
    },
    {
      id: 4,
      homeTeam: { name: "Nets", abbreviation: "BKN" },
      awayTeam: { name: "Knicks", abbreviation: "NYK" },
      date: "Dec 11, 2024",
      prediction: "Nets Win",
      actual: "Nets Win",
      correct: true,
      confidence: 65
    },
    {
      id: 5,
      homeTeam: { name: "Suns", abbreviation: "PHX" },
      awayTeam: { name: "Clippers", abbreviation: "LAC" },
      date: "Dec 12, 2024",
      prediction: "Suns Win",
      actual: "Clippers Win",
      correct: false,
      confidence: 73
    }
  ];

  const weekDates = getWeekDates();
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const switchToLastWeek = () => {
    setSlideDirection('left');
    setTimeout(() => {
      setViewMode('lastWeek');
      setSlideDirection('right');
    }, 300);
  };

  const switchToCurrentWeek = () => {
    setSlideDirection('right');
    setTimeout(() => {
      setViewMode('current');
      setSlideDirection('left');
    }, 300);
  };

  const getSelectedDayGames = () => {
    const dayName = dayNames[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1];
    return currentWeekGames[dayName] || [];
  };

  const getTeamLogo = (teamName) => {
    const LogoComponent = teamLogos[teamName];
    return LogoComponent ? <LogoComponent size={40} /> : <div className="team-logo-placeholder">{teamName.charAt(0)}</div>;
  };

  const getAccuracyPercentage = () => {
    const correct = lastWeekGames.filter(game => game.correct).length;
    return Math.round((correct / lastWeekGames.length) * 100);
  };

  return (
    <div className="games-page">
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
      <div className="games-container">
        <div className="games-header">
          <h1>Games & Predictions</h1>
          <p>View upcoming games and past prediction results</p>
        </div>

        {/* Calendar Navigation */}
        <div className="calendar-navigation">
          {viewMode === 'current' && (
            <button 
              className="nav-button last-week-btn"
              onClick={switchToLastWeek}
            >
              <span className="arrow">←</span>
              Last Week's Predictions
            </button>
          )}
          
          {viewMode === 'lastWeek' && (
            <button 
              className="nav-button current-week-btn"
              onClick={switchToCurrentWeek}
            >
              This Week's Games
              <span className="arrow">→</span>
            </button>
          )}
        </div>

        {/* Calendar Week View */}
        {viewMode === 'current' && (
          <div className={`calendar-week ${slideDirection === 'left' ? 'slide-left' : slideDirection === 'right' ? 'slide-right' : ''}`}>
            <div className="week-header">
              <h2>This Week's Games</h2>
              <p>Click on a day to view games and predictions</p>
            </div>
            
            <div className="day-bubbles">
              {weekDates.map((date, index) => {
                const dayName = dayNames[index];
                const games = currentWeekGames[dayName] || [];
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={index}
                    className={`day-bubble ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <div className="day-name">{dayName.slice(0, 3)}</div>
                    <div className="day-date">{date.getDate()}</div>
                    <div className="games-count">{games.length} game{games.length !== 1 ? 's' : ''}</div>
                  </div>
                );
              })}
            </div>

            {/* Selected Day Games */}
            <div className="selected-day-games">
              <h3 className="selected-day-title">
                {dayNames[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]} - {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              
              {getSelectedDayGames().length > 0 ? (
                <div className="games-list">
                  {getSelectedDayGames().map(game => (
                    <div key={game.id} className="game-card prediction-card">
                      <div className="game-teams">
                        <div className="team-info">
                          <div className="team-logo-container">
                            {getTeamLogo(game.homeTeam.name)}
                          </div>
                          <span className="team-name">{game.homeTeam.name}</span>
                        </div>
                        <span className="vs-text">vs</span>
                        <div className="team-info">
                          <span className="team-name">{game.awayTeam.name}</span>
                          <div className="team-logo-container">
                            {getTeamLogo(game.awayTeam.name)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="game-details">
                        <div className="game-time">{game.time}</div>
                        <div className="game-venue">{game.venue}</div>
                      </div>
                      
                      <div className="prediction-section">
                        <div className="prediction">
                          <strong>Prediction:</strong> {game.prediction}
                        </div>
                        <div className="confidence">
                          <strong>Confidence:</strong> {game.confidence}%
                        </div>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{ width: `${game.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-games">
                  <p>No games scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Week's Predictions */}
        {viewMode === 'lastWeek' && (
          <div className={`last-week-section ${slideDirection === 'right' ? 'slide-right' : slideDirection === 'left' ? 'slide-left' : ''}`}>
            <div className="week-header">
              <h2>Last Week's Predictions</h2>
              <p>Review our prediction accuracy</p>
            </div>
            
            <div className="prediction-stats">
              <div className="stat-card">
                <div className="stat-number">{getAccuracyPercentage()}%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{lastWeekGames.filter(game => game.correct).length}</div>
                <div className="stat-label">Correct</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{lastWeekGames.filter(game => !game.correct).length}</div>
                <div className="stat-label">Incorrect</div>
              </div>
            </div>

            <div className="games-list">
              {lastWeekGames.map(game => (
                <div key={game.id} className="game-card prediction-card">
                  <div className="game-teams">
                    <div className="team-info">
                      <div className="team-logo-container">
                        {getTeamLogo(game.homeTeam.name)}
                      </div>
                      <span className="team-name">{game.homeTeam.name}</span>
                    </div>
                    <span className="vs-text">vs</span>
                    <div className="team-info">
                      <span className="team-name">{game.awayTeam.name}</span>
                      <div className="team-logo-container">
                        {getTeamLogo(game.awayTeam.name)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="prediction-details">
                    <div className="prediction-row">
                      <div className="prediction">
                        <strong>Prediction:</strong> {game.prediction}
                      </div>
                      <div className="confidence">
                        <strong>Confidence:</strong> {game.confidence}%
                      </div>
                    </div>
                    <div className="prediction-row">
                      <div className="actual">
                        <strong>Actual:</strong> {game.actual}
                      </div>
                      <div className="prediction-result">
                        {game.correct ? (
                          <span className="result-icon correct">✓</span>
                        ) : (
                          <span className="result-icon incorrect">✗</span>
                        )}
                        <span className={game.correct ? 'correct-text' : 'incorrect-text'}>
                          {game.correct ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesPage; 