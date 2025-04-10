import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../Appcss/QuizzesPage.css";

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [quizMode, setQuizMode] = useState("quiz");
  const [userScore, setUserScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [category, setCategory] = useState("General");
  const [timer, setTimer] = useState(15);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.email === "admin@mineflow.com");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const q = query(collection(db, "quizzes"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuizzes(data);
      setFilteredQuizzes(data);
      setLoading(false);
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) setTimer((t) => t - 1);
      else setMessage("Time's up!");
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const filtered = quizzes.filter((q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuizzes(filtered);
  }, [searchTerm, quizzes]);

  const handleOptionClick = (index) => {
    setSelectedOption(index);
    if (index === quizzes[activeQuestionIndex].correctAnswer) {
      setMessage("Correct!");
      setUserScore((score) => score + 10);
    } else {
      setMessage("Wrong answer");
    }
    setExplanation(quizzes[activeQuestionIndex].explanation || "No explanation");
    setTimeout(() => {
      if (activeQuestionIndex + 1 < quizzes.length) {
        setActiveQuestionIndex((i) => i + 1);
        setSelectedOption(null);
        setMessage("");
        setTimer(15);
        setExplanation("");
      } else {
        setQuizCompleted(true);
      }
    }, 2000);
  };

  const handlePostQuiz = async () => {
    if (!question || options.some((opt) => opt.trim() === "")) return;
    const newQuiz = {
      question,
      options,
      correctAnswer,
      explanation,
      category,
      timestamp: Timestamp.now(),
      author: user.email,
    };
    const docRef = await addDoc(collection(db, "quizzes"), newQuiz);
    setQuizzes([{ id: docRef.id, ...newQuiz }, ...quizzes]);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setExplanation("");
    setCategory("General");
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this quiz?")) {
      await deleteDoc(doc(db, "quizzes", id));
      setQuizzes(quizzes.filter((q) => q.id !== id));
    }
  };

  return (
    <div className="quiz-container">
      <h1>🧠 Daily Quiz</h1>
      <input
        type="text"
        placeholder="Search quizzes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="quiz-search"
      />

      {isAdmin && (
        <div className="quiz-form">
          <h2>Add New Quiz</h2>
          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
            />
          ))}
          <input
            type="number"
            placeholder="Correct Option Index (0-3)"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(parseInt(e.target.value))}
          />
          <textarea
            placeholder="Explanation (optional)"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>General</option>
            <option>Tech</option>
            <option>Crypto</option>
            <option>Security</option>
          </select>
          <button onClick={handlePostQuiz}>Post Quiz</button>
        </div>
      )}

      {!quizCompleted ? (
        <div className="quiz-card">
          <h3>{quizzes[activeQuestionIndex]?.question}</h3>
          <div className="options">
            {quizzes[activeQuestionIndex]?.options.map((opt, index) => (
              <button
                key={index}
                className={
                  selectedOption === index ? "selected" : "option-button"
                }
                onClick={() => handleOptionClick(index)}
                disabled={selectedOption !== null}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="message">{message}</p>
          {explanation && <p className="explanation">💡 {explanation}</p>}
          <p className="timer">⏱ Time Left: {timer}s</p>
        </div>
      ) : (
        <div className="quiz-summary">
          <h2>🎉 Quiz Completed!</h2>
          <p>Total Score: {userScore}</p>
        </div>
      )}

      <div className="quiz-list">
        <h3>All Quizzes</h3>
        {filteredQuizzes.map((q) => (
          <div key={q.id} className="quiz-item">
            <p><strong>{q.question}</strong></p>
            <p>Category: {q.category}</p>
            <p>Author: {q.author}</p>
            <p>Time: {q.timestamp.toDate().toLocaleString()}</p>
            {isAdmin && (
              <button onClick={() => handleDelete(q.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizzesPage;
