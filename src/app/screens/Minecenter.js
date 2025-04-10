import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../Appcss/MiningPage.css';

const MiningPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [coins, setCoins] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [level, setLevel] = useState(1);
  const [miningMode, setMiningMode] = useState('Auto');
  const [rank, setRank] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [miningSpeed, setMiningSpeed] = useState(1);
  const [dailyBonus, setDailyBonus] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskCompletionRate, setTaskCompletionRate] = useState(0);
  const [miningHistory, setMiningHistory] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [miningPower, setMiningPower] = useState(1);
  const [referralBonus, setReferralBonus] = useState(0);
  const [lastMiningTime, setLastMiningTime] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [rewardRate, setRewardRate] = useState(0.01);
  const [miningMultiplier, setMiningMultiplier] = useState(1);
  const [boostAvailable, setBoostAvailable] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setCoins(data.balance || 0);
          setTasksCompleted(data.tasksCompleted || 0);
          setLevel(data.level || 1);
          setMiningMode(data.miningMode || 'Auto');
          setRank(data.rank || 0);
          setTotalTime(data.totalTime || 0);
          setDailyBonus(data.dailyBonus || 0);
          setTotalEarned(data.totalEarned || 0);
          setMiningSpeed(data.miningSpeed || 1);
          setMiningPower(data.miningPower || 1);
          setIsPremium(data.isPremium || false);
          setMiningHistory(data.miningHistory || []);
        } else {
          const defaultData = {
            username: currentUser.displayName || 'User',
            email: currentUser.email,
            balance: 0,
            tasksCompleted: 0,
            level: 1,
            miningMode: 'Auto',
            rank: 0,
            totalTime: 0,
            referralCode: currentUser.uid.slice(0, 6),
            streak: 0,
            planType: 'Free',
            totalEarned: 0,
            profileImg: `https://avatars.dicebear.com/api/identicon/${currentUser.uid}.svg`,
            miningHistory: [],
            dailyBonus: 0,
            miningSpeed: 1,
            miningPower: 1,
            isPremium: false,
          };
          await setDoc(userRef, defaultData);
          setUserData(defaultData);
        }
        setLoading(false);
      } else {
        navigate('/Login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const startMining = () => {
    setMining(true);
    setStartTime(Date.now());
  };

  const stopMining = async () => {
    if (!startTime) return;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const coinsEarned = timeSpent * rewardRate * miningMultiplier;

    const newCoins = coins + coinsEarned;
    const newTasksCompleted = tasksCompleted + 1;
    const newTotalTime = totalTime + timeSpent;
    const newLevel = 1 + Math.floor(newTasksCompleted / 10);
    const newTotalEarned = totalEarned + coinsEarned;

    const updatedData = {
      balance: newCoins,
      tasksCompleted: newTasksCompleted,
      level: newLevel,
      totalTime: newTotalTime,
      totalEarned: newTotalEarned,
      miningHistory: [
        ...miningHistory,
        { timestamp: Date.now(), coinsEarned },
      ],
    };

    setCoins(newCoins);
    setTasksCompleted(newTasksCompleted);
    setLevel(newLevel);
    setTotalTime(newTotalTime);
    setTotalEarned(newTotalEarned);
    setMining(false);

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, updatedData);
  };

  const claimDailyBonus = () => {
    const bonus = 5; // For example, 5 coins as a daily bonus.
    setCoins(coins + bonus);
    setDailyBonus(bonus);
    setLastMiningTime(Date.now());
  };

  const boostMiningPower = () => {
    if (boostAvailable) {
      setMiningPower(miningPower * 2); // Double the mining power
      setBoostAvailable(false);
      setTimeout(() => setMiningPower(miningPower), 600000); // Reset mining power after 10 minutes
    }
  };

  const completeTask = (taskId) => {
    setCurrentTask(taskId);
    setIsTaskComplete(true);
    // Update task completion rate
    setTaskCompletionRate(((tasksCompleted + 1) / (tasksCompleted + 5)) * 100);
  };

  const handleReferralBonus = (referralCode) => {
    if (referralCode === userData.referralCode) {
      setReferralBonus(10); // Reward 10 coins for using the referral code
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="mining-container">
      <h2>⛏️ Mining Dashboard</h2>
      <div className="stats">
        <p><strong>Username:</strong> {userData.username}</p>
        <p><strong>Level:</strong> {level}</p>
        <p><strong>Tasks Completed:</strong> {tasksCompleted}</p>
        <p><strong>Balance:</strong> {coins.toFixed(2)} TCoins</p>
        <p><strong>Total Earned:</strong> {totalEarned.toFixed(2)} TCoins</p>
        <p><strong>Total Time:</strong> {totalTime} seconds</p>
        <p><strong>Mining Mode:</strong> {miningMode}</p>
        <p><strong>Rank:</strong> #{rank}</p>
        <p><strong>Mining Power:</strong> {miningPower}</p>
        <p><strong>Referral Bonus:</strong> {referralBonus} TCoins</p>
      </div>

      <div className="mining-controls">
        {!mining ? (
          <button onClick={startMining}>Start Mining</button>
        ) : (
          <button onClick={stopMining}>Stop Mining</button>
        )}
        <button onClick={claimDailyBonus}>Claim Daily Bonus</button>
        <button onClick={boostMiningPower}>Boost Mining Power</button>
      </div>

      <div className="task-controls">
        <button onClick={() => completeTask(1)}>Complete Task 1</button>
        <button onClick={() => completeTask(2)}>Complete Task 2</button>
        <p>Task Completion Rate: {taskCompletionRate.toFixed(2)}%</p>
      </div>

      <div className="navigation">
        <button onClick={() => navigate('/ProfilePage')}>👤 Profile</button>
        <button onClick={() => navigate('/LeaderBoard')}>🏆 Leaderboard</button>
        <button onClick={() => navigate('/Settings')}>⚙️ Settings</button>
        <button onClick={() => navigate('/Login')}>🚪 Log Out</button>
      </div>
    </div>
  );
};

export default MiningPage;
