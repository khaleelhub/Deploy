import React, { useState, useEffect } from 'react';
import { db, auth } from "../firebase"; // Firebase config for user data
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../Appcss/SpinToWinPage.css"; // Import the CSS
import { FaArrowAltCircleDown, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Import icons

const SpinToWinPage = () => {
  const [userData, setUserData] = useState(null);
  const [spinResult, setSpinResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spinReward, setSpinReward] = useState(0); // Reward from spin
  const [spinHistory, setSpinHistory] = useState([]);
  const [spinCount, setSpinCount] = useState(0);
  const [error, setError] = useState(null);
  const [spinCost, setSpinCost] = useState(5); // Cost of each spin in coins
  const [vipStatus, setVipStatus] = useState(false); // VIP status for better rewards
  const [dailySpinLimit, setDailySpinLimit] = useState(3); // Limit of spins per day
  const [lastSpinTime, setLastSpinTime] = useState(null); // Time of last spin
  const [spinCooldown, setSpinCooldown] = useState(0); // Countdown for next spin
  const [bonusWheelAvailable, setBonusWheelAvailable] = useState(false); // Bonus wheel trigger
  const [rotationDeg, setRotationDeg] = useState(0); // Store the rotation degree

  // Fetch user data
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchUserData = async () => {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setVipStatus(docSnap.data().vip); // Set VIP status
          } else {
            setError("User data not found");
          }
        };
        fetchUserData();
      }
    });
  }, []);

  // Handle the spin logic
  const handleSpin = async () => {
    if (spinning || spinCooldown > 0 || spinCount >= dailySpinLimit) return;

    setSpinning(true);
    setError(null);
    setSpinHistory([...spinHistory, { type: "spin", reward: spinReward }]);

    // Handle the spin logic
    const spinValue = Math.floor(Math.random() * 100);
    let reward = 0;

    // Determine the reward based on the spin
    if (spinValue < 30) {
      reward = 10; // Small reward (coins)
    } else if (spinValue < 60) {
      reward = 20; // Medium reward (coins)
    } else if (spinValue < 90) {
      reward = 50; // Big reward (coins)
    } else {
      reward = 100; // Jackpot (coins)
    }

    setSpinReward(reward);
    setSpinResult(`You won ${reward} coins!`);

    // Update user's balance and last spin time in Firebase
    if (userData) {
      const newBalance = userData.balance + reward;
      await updateDoc(doc(db, "users", userData.id), {
        balance: newBalance,
        lastSpinTime: new Date(),
      });
    }

    setSpinning(false);
    setSpinCount(spinCount + 1);

    // Update spin cooldown (for the 24-hour limit)
    setSpinCooldown(86400000);

    // Set the rotation degree (for smooth transition)
    const spinDeg = Math.floor(Math.random() * 360) + 7200; // Random spin between 7200 and 10000 degrees
    setRotationDeg(spinDeg);
  };

  return (
    <div className="spin-to-win-container">
      <h2>Spin to Win</h2>

      {error && <div className="error-message"><FaTimesCircle /> {error}</div>}

      {spinCooldown > 0 && (
        <p className="spin-cooldown">
          Please wait {Math.ceil(spinCooldown / 1000)} seconds to spin again.
        </p>
      )}

      <div className="spin-wheel-container">
        <div className={`spin-wheel ${spinning ? 'spinning' : ''}`} style={{ transform: `rotate(${rotationDeg}deg)` }}>
          <div className="wheel">
            <div className="arrow">
              <FaArrowAltCircleDown className="spin-arrow" />
            </div>
          </div>
        </div>
      </div>

      <button 
        className="spin-btn" 
        onClick={handleSpin} 
        disabled={spinning || spinCooldown > 0 || spinCount >= dailySpinLimit}
      >
        {spinning ? <FaSpinner className="spin-loading" /> : "Spin the Wheel!"}
      </button>

      {spinResult && <div className="spin-result"><FaCheckCircle /> {spinResult}</div>}

      {userData && (
        <div className="user-balance">
          <p>Your current balance: {userData.balance} Coins</p>
          <p>Spins left today: {dailySpinLimit - spinCount}</p>
        </div>
      )}

      <div className="spin-history">
        <h3>Spin History</h3>
        {spinHistory.map((item, index) => (
          <p key={index}>{item.type} - {item.reward} coins</p>
        ))}
      </div>
    </div>
  );
};

export default SpinToWinPage;
