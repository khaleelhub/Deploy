import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";
import "../Appcss/Aichat.css";

const Aichat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Fetch user data from Firebase
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (userInput.trim() === "") return;
    setMessages([...messages, { sender: "user", text: userInput }]);
    setUserInput("");
    fetchBotResponse(userInput);
  };

  const fetchBotResponse = async (query) => {
    setLoading(true);
    setIsTyping(true);

    // AI response simulation
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "I'm thinking..." },
      ]);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: `Your request for: "${query}" is being processed.` },
        ]);
      }, 1500);
    }, 1500);
  };

  const handleVoiceInput = () => {
    // Implement voice-to-text functionality
  };

  const saveChatHistory = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        chatHistory: [...messages],
      });
    }
  };

  useEffect(() => {
    saveChatHistory();
  }, [messages]);

  return (
    <div className="ai-chat-container">
      <h1>Ai Chat - Mining Assistant</h1>
      <div className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.sender}`}>
            <p>{message.text}</p>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">...</div>}
      </div>

      <div className="input-container">
        <textarea
          value={userInput}
          onChange={handleUserInput}
          placeholder="Ask me something about your mining tasks..."
          rows="2"
        />
        <button onClick={handleSendMessage}>Send</button>
        <button onClick={handleVoiceInput}>🎙️</button>
      </div>
    </div>
  );
};

export default Aichat;
