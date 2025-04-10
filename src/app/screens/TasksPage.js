import React, { useState, useEffect } from 'react';
import { db, auth } from "../firebase"; // Firebase config for tasks
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios"; // For making task-related API requests
import "../Appcss/TaskAndEarnPage.css"; // Import the CSS

const TaskAndEarnPage = () => {
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0); // Track progress for each task
  const [error, setError] = useState("");
  const [taskProcessing, setTaskProcessing] = useState(false);
  const [videoURL, setVideoURL] = useState(""); // For video task link

  // Fetch user data on authentication
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchUserData = async () => {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setCompletedTasks(docSnap.data().completedTasks || []);
          } else {
            setError("User data not found");
          }
        };
        fetchUserData();
      }
    });
  }, []);

  // Fetch tasks from Firebase or API (or both)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Example API call for tasks
        const response = await axios.get("/api/tasks"); // Get tasks from your server
        setTasks(response.data);
      } catch (err) {
        setError("Error fetching tasks.");
      }
    };
    fetchTasks();
  }, []);

  // Function to handle task completion
  const handleTaskCompletion = async (taskId) => {
    if (taskProgress < 100) {
      setError("Please complete the task before submitting.");
      return;
    }

    setTaskProcessing(true);

    const task = tasks.find((task) => task.id === taskId);
    const newCompletedTask = {
      id: task.id,
      name: task.name,
      reward: task.reward,
      timestamp: new Date(),
    };

    try {
      // Update user's completed tasks in Firebase
      await updateDoc(doc(db, "users", userData.id), {
        completedTasks: arrayUnion(newCompletedTask),
      });

      // Update the completed tasks in local state
      setCompletedTasks([...completedTasks, newCompletedTask]);

      // Optionally, make a call to reward the user (e.g., send tokens, coins)
      await axios.post("/api/reward", {
        userId: userData.id,
        reward: task.reward,
      });

      setTaskProcessing(false);
    } catch (err) {
      setError("Error completing task.");
      setTaskProcessing(false);
    }
  };

  // Function to track task progress (example)
  const trackTaskProgress = (taskId, videoLink) => {
    // Set the video URL for the task
    setVideoURL(videoLink);

    // Simulate task progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setTaskProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 1000); // Every second

    setSelectedTask(taskId); // Store selected task ID to track progress
  };

  return (
    <div className="task-and-earn-container">
      <h2>Task and Earn</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="task-list">
        {tasks.map((task) => (
          <div className="task-item" key={task.id}>
            <h3>{task.name}</h3>
            <p>{task.description}</p>
            <div className="task-reward">
              <span>Reward: {task.reward} Coins</span>
            </div>
            {task.videoLink && (
              <div className="task-video">
                <a href={task.videoLink} target="_blank" rel="noopener noreferrer">
                  <img src={task.videoThumbnail} alt="Video Thumbnail" />
                  Watch Video for Task
                </a>
              </div>
            )}
            <button
              className="task-btn"
              onClick={() => trackTaskProgress(task.id, task.videoLink)}
              disabled={taskProcessing}
            >
              {taskProcessing ? "Processing..." : "Start Task"}
            </button>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="task-progress">
          <h3>Progress</h3>
          <div className="progress-bar">
            <div
              className="progress-bar-filled"
              style={{ width: `${taskProgress}%` }}
            ></div>
          </div>
          {taskProgress === 100 && (
            <button
              className="task-complete-btn"
              onClick={() => handleTaskCompletion(selectedTask)}
              disabled={taskProcessing}
            >
              {taskProcessing ? "Completing..." : "Complete Task"}
            </button>
          )}
        </div>
      )}

      <div className="completed-tasks">
        <h3>Completed Tasks</h3>
        {completedTasks.length > 0 ? (
          completedTasks.map((task, index) => (
            <div className="completed-task-item" key={index}>
              <p>{task.name}</p>
              <span>{task.reward} Coins</span>
            </div>
          ))
        ) : (
          <p>No tasks completed yet.</p>
        )}
      </div>
    </div>
  );
};

export default TaskAndEarnPage;
