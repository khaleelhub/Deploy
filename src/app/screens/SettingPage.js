import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../Appcss/SettingsPage.css";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Default settings
  const defaultSettings = {
    darkMode: false,
    notifications: true,
    language: "English",
    autoPlayVideos: true,
    enable2FA: false,
    sound: true,
    emailUpdates: true,
    showHints: true,
    allowTracking: false,
    referralNotifications: true,
    enableChat: true,
    themeColor: "blue",
    hideBalance: false,
    enableMiningSounds: true,
    streakReminder: true,
    videoQuality: "Auto",
    enableBetaFeatures: false,
    autoLogout: false,
    walletSecurity: "standard",
    taskPriority: "medium",
    dataSaver: false,
    vibrationFeedback: true,
    compactLayout: false,
    achievementsPopups: true,
    showMiningHistory: true,
    showProfileStats: true,
    enableAnimations: true,
    showAds: true,
    autoBackup: true,
    rememberDevice: false,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setSettings({ ...defaultSettings, ...(userData.settings || {}) });
          setUserId(user.uid);
        } else {
          setError("User data not found.");
        }
        setLoading(false);
      } else {
        navigate("/Login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    if (userId) {
      const userRef = doc(db, "users", userId);
      updateDoc(userRef, {
        settings: updated,
      });
    }
  };

  if (loading) return <div className="loading">Loading settings...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className={`settings-container ${settings.darkMode ? "dark-mode" : ""}`}>
      <h2>Settings</h2>

      {Object.entries(settings).map(([key, value]) => (
        <div key={key} className="setting-item">
          <label>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</label>
          {typeof value === "boolean" ? (
            <input
              type="checkbox"
              checked={value}
              onChange={() => handleChange(key, !value)}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          )}
        </div>
      ))}

      <button onClick={() => navigate("/Home")}>Back to Home</button>
    </div>
  );
};

export default SettingsPage;
