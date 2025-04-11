import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../Appcss/Leaderboard.css";
import { Link } from "react-router-dom";

const LeaderDashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortCriteria, setSortCriteria] = useState("balance");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "users"), orderBy(sortCriteria, "desc")),
      (querySnapshot) => {
        const userList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userList.push({ id: doc.id, ...data });
        });
        setUsers(userList);
      },
      (error) => {
        console.error("Error fetching leaderboard data: ", error);
      }
    );

    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    return () => unsubscribe();
  }, [sortCriteria]);

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="leaderboard-container">
      <h2>🏆 Leaderboard</h2>

      {/* Sorting options */}
      <div className="sort-options">
        <label>Sort by: </label>
        <select
          onChange={(e) => setSortCriteria(e.target.value)}
          value={sortCriteria}
        >
          <option value="balance">Coins Earned</option>
          <option value="streak">Streak</option>
          <option value="rank">Rank</option>
        </select>
      </div>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Leaderboard list */}
      <div className="leaderboard-list">
        {filteredUsers.map((user, index) => {
          const isCurrentUser = currentUser?.uid === user.id;
          const avatarUrl = `https://avatars.dicebear.com/api/identicon/${user.username || user.id}.svg`;

          return (
            <div
              key={user.id}
              className={`leaderboard-item ${isCurrentUser ? "highlight" : ""}`}
            >
              <div className="rank">#{index + 1}</div>
              <img src={avatarUrl} alt="avatar" className="avatar" />
              <div className="user-info">
                <div className="username">
                  <Link to={`/profile/${user.id}`}>{user.username || "Unnamed User"}</Link>
                </div>
                <div className="details">
                  <span className="coins">💰 {user.balance?.toFixed(2)} TCoins</span>
                  <span className="streak">🔥 {user.streak || 0}</span>
                  <span className="plan">🎯 {user.planType || "Free"}</span>
                  <span className="mode">⛏️ {user.miningMode || "Idle"}</span>
                </div>
              </div>
              {isCurrentUser && <div className="you-label">(You)</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderDashboard;
