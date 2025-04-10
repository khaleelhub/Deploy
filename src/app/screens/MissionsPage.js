import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../Appcss/MissionsPage.css";

const MissionsPage = () => {
  const [userData, setUserData] = useState(null);
  const [missions, setMissions] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [missionStatus, setMissionStatus] = useState("Not Started");
  const [userBalance, setUserBalance] = useState(0);
  const [error, setError] = useState("");
  const [missionCompletion, setMissionCompletion] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedMissions, setCompletedMissions] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchData = async () => {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
            setUserBalance(userSnap.data().balance);
            setCompletedMissions(userSnap.data().completedMissions || []);
            setMissions(userSnap.data().missions || []);
          } else {
            setError("User data not found");
          }
          setLoading(false); // Set loading to false after data is fetched
        };
        fetchData();
      } else {
        setLoading(false); // Set loading to false if user is not logged in
      }
    });

    return () => unsubscribe(); // Cleanup on unmount

  }, []);

  // Function to start a mission
  const startMission = (mission) => {
    setCurrentMission(mission);
    setMissionStatus("In Progress");
  };

  // Function to complete a mission
  const completeMission = async () => {
    if (missionCompletion < 100) {
      setError("Mission not completed yet!");
      return;
    }

    const updatedMission = {
      ...currentMission,
      status: "Completed",
      completionTime: new Date(),
      reward: currentMission.reward,
    };

    try {
      await updateDoc(doc(db, "users", userData.id), {
        missions: arrayUnion(updatedMission),
        balance: userBalance + currentMission.reward,
        completedMissions: arrayUnion(currentMission),
      });

      setRewardClaimed(true);
      setUserBalance(userBalance + currentMission.reward);
      setMissionStatus("Completed");
      setCompletedMissions([...completedMissions, currentMission]);
    } catch (err) {
      setError("Error completing mission.");
    }
  };

  // Function to reset mission status
  const resetMission = () => {
    setMissionStatus("Not Started");
    setMissionCompletion(0);
    setRewardClaimed(false);
  };

  // Function to handle viewing mission details
  const viewMissionDetails = (mission) => {
    alert(`Mission Details: ${mission.details}`);
  };

  // Function to share progress on social media
  const shareOnSocial = (mission) => {
    const message = `Check out my progress on the mission: ${mission.name}`;
    // Example: Use a social sharing API here (like Twitter or Facebook)
    alert(`Sharing on social media: ${message}`);
  };

  // Function to track mission completion progress
  const trackMissionProgress = () => {
    setMissionCompletion((prev) => Math.min(prev + 10, 100));
  };

  const missionComponents = missions.map((mission, index) => (
    <div key={index} className="mission-item">
      <h3>{mission.name}</h3>
      <p>{mission.details}</p>
      <p>Reward: {mission.reward} Coins</p>
      <p>Status: {missionStatus}</p>
      <button onClick={() => startMission(mission)}>
        {missionStatus === "Not Started" ? "Start Mission" : "In Progress"}
      </button>
      {missionStatus === "In Progress" && (
        <button onClick={completeMission}>Complete Mission</button>
      )}
      {missionStatus === "Completed" && !rewardClaimed && (
        <button onClick={completeMission}>Claim Reward</button>
      )}
      {missionStatus !== "Completed" && (
        <button onClick={resetMission}>Reset Mission</button>
      )}
      <button onClick={() => viewMissionDetails(mission)}>View Mission Details</button>
      <button onClick={() => shareOnSocial(mission)}>Share on Social</button>
    </div>
  ));

  return (
    <div className="missions-container">
      <h1>🔥 Daily Missions</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="user-info">
            <h3>Balance: {userBalance} Coins</h3>
            <h4>Completed Missions: {completedMissions.length}</h4>
          </div>
          {error && <div className="error">{error}</div>}
          {missionComponents.length === 0 ? (
            <div>No missions available</div>
          ) : (
            missionComponents
          )}
        </>
      )}
    </div>
  );
};

export default MissionsPage;
