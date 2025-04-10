import React, { useState } from "react";
import axios from "axios";
import { db, auth } from "../firebase";
import { updateDoc, doc } from "firebase/firestore";
import "../Appcss/AccountUpgradePage.css";

const AccountUpgradePage = () => {
  const [paymentMethod, setPaymentMethod] = useState("atm");
  const [atmCard, setAtmCard] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [upgradeTier, setUpgradeTier] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'completed', 'failed'

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmitPayment = async () => {
    setLoading(true);
    setPaymentStatus("processing");
    try {
      // Validate the input fields
      if (paymentMethod === "atm" && !atmCard) {
        setError("Please enter your ATM card number.");
        setLoading(false);
        setPaymentStatus("failed");
        return;
      } else if (paymentMethod === "bank" && !bankAccount) {
        setError("Please enter your bank account number.");
        setLoading(false);
        setPaymentStatus("failed");
        return;
      }

      // Apply discount if available
      let finalAmount = upgradeTier === "basic" ? 10 : 50;
      if (discountCode === "DISCOUNT10" && !discountApplied) {
        finalAmount *= 0.9; // 10% discount
        setDiscountApplied(true);
      }

      // Call your payment API to process the payment
      const paymentData = {
        paymentMethod,
        amount: finalAmount,
        atmCard: paymentMethod === "atm" ? atmCard : null,
        bankAccount: paymentMethod === "bank" ? bankAccount : null,
      };

      const response = await axios.post("/api/payment", paymentData);

      if (response.data.success) {
        // If payment is successful, update user data in Firestore
        const user = auth.currentUser;
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          accountTier: upgradeTier,
        });

        setSuccess(true);
        setPaymentStatus("completed");

        // Log transaction in the user's transaction history
        const transaction = {
          date: new Date(),
          tier: upgradeTier,
          amount: finalAmount,
          status: "successful",
        };
        setTransactionHistory((prevHistory) => [...prevHistory, transaction]);
      } else {
        setError("Payment failed. Please try again.");
        setPaymentStatus("failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setPaymentStatus("failed");
    }
    setLoading(false);
  };

  // Function to send an email or notification to the user
  const sendNotification = () => {
    // Placeholder function for sending email or push notification
    alert("You will receive a notification once your account is upgraded.");
  };

  return (
    <div className="account-upgrade-container">
      <h1>Upgrade Your Account</h1>
      <div className="payment-method-selector">
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="atm"
            checked={paymentMethod === "atm"}
            onChange={handlePaymentMethodChange}
          />
          ATM Card
        </label>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="bank"
            checked={paymentMethod === "bank"}
            onChange={handlePaymentMethodChange}
          />
          Bank Account
        </label>
      </div>

      {paymentMethod === "atm" && (
        <div className="atm-card-input">
          <label>ATM Card Number:</label>
          <input
            type="text"
            value={atmCard}
            onChange={(e) => setAtmCard(e.target.value)}
            placeholder="Enter your ATM card number"
          />
        </div>
      )}

      {paymentMethod === "bank" && (
        <div className="bank-account-input">
          <label>Bank Account Number:</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Enter your bank account number"
          />
        </div>
      )}

      <div className="upgrade-tier-selector">
        <label>
          <input
            type="radio"
            name="upgradeTier"
            value="basic"
            checked={upgradeTier === "basic"}
            onChange={() => setUpgradeTier("basic")}
          />
          Basic Tier - $10
        </label>
        <label>
          <input
            type="radio"
            name="upgradeTier"
            value="premium"
            checked={upgradeTier === "premium"}
            onChange={() => setUpgradeTier("premium")}
          />
          Premium Tier - $50
        </label>
      </div>

      <div className="discount-code-input">
        <label>Have a discount code?</label>
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Enter discount code"
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Payment successful! Your account has been upgraded.</div>}
      {paymentStatus === "processing" && <div>Processing payment...</div>}
      {paymentStatus === "failed" && <div>Payment failed, please try again.</div>}

      <button onClick={handleSubmitPayment} disabled={loading}>
        {loading ? "Processing..." : "Upgrade Account"}
      </button>

      <div className="transaction-history">
        <h3>Your Transaction History</h3>
        <ul>
          {transactionHistory.map((transaction, index) => (
            <li key={index}>
              <p>Date: {new Date(transaction.date).toLocaleString()}</p>
              <p>Tier: {transaction.tier}</p>
              <p>Amount: ${transaction.amount}</p>
              <p>Status: {transaction.status}</p>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={sendNotification}>Send Upgrade Notification</button>
    </div>
  );
};

export default AccountUpgradePage;
