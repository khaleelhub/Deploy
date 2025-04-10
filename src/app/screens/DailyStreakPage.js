import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../Appcss/DailyStreakPage.css";

const DailyStreakPage = () => {
  const [userData, setUserData] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState(null);
  const [error, setError] = useState("");
  const [bonusDays, setBonusDays] = useState(0);  // Added bonus days

  // Fetch user data on authentication
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchData = async () => {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setStreak(data.streak || 0);
            setLastLoginDate(data.lastLoginDate);
            setBonusDays(data.bonusDays || 0);
          } else {
            setError("User data not found");
          }
        };
        fetchData();
      }
    });
  }, []);

  const handleCheckIn = async () => {
    const today = new Date().toISOString().split("T")[0]; // Current date

    if (lastLoginDate === today) {
      setError("You have already checked in today!");
      return;
    }

    let newStreak = streak;
    let newBonusDays = bonusDays;

    // Calculate new streak
    if (lastLoginDate === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0]) {
      newStreak += 1; // Continue streak
    } else {
      newStreak = 1; // Reset streak if missed a day
    }

    // Bonus Day Logic
    if (newStreak % 7 === 0) { // Every 7 days add a bonus day
      newBonusDays += 1;
    }

    try {
      const userRef = doc(db, "users", userData.id);
      await updateDoc(userRef, {
        streak: newStreak,
        lastLoginDate: today,
        bonusDays: newBonusDays,
      });
      setStreak(newStreak);
      setBonusDays(newBonusDays);
      setLastLoginDate(today);
    } catch (err) {
      setError("Error checking in. Please try again.");
    }
  };

  return (
    <div className="daily-streak-container">
      <h2>Daily Streak</h2>
      <div className="streak-info">
        <p>Current Streak: {streak} days</p>
        <p>Bonus Days: {bonusDays}</p>
        <p>Last login date: {lastLoginDate ? lastLoginDate : "N/A"}</p>
      </div>

      <button onClick={handleCheckIn} className="check-in-button">
        Check In Today
      </button>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default DailyStreakPage;
