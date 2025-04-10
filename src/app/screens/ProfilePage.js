import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Assuming Firebase storage is set up
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../Appcss/ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [emailVerified, setEmailVerified] = useState(false);
  const [planType, setPlanType] = useState("Free");
  const [totalEarned, setTotalEarned] = useState(0);
  const [lastLogin, setLastLogin] = useState(null);

  // Default JSON object to fallback in case user data is missing in Firestore
  const defaultUserData = {
    username: "User",
    email: "No email found",
    referralCode: "No referral code",
    balance: 0,
    streak: 0,
    rank: "N/A",
    miningMode: "Basic",
    totalEarned: 0
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setEmailVerified(user.emailVerified);
          setLastLogin(user.metadata.lastSignInTime);
          setTotalEarned(data.totalEarned || 0);
          setPlanType(data.planType || "Free");
        } else {
          setError("User data not found.");
          setUserData(defaultUserData); // Set default data if no data exists
        }
      } else {
        navigate("/Login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode); // Persist dark mode setting
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!userData) return <div className="loading">Loading profile...</div>;

  // Generate avatar using DiceBear (fallback if no profile image is available)
  const avatarUrl = userData.profileImg || `https://avatars.dicebear.com/api/identicon/${userData.username}.svg`;

  return (
    <div className={`profile-container ${darkMode ? "dark-mode" : ""}`}>
      <h2>👤 Your Profile</h2>

      <div className="profile-card">
        <div className="profile-pic">
          <img src={avatarUrl} alt="Avatar" />
        </div>

        <div className="profile-info">
          <p><strong>Username:</strong> {userData.username}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Rank: </strong> {userData.rank}</p>
          <p><strong>Referral Code:</strong> {userData.referralCode}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(userData.referralCode)}
          >
            Copy Referral Code
          </button>
        </div>
      </div>

      <div className="mining-stats">
        <h3>Your Mining Stats</h3>
        <div className="stat-item">
          <span>Coins Mined:</span> <strong>{userData.balance.toFixed(2)} TCoins</strong>
        </div>
        <div className="stat-item">
          <span>Streak:</span> <strong>{userData.streak} 🔥</strong>
        </div>
        <div className="stat-item">
          <span>Rank:</span> <strong>{userData.rank}</strong>
        </div>
        <div className="stat-item">
          <span>Mining Mode:</span> <strong>{userData.miningMode}</strong>
        </div>
      </div>

      <div className="new-features">
        <h3>Other Info</h3>
        <div className="feature-item">
          <span>Email Verified: </span>
          <strong>{emailVerified ? "Yes" : "No"}</strong>
        </div>

        <div className="feature-item">
          <span>Plan Type: </span>
          <strong>{planType}</strong>
        </div>

        <div className="feature-item">
          <span>Total Earned: </span>
          <strong>{totalEarned.toFixed(2)} TCoins</strong>
        </div>

        <div className="feature-item">
          <span>Last Login: </span>
          <strong>{new Date(lastLogin).toLocaleString()}</strong>
        </div>

        <div className="feature-item">
          <span>Dark Mode: </span>
          <button onClick={toggleDarkMode}>
            {darkMode ? "Disable" : "Enable"} Dark Mode
          </button>
        </div>

        <div className="feature-item">
          <span>Notifications: </span>
          <button onClick={toggleNotifications}>
            {notificationsEnabled ? "Disable" : "Enable"} Notifications
          </button>
        </div>
      </div>

      <div className="actions">
        <button onClick={() => navigate("/Settings")}>Settings</button>
        <button onClick={() => navigate("/logout")}>Log Out</button>
      </div>
    </div>
  );
};

export default ProfilePage;
