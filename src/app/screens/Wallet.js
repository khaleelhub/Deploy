import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Firebase config for wallet
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios"; // For making payment API requests
import "../Appcss/WalletPage.css";

const WalletPage = () => {
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [airtimeAmount, setAirtimeAmount] = useState("");
  const [receiverAccount, setReceiverAccount] = useState("");
  const [amountToSend, setAmountToSend] = useState("");
  const [error, setError] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);  // Feature: Toggle details view

  // Fetch user data on authentication
  useEffect(() => {
    setLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchData = async () => {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setBalance(docSnap.data().balance);
            setTransactionHistory(docSnap.data().transactionHistory || []);
          } else {
            setError("User data not found");
          }
          setLoading(false);
        };
        fetchData();
      } else {
        setLoading(false);
      }
    });
  }, []);

  // Feature: Handle transaction history sorting
  const sortTransactions = (order = 'asc') => {
    const sortedHistory = [...transactionHistory].sort((a, b) => {
      return order === 'asc'
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp;
    });
    setTransactionHistory(sortedHistory);
  };

  // Function to handle sending money to another user or account
  const handleSendMoney = async () => {
    if (parseFloat(amountToSend) <= 0 || parseFloat(amountToSend) > balance) {
      setError("Invalid amount or insufficient funds.");
      return;
    }

    setPaymentProcessing(true);
    const newTransaction = {
      type: "send",
      to: receiverAccount,
      amount: amountToSend,
      timestamp: new Date(),
      status: "pending", // Add status as pending
    };

    try {
      // Integrate Stripe/PayPal API here to process the payment.
      // Example using Stripe API (replace with actual integration):
      const paymentResponse = await axios.post("/api/payment", {
        amount: amountToSend,
        to: receiverAccount,
        userId: userData.id,
      });

      if (paymentResponse.status === 200) {
        // Store the transaction as pending until approved
        await updateDoc(doc(db, "users", userData.id), {
          transactionHistory: arrayUnion(newTransaction),
        });
        setTransactionHistory([...transactionHistory, newTransaction]);
        setPaymentProcessing(false);
        setPaymentSuccess(true);
      } else {
        setError("Payment failed. Please try again.");
        setPaymentProcessing(false);
        setPaymentSuccess(false);
      }
    } catch (err) {
      setError("Error in sending money.");
      setPaymentProcessing(false);
      setPaymentSuccess(false);
    }
  };

  // Feature: Handle Airtime purchase
  const handleBuyAirtime = async () => {
    if (parseFloat(airtimeAmount) <= 0 || parseFloat(airtimeAmount) > balance) {
      setError("Invalid airtime amount or insufficient funds.");
      return;
    }

    setPaymentProcessing(true);
    const newTransaction = {
      type: "airtime",
      amount: airtimeAmount,
      timestamp: new Date(),
      status: "pending", // Add status as pending
    };

    try {
      // Integrate airtime purchase API (example with mobile provider API)
      const airtimeResponse = await axios.post("/api/airtime-purchase", {
        amount: airtimeAmount,
        userId: userData.id,
      });

      if (airtimeResponse.status === 200) {
        // Store the transaction as pending until approved
        await updateDoc(doc(db, "users", userData.id), {
          transactionHistory: arrayUnion(newTransaction),
        });
        setTransactionHistory([...transactionHistory, newTransaction]);
        setPaymentProcessing(false);
        setPaymentSuccess(true);
      } else {
        setError("Airtime purchase failed. Please try again.");
        setPaymentProcessing(false);
        setPaymentSuccess(false);
      }
    } catch (err) {
      setError("Error in buying airtime.");
      setPaymentProcessing(false);
      setPaymentSuccess(false);
    }
  };

  // Feature: Toggle details (transaction history)
  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Function to approve or reject pending transaction (Admin functionality)
  const handleApproveTransaction = async (transactionId) => {
    const transactionRef = doc(db, "users", userData.id);
    const updatedTransaction = transactionHistory.map((transaction) =>
      transaction.timestamp === transactionId
        ? { ...transaction, status: "approved" } // Change status to approved
        : transaction
    );

    try {
      await updateDoc(transactionRef, {
        transactionHistory: updatedTransaction,
      });
      setTransactionHistory(updatedTransaction);
    } catch (err) {
      setError("Error approving transaction.");
    }
  };

  const handleRejectTransaction = async (transactionId) => {
    const transactionRef = doc(db, "users", userData.id);
    const updatedTransaction = transactionHistory.map((transaction) =>
      transaction.timestamp === transactionId
        ? { ...transaction, status: "rejected" } // Change status to rejected
        : transaction
    );

    try {
      await updateDoc(transactionRef, {
        transactionHistory: updatedTransaction,
      });
      setTransactionHistory(updatedTransaction);
    } catch (err) {
      setError("Error rejecting transaction.");
    }
  };

  return (
    <div className="wallet-container">
      <h2>Wallet</h2>
      {loading && <div className="loading">Loading...</div>}
      
      {/* Balance Section */}
      <div className="balance">
        <p>Balance: ${balance.toFixed(2)}</p>
      </div>

      {/* Toggle Details Button */}
      <button onClick={handleToggleDetails}>
        {showDetails ? "Hide Transaction History" : "Show Transaction History"}
      </button>

      {/* Transaction History Section */}
      {showDetails && (
        <div className="transaction-history">
          <h3>Transaction History</h3>
          <div className="sort-buttons">
            <button onClick={() => sortTransactions('asc')}>Sort Ascending</button>
            <button onClick={() => sortTransactions('desc')}>Sort Descending</button>
          </div>
          {transactionHistory.map((transaction, index) => (
            <div key={index} className="transaction-item">
              <p>Type: {transaction.type}</p>
              <p>Amount: ${transaction.amount}</p>
              <p>Timestamp: {new Date(transaction.timestamp).toLocaleString()}</p>
              <p>Status: {transaction.status}</p>
              {transaction.status === "pending" && (
                <div className="approval-buttons">
                  <button onClick={() => handleApproveTransaction(transaction.timestamp)}>
                    Approve
                  </button>
                  <button onClick={() => handleRejectTransaction(transaction.timestamp)}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Send Money Section */}
      <div className="send-money">
        <input
          type="text"
          placeholder="Receiver Account"
          value={receiverAccount}
          onChange={(e) => setReceiverAccount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount to send"
          value={amountToSend}
          onChange={(e) => setAmountToSend(e.target.value)}
        />
        <button onClick={handleSendMoney} disabled={paymentProcessing}>
          {paymentProcessing ? "Processing..." : "Send Money"}
        </button>
      </div>

      {/* Airtime Purchase Section */}
      <div className="airtime-purchase">
        <input
          type="number"
          placeholder="Airtime Amount"
          value={airtimeAmount}
          onChange={(e) => setAirtimeAmount(e.target.value)}
        />
        <button onClick={handleBuyAirtime} disabled={paymentProcessing}>
          {paymentProcessing ? "Processing..." : "Buy Airtime"}
        </button>
      </div>

      {/* Payment Status */}
      {paymentSuccess !== null && (
        <div className={`payment-status ${paymentSuccess ? "success" : "failure"}`}>
          {paymentSuccess ? "Payment Successful!" : "Payment Failed!"}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default WalletPage;
