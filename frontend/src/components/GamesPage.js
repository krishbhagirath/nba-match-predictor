import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LAL, GSW, BOS, MIA, CHI, MIL, BKN, NYK, PHX, LAC, DAL, HOU, POR, UTA,
  ATL, CHA, CLE, DEN, DET, IND, MEM, MIN, NOP, OKC, ORL, PHI, SAC, SAS, TOR, WAS
} from 'react-nba-logos';
import './GamesPage.css';

// "7:30p" -> minutes since midnight; unknown -> very large so it sorts last
const parseTimeToMinutes = (t) => {
  if (!t) return Number.MAX_SAFE_INTEGER;
  const m = /^(\d{1,2}):(\d{2})([ap])$/i.exec(String(t).trim());
  if (!m) return Number.MAX_SAFE_INTEGER;
  const h12 = parseInt(m[1], 10) % 12;
  const mins = h12 * 60 + parseInt(m[2], 10) + (m[3].toLowerCase() === 'p' ? 12 * 60 : 0);
  return mins;
};

const buildWeekDatesFromData = (data) => {
  const start = new Date(data.metadata.weekStartDate + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

// Fallback only before JSON loads (Mon→Sun for current week)
const buildFallbackWeekDates = () => {
  const today = new Date();
  const res = [];
  const dow = today.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    res.push(d);
  }
  return res;
};

const GamesPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('current'); // 'current' or 'lastWeek'
  const [slideDirection, setSlideDirection] = useState('');
  const [gamesData, setGamesData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load JSON data when component mounts
  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/upcoming.json');
        if (!response.ok) throw new Error('Failed to fetch games data');
        const data = await response.json();
        setGamesData(data);

        // Initialize selected date to the JSON week start
        if (data?.metadata?.weekStartDate) {
          setSelectedDate(new Date(data.metadata.weekStartDate + 'T00:00:00'));
        }
      } catch (error) {
        console.error('Error loading games data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGamesData();
  }, []);

  // Team logo mapping
  const teamLogos = {
    'Lakers': LAL, 'Warriors': GSW, 'Celtics': BOS, 'Heat': MIA, 'Bulls': CHI, 'Bucks': MIL,
    'Nets': BKN, 'Knicks': NYK, 'Suns': PHX, 'Clippers': LAC, 'Mavericks': DAL, 'Rockets': HOU,
    'Trail Blazers': POR, 'Jazz': UTA, 'Hawks': ATL, 'Hornets': CHA, 'Cavaliers': CLE, 'Nuggets': DEN,
    'Pistons': DET, 'Pacers': IND, 'Grizzlies': MEM, 'Timberwolves': MIN, 'Pelicans': NOP, 'Thunder': OKC,
    'Magic': ORL, '76ers': PHI, 'Kings': SAC, 'Spurs': SAS, 'Raptors': TOR, 'Wizards': WAS
  };

  // Week scaffolding from data (or fallback)
  const getWeekDates = () => {
    if (gamesData?.weekDates?.length === 7) return gamesData.weekDates.map(d => new Date(d));
    return buildFallbackWeekDates();
  };
  const weekDates = getWeekDates();
  const labels = gamesData?.orderedDays ?? ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const handleDateSelect = (date) => setSelectedDate(date);

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
    if (!gamesData?.currentWeek) return [];
    const idx = weekDates.findIndex(d => d.toDateString() === selectedDate.toDateString());
    const label = labels[Math.max(0, idx)];
    const arr = gamesData.currentWeek[label] || [];
    // Safety sort by time (scraper already sorts, this guarantees it)
    return [...arr].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
  };

  const getTeamLogo = (teamName) => {
    const LogoComponent = teamLogos[teamName];
    return LogoComponent ? <LogoComponent size={40} /> : <div className="team-logo-placeholder">{teamName?.charAt(0)}</div>;
  };

  const getAccuracyPercentage = () => {
    const lastWeekGames = []; // replace with real history when you wire it up
    if (!lastWeekGames.length) return 0;
    const correct = lastWeekGames.filter(g => g.correct).length;
    return Math.round((correct / lastWeekGames.length) * 100);
  };

  // Selected label for header
  const selectedIndex = weekDates.findIndex(d => d.toDateString() === selectedDate.toDateString());
  const selectedLabel = labels[Math.max(0, selectedIndex)];

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
            <button className="nav-button last-week-btn" onClick={switchToLastWeek}>
              <span className="arrow">←</span>
              Last Week's Predictions
            </button>
          )}

          {viewMode === 'lastWeek' && (
            <button className="nav-button current-week-btn" onClick={switchToCurrentWeek}>
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
                const dayName = labels[index];
                const games = gamesData?.currentWeek?.[dayName] || [];
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
                {selectedLabel} - {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>

              {loading ? (
                <div className="no-games"><p>Loading…</p></div>
              ) : getSelectedDayGames().length > 0 ? (
                <div className="games-list">
                  {getSelectedDayGames().map(game => (
                    <div key={game.id} className="game-card prediction-card">
                      <div className="game-teams">
                        <div className="team-info">
                          <div className="team-logo-container">{getTeamLogo(game.homeTeam.name)}</div>
                          <span className="team-name">{game.homeTeam.name}</span>
                        </div>
                        <span className="vs-text">vs</span>
                        <div className="team-info">
                          <span className="team-name">{game.awayTeam.name}</span>
                          <div className="team-logo-container">{getTeamLogo(game.awayTeam.name)}</div>
                        </div>
                      </div>

                      <div className="game-details">
                        <div className="game-time">{game.time}</div>
                        <div className="game-venue">{game.venue}</div>
                      </div>

                      <div className="prediction-section">
                        <div className="prediction">
                          <strong>Prediction:</strong> {game.prediction?.winner || game.prediction || 'TBD'}
                        </div>
                        <div className="confidence">
                          <strong>Confidence:</strong> {game.prediction?.confidence ?? game.confidence ?? 0}%
                        </div>
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{ width: `${game.prediction?.confidence ?? game.confidence ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-games"><p>No games scheduled for this day</p></div>
              )}
            </div>
          </div>
        )}

        {/* Last Week's Predictions (placeholder) */}
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
                <div className="stat-number">0</div>
                <div className="stat-label">Correct</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Incorrect</div>
              </div>
            </div>

            <div className="no-games"><p>Hook up history data to display results here.</p></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesPage;
