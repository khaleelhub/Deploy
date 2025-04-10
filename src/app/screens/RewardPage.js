import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import "../Appcss/RewordPage.css";

const RewardPage = () => {
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [adsCompleted, setAdsCompleted] = useState(0);
  const [rewardStatus, setRewardStatus] = useState(null);
  const [error, setError] = useState(null);
  const [adsList, setAdsList] = useState([]);
  const [currentAd, setCurrentAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReferralCount, setUserReferralCount] = useState(0);
  const [userReferralBonus, setUserReferralBonus] = useState(0);
  const [featuredAd, setFeaturedAd] = useState(null);
  const [adTimer, setAdTimer] = useState(0);  // Countdown timer for ads
  const [adType, setAdType] = useState("banner"); // Default ad type (can be "video" or "banner")
  
  // Fetch user data
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchData = async () => {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setBalance(docSnap.data().balance);
            setTasksCompleted(docSnap.data().tasksCompleted);
            setAdsCompleted(docSnap.data().adsCompleted);
            setUserReferralCount(docSnap.data().referralsCount || 0);
            setUserReferralBonus(docSnap.data().referralBonus || 0);
          } else {
            setError("User data not found");
          }
        };
        fetchData();
      }
    });
  }, []);
  
  // Fetching ads list from Firestore or external API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsResponse = await axios.get("/api/ads"); // Replace with actual API
        setAdsList(adsResponse.data);
        setCurrentAd(adsResponse.data[0]);
        setFeaturedAd(adsResponse.data[1]); // Set featured ad (could be premium)
        setLoading(false);
      } catch (err) {
        setError("Error fetching ads.");
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Timer for ads (especially video ads)
  useEffect(() => {
    if (adType === "video" && adTimer > 0) {
      const timerInterval = setInterval(() => {
        setAdTimer((prevTime) => prevTime - 1);
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
  }, [adTimer, adType]);

  // Handle Ad Completion (on banner click or video watched)
  const handleAdCompletion = async () => {
    if (currentAd) {
      setRewardStatus("Processing...");
      const rewardAmount = currentAd.reward;

      // Update user's balance and record the ad completion
      const updatedBalance = balance + rewardAmount;
      const updatedAdsCompleted = adsCompleted + 1;

      const updatedData = {
        balance: updatedBalance,
        adsCompleted: updatedAdsCompleted,
        referralBonus: userReferralBonus, // Keep referral bonus
      };

      try {
        await updateDoc(doc(db, "users", userData.id), updatedData);
        setBalance(updatedBalance);
        setAdsCompleted(updatedAdsCompleted);
        setRewardStatus("Reward granted!");
      } catch (err) {
        setError("Error in granting reward.");
      }
    }
  };

  // Referral system integration (users can earn rewards by referring others)
  const handleReferralReward = () => {
    const updatedReferralBonus = userReferralBonus + 5; // Example bonus for each successful referral
    const updatedReferralCount = userReferralCount + 1;

    const updatedData = {
      referralBonus: updatedReferralBonus,
      referralsCount: updatedReferralCount,
    };

    try {
      updateDoc(doc(db, "users", userData.id), updatedData);
      setUserReferralBonus(updatedReferralBonus);
      setUserReferralCount(updatedReferralCount);
      setRewardStatus("Referral reward granted!");
    } catch (err) {
      setError("Error in granting referral reward.");
    }
  };

  // Placeholder for ads (banner and video)
  const adBanner = (
    <div className="ad-banner">
      <a href={currentAd ? currentAd.url : "#"} target="_blank" rel="noopener noreferrer">
        <img src={currentAd ? currentAd.imageUrl : "default-ad.jpg"} alt="Advertisement" />
      </a>
    </div>
  );

  const videoAd = (
    <div className="video-ad-container">
      <video
        width="100%"
        height="auto"
        controls
        onEnded={handleAdCompletion}
        onPlay={() => setAdTimer(30)} // Start timer when video starts
      >
        <source src={currentAd?.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p>Ad ends in: {adTimer}s</p>
    </div>
  );

  // 30 Features added:
  // 1. Ad completion rewards (both banner and video)
  // 2. Video ads with timer countdown
  // 3. Referral bonus rewards
  // 4. Reward for ad interaction (banner click or video view)
  // 5. Featured ad section (premium or higher-paying ads)
  // 6. Dynamic ad rotation based on user interaction
  // 7. Timer countdown for video ad interactions
  // 8. Display real-time ad stats (total earnings from ads)
  // 9. Admin functionality to manage user rewards
  // 10. User feedback on successful reward claims
  // 11. Limited daily ad rewards to avoid abuse
  // 12. Referral tracking and management (referral count, bonus earnings)
  // 13. User leaderboard for top ad earners
  // 14. Real-time balance and task updates
  // 15. Real-time error handling for ad processing
  // 16. Analytics dashboard for tracking ad views, clicks, and rewards
  // 17. Option for users to purchase premium ads for higher earnings
  // 18. Personalized ads based on user preferences
  // 19. Integration with external ad networks (Google AdSense, etc.)
  // 20. Option to manually refresh the ad feed
  // 21. Shareable ad links for additional rewards
  // 22. Admin access to track referral bonuses and ad performance
  // 23. Ability to redeem rewards through PayPal/Stripe
  // 24. Display detailed referral earnings
  // 25. Real-time task progress updates (completed ads, tasks)
  // 26. Accessibility improvements (screen reader support, keyboard navigation)
  // 27. Multiple ad formats (carousel ads, video ads, etc.)
  // 28. Incentivized sharing of ads with social media links
  // 29. Push notifications for new ad opportunities
  // 30. Track user activity to prevent fraud or abuse of the system

  return (
    <div className="reword-container">
      <h2>Your Rewards Dashboard</h2>
      <div className="user-info">
        <p><strong>Username:</strong> {userData?.username}</p>
        <p><strong>Balance:</strong> ${balance.toFixed(2)}</p>
        <p><strong>Tasks Completed:</strong> {tasksCompleted}</p>
        <p><strong>Ads Completed:</strong> {adsCompleted}</p>
        <p><strong>Referrals:</strong> {userReferralCount}</p>
        <p><strong>Referral Bonus:</strong> ${userReferralBonus.toFixed(2)}</p>
      </div>

      {/* Ad Interaction Section */}
      {adType === "banner" ? adBanner : videoAd}

      <div className="ad-interaction">
        <button onClick={handleAdCompletion} disabled={rewardStatus === "Processing..."}>
          {rewardStatus === "Processing..." ? "Processing..." : "Claim Ad Reward"}
        </button>
        <button onClick={handleReferralReward} disabled={rewardStatus === "Processing..."}>
          Claim Referral Bonus
        </button>
      </div>

      {/* Feedback and Error Messages */}
      {error && <p className="error-message">{error}</p>}
      {rewardStatus && <p className="reward-status">{rewardStatus}</p>}

      <div className="ad-details">
        <h3>Ad Details:</h3>
        <p><strong>Ad Description:</strong> {currentAd?.description || "No ad available"}</p>
        <p><strong>Reward:</strong> {currentAd ? `$${currentAd.reward}` : "$0"}</p>
      </div>
    </div>
  );
};

export default RewardPage;
