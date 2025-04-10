// ReferralPage.js
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../Appcss/ReferralPage.css";

const ReferralPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserData(userData);
          setReferralLink(`${window.location.origin}/signup?ref=${user.uid}`);
          fetchReferrals(user.uid);
        }
        setLoading(false);
      } else {
        navigate("/Login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchReferrals = async (uid) => {
    const q = query(collection(db, "users"), where("referredBy", "==", uid));
    const querySnapshot = await getDocs(q);
    const referralList = [];
    querySnapshot.forEach((doc) => {
      referralList.push(doc.data());
    });
    setReferrals(referralList);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!userData) return <div className="error">User not found</div>;

  return (
    <div className="referral-page-container">
      <h2>Referral Program</h2>

      <div className="referral-box">
        <h3>Your Referral Link</h3>
        <input type="text" readOnly value={referralLink} className="referral-link" />
        <button onClick={copyReferralLink} className="copy-btn">
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <div className="referral-stats">
        <p>Total Referrals: <strong>{referrals.length}</strong></p>
        <p>Coins Earned: <strong>{referrals.length * 5}</strong></p>
      </div>

      <div className="referral-list">
        <h3>People You Referred</h3>
        {referrals.length === 0 ? (
          <p>No referrals yet.</p>
        ) : (
          <ul>
            {referrals.map((ref, idx) => (
              <li key={idx}>
                {ref.email || "Anonymous"} - Joined on {new Date(ref.createdAt?.seconds * 1000).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer>
        <button onClick={() => navigate("/Home")}>Home</button>
      </footer>
    </div>
  );
};

export default ReferralPage;
