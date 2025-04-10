import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../Appcss/GamingPage.css";

const GamingPage = () => {
  const [games, setGames] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [gameStatus, setGameStatus] = useState("idle");
  const [activeGame, setActiveGame] = useState(null);
  const [difficulty, setDifficulty] = useState("Medium");
  const [multiplayerChallenge, setMultiplayerChallenge] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserStats(userSnap.data());
        }
      }
    };
    fetchUserStats();

    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
      const leaderboardRef = db.collection("leaderboard").orderBy("score", "desc");
      const leaderboardSnap = await leaderboardRef.get();
      const leaderboardData = leaderboardSnap.docs.map(doc => doc.data());
      setLeaderboard(leaderboardData);
    };
    fetchLeaderboard();

    // Set Daily Challenge (optional)
    const todayChallenge = "Complete 5 games today to earn a bonus!";
    setDailyChallenge(todayChallenge);
  }, []);

  const handlePlayGame = (gameId) => {
    setActiveGame(gameId);
    setGameStatus("playing");
    // Initialize the game with difficulty level, stats, etc.
  };

  const handleEndGame = async (score) => {
    setGameStatus("finished");
    // Update user stats in Firebase
    const user = auth.currentUser;
    if (user && userStats) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        gamesPlayed: userStats.gamesPlayed + 1,
        totalScore: userStats.totalScore + score,
      });
    }
  };

  const handleStartMultiplayer = (opponent) => {
    setMultiplayerChallenge(opponent);
    // Implement multiplayer challenge logic (e.g., invite, play together)
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
  };

  return (
    <div className="gaming-container">
      <h1>Welcome to the Gaming Zone</h1>

      {/* User Profile Stats */}
      {userStats && (
        <div className="user-stats">
          <h2>{userStats.name}'s Stats</h2>
          <p>Games Played: {userStats.gamesPlayed}</p>
          <p>Total Score: {userStats.totalScore}</p>
          <p>Achievements: {userStats.achievements.length}</p>
        </div>
      )}

      {/* Sound Toggle */}
      <div className="sound-toggle">
        <button onClick={toggleSound}>
          {soundEnabled ? "Mute Sound" : "Unmute Sound"}
        </button>
      </div>

      {/* Difficulty Selection */}
      <div className="difficulty-selection">
        <label htmlFor="difficulty">Choose Difficulty:</label>
        <select id="difficulty" value={difficulty} onChange={handleDifficultyChange}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Daily Challenge */}
      {dailyChallenge && (
        <div className="daily-challenge">
          <h3>Daily Challenge:</h3>
          <p>{dailyChallenge}</p>
        </div>
      )}

      {/* Game Categories */}
      <div className="games-categories">
        <div className="category">
          <h3>Puzzle Games</h3>
          <button onClick={() => handlePlayGame("puzzleGame")}>Play Puzzle Game</button>
          <button onClick={() => handlePlayGame("crosswordGame")}>Play Crossword</button>
        </div>
        <div className="category">
          <h3>Action Games</h3>
          <button onClick={() => handlePlayGame("actionGame")}>Play Action Game</button>
          <button onClick={() => handlePlayGame("platformerGame")}>Play Platformer</button>
        </div>
        <div className="category">
          <h3>Strategy Games</h3>
          <button onClick={() => handlePlayGame("chessGame")}>Play Chess</button>
          <button onClick={() => handlePlayGame("checkersGame")}>Play Checkers</button>
        </div>
        <div className="category">
          <h3>Multiplayer Games</h3>
          <button onClick={() => handlePlayGame("multiplayerGame")}>Play Multiplayer Game</button>
        </div>
      </div>

      {/* Multiplayer Challenge */}
      {multiplayerChallenge && (
        <div className="multiplayer-challenge">
          <h3>Challenge {multiplayerChallenge.name} to a Game!</h3>
          <button onClick={() => handleStartMultiplayer(multiplayerChallenge)}>Start Multiplayer Game</button>
        </div>
      )}

      {/* Leaderboard */}
      <div className="leaderboard">
        <h3>Leaderboard</h3>
        <ul>
          {leaderboard.map((player, index) => (
            <li key={index}>
              <strong>{player.name}</strong>: {player.score} points
            </li>
          ))}
        </ul>
      </div>

      {/* Game Status */}
      {gameStatus === "playing" && activeGame && (
        <div className="game-status">
          <h2>Now Playing: {activeGame}</h2>
          <button onClick={() => handleEndGame(100)}>End Game</button> {/* Replace 100 with actual score */}
        </div>
      )}

      {/* Game Summary */}
      {gameStatus === "finished" && (
        <div className="game-summary">
          <h2>Game Over</h2>
          <p>You've finished the game!</p>
          <p>Your stats will be updated shortly.</p>
        </div>
      )}
    </div>
  );
};

export default GamingPage;
