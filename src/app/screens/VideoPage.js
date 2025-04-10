import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../Appcss/VideoPage.css";

const VideoPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [userData, setUserData] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [videoMeta, setVideoMeta] = useState({ title: "", sponsor: "", url: "" });
  const [hasFocus, setHasFocus] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);
  const [adReported, setAdReported] = useState(false);
  const [rewardTimer, setRewardTimer] = useState(null);

  const DAILY_VIDEO_LIMIT = 3;
  const REWARD_AMOUNT = 5;

  // Focus detection
  useEffect(() => {
    const handleFocus = () => setHasFocus(true);
    const handleBlur = () => setHasFocus(false);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);

          // Check if already watched 3 videos today
          const today = new Date().toDateString();
          if ((data.videoWatchDates || []).filter(date => date === today).length >= DAILY_VIDEO_LIMIT) {
            setDailyLimitReached(true);
          }
        }

        // Fetch current ad data
        const adRef = doc(db, "ads", "currentAd");
        const adSnap = await getDoc(adRef);
        if (adSnap.exists()) {
          setVideoMeta(adSnap.data());
        }

        setLoading(false);
      } else {
        navigate("/Login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (videoProgress >= 100 && !rewardClaimed && !dailyLimitReached) {
      setRewardClaimed(true);
      claimReward();
    }
  }, [videoProgress]);

  const handleVideoProgress = (e) => {
    const progress = (e.target.currentTime / e.target.duration) * 100;
    setVideoProgress(progress);
  };

  const claimReward = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const today = new Date().toDateString();
    const updatedDates = [...(userData.videoWatchDates || []), today];

    await updateDoc(userRef, {
      balance: userData.balance + REWARD_AMOUNT,
      videoWatchDates: updatedDates,
      xp: (userData.xp || 0) + 10,
      streak: (userData.streak || 0) + 1,
    });

    alert(`✅ You earned ${REWARD_AMOUNT} TCoins!`);
  };

  const reportAd = () => {
    setAdReported(true);
    alert("⚠️ Ad reported. We'll review it shortly.");
  };

  if (loading) return <div className="loader">Loading Video...</div>;
  if (!userData) return <div>Redirecting...</div>;

  return (
    <div className="video-page-container">
      <header>
        <h2>{videoMeta.title || "Watch Ad to Earn"}</h2>
        <p>Sponsored by: {videoMeta.sponsor}</p>
      </header>

      <div className="video-wrapper">
        {videoMeta.url ? (
          <video
            ref={videoRef}
            src={videoMeta.url}
            autoPlay
            muted={false}
            onTimeUpdate={handleVideoProgress}
            controls={false}
            onEnded={() => setRewardClaimed(true)}
            className="secure-video"
          >
            Your browser doesn't support this video.
          </video>
        ) : (
          <p>🚫 No video available at this time.</p>
        )}
        <div className="video-overlay">
          {showCountdown && (
            <div className="countdown">⏳ Watch till end to earn!</div>
          )}
          {!hasFocus && <div className="paused">⏸️ Paused - return to the tab</div>}
        </div>
      </div>

      <div className="progress-bar">
        <progress value={videoProgress} max="100"></progress>
        <span>{Math.floor(videoProgress)}%</span>
      </div>

      <div className="reward-controls">
        <button disabled={!rewardClaimed || dailyLimitReached}>
          {dailyLimitReached ? "Limit Reached" : rewardClaimed ? "Reward Granted" : "Watch to Claim"}
        </button>
        <button onClick={reportAd} disabled={adReported}>
          {adReported ? "Reported" : "Report Ad"}
        </button>
      </div>

      <footer className="video-footer">
        <p>💰 Balance: {userData.balance.toFixed(2)} TCoins</p>
        <p>🔥 Streak: {userData.streak}</p>
        <p>🎖️ XP: {userData.xp || 0}</p>
        <p>🎬 Ads Watched Today: {(userData.videoWatchDates || []).filter(d => d === new Date().toDateString()).length} / {DAILY_VIDEO_LIMIT}</p>
        <div className="nav-buttons">
          <button onClick={() => navigate("/Home")}>🏠 Home</button>
          <button onClick={() => navigate("/Wallet")}>💼 Wallet</button>
          <button onClick={() => navigate("/Tasks")}>📋 Tasks</button>
        </div>
      </footer>
    </div>
  );
};

export default VideoPage;
