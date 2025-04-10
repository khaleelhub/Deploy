// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import "../Appcss/Home.css"; // Ensure this is your correct CSS file
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // Make sure Firebase is correctly configured
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const HomePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null); // User data state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid); // Reference to the user in Firestore
        const docSnap = await getDoc(userRef); // Get the user document

        if (docSnap.exists()) {
          setUserData(docSnap.data()); // If user data exists, set it
        } else {
          setUserData({
            username: user.displayName || "User", // Default values if no data
            profileImg: "https://i.pravatar.cc/100", // Default profile image
            balance: 0,
            miningMode: "Video Mining",
            rank: 999,
            referralCode: "-",
            miningToday: 0,
            streak: 0,
          });
        }
      } else {
        navigate("/Login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [navigate]);

  // Check if userData is still null (loading state)
  if (!userData) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="user-info">
          <img src={userData.profileImg} alt="User Avatar" className="user-avatar" />
          <div>
            <h2>Welcome, {userData.username}</h2>
            <p>Mode: <strong>{userData.miningMode}</strong></p>
          </div>
        </div>
      </header>

      <section className="balance-card">
        <h3>Your Balance</h3>
        <p className="balance-amount">${userData.balance.toFixed(2)} TCoins</p>
        <div className="referral-code">
          Referral: <code>{userData.referralCode}</code>
          <button onClick={() => navigator.clipboard.writeText(userData.referralCode)}>📋</button>
        </div>
      </section>

      <section className="quick-actions">
        <div className="action-grid">
          <button onClick={() => navigate("/videos")}>🎥 Watch & Mine</button>
          <button onClick={() => navigate("/Tasks")}>✅ Task & Earn</button>
          <button onClick={() => navigate("/GamingPage")}>🎮 Gamify</button>
          <button onClick={() => navigate("/MineCennter")}>🔥 Mining Board</button>
          <button onClick={() => navigate("/ReferralPage")}>👥 Referral</button>
          <button onClick={() => navigate("/Wallet")}>💰 Wallet</button>
          <button onClick={() => navigate("/Market")}>🛠️ AI Task Market</button>
          <button onClick={() => navigate("/LeaderBoard")}>🏆 Leaderboard</button>
          <button onClick={() => navigate("/ProfilePage")}>👤 Profile</button>
          <button onClick={() => navigate("/SpinPage")}>🎁 Spin to Win</button>
          <button onClick={() => navigate("/Reword")}>🎉 Rewards</button>
          <button onClick={() => navigate("/streak")}>🔥 Daily Streak</button>
          <button onClick={() => navigate("/missions")}>🚀 Missions</button>
          <button onClick={() => navigate("/QuizzesPage")}>🧠 Quizzes</button>
          <button onClick={() => navigate("/NewsPage")}>📰 Mining News</button>
          <button onClick={() => navigate("/Aichat")}>🤖 AI Assistant</button>
          <button onClick={() => navigate("/MiningTools")}>⚙️ Tools</button>
          <button onClick={() => navigate("/Donate")}>❤️ Donate</button>
          <button onClick={() => navigate("/Tutorials")}>🎓 Tutorials</button>
          <button onClick={() => navigate("/faq")}>❓ FAQ</button>
          <button onClick={() => navigate("/support")}>🛟 Support</button>
          <button onClick={() => navigate("/analytics")}>📈 Analytics</button>
          <button onClick={() => navigate("/community")}>💬 Community</button>
          <button onClick={() => navigate("/report")}>🐞 Bug Report</button>
          <button onClick={() => navigate("/features-vote")}>🗳️ Vote Features</button>
          <button onClick={() => navigate("/notifications")}>🔔 Notifications</button>
          <button onClick={() => navigate("/history")}>📜 Mining History</button>
          <button onClick={() => navigate("/achievements")}>🏅 Achievements</button>
          <button onClick={() => navigate("/badge")}>🎖️ Badges</button>
          <button onClick={() => navigate("/wallet-history")}>📂 Wallet History</button>
          <button onClick={() => navigate("/upgradeAccount")}>⚡ Upgrade Account</button>
          <button onClick={() => navigate("/Settings")}>⚙️ Settings</button>
        </div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <h4>Rank</h4>
          <p>#{userData.rank}</p>
        </div>
        <div className="stat-card">
          <h4>Today’s Mining</h4>
          <p>{userData.miningToday} points</p>
        </div>
        <div className="stat-card">
          <h4>Streak</h4>
          <p>{userData.streak} 🔥</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>MineFlow — The Human-Powered Mining Network</p>
      </footer>
    </div>
  );
};

export default HomePage;
