import { useEffect, useState } from "react";
import {
  auth,
  db,
  signInWithPopup,
  googleProvider
} from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import "../Appcss/Signup.css";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get("ref");
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [location.search]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: username
      });

      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      const userData = {
        username,
        email,
        uid: user.uid,
        balance: 0,
        referralCode: generateReferralCode(username),
        referredBy: referralCode || null,
        createdAt: new Date().toISOString(),
        referrals: []
      };

      await setDoc(userRef, userData);

      if (referralCode) {
        const refQuery = await getDoc(doc(db, "referralCodes", referralCode));
        if (refQuery.exists()) {
          const referrerUid = refQuery.data().uid;
          const refUserRef = doc(db, "users", referrerUid);
          await updateDoc(refUserRef, {
            balance: refQuery.data().balance + 10,
            referrals: [...(refQuery.data().referrals || []), user.uid]
          });
        }
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/login");
    } catch (err) {
      setError("Google signup failed");
    }
  };

  const generateReferralCode = (name) => {
    return name.toLowerCase() + Math.floor(Math.random() * 10000);
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSignup} className="signup-form">
        <h2>Create Your MineFlow Account</h2>
        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Referral Code (Optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />

        <button type="submit" className="btn-primary">
          Sign Up
        </button>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="btn-google"
        >
          Sign Up with Google
        </button>

        <p>
          Already have an account? <a onClick={() => navigate('/login')}>Login</a>
        </p>
      </form>
    </div>
  );
}
