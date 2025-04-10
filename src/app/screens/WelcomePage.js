import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.welTxt}>Welcome to Tcoins</h1>
      <p style={styles.subTitle}>Simple Way To Earn!</p>

      <button style={styles.startBtn} onClick={() => navigate("Login")}>
        Start
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
    padding: "20px",
  },
  startBtn: {
    padding: "15px 40px",
    fontSize: "18px",
    marginTop: "420px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "5px",
  },
  welTxt: {
    marginTop: "15px",

  }, 
  subTitle: {
    marginTop: "20px",
  }
};

export default Welcome;
