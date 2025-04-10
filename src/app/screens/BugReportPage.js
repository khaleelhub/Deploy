import React, { useState } from "react";
import { db } from "../firebase"; // Firebase config
import { collection, addDoc } from "firebase/firestore";
import "../Appcss/BugReportPage.css"; // Import the CSS

const BugReportPage = () => {
  const [bugDescription, setBugDescription] = useState("");
  const [bugCategory, setBugCategory] = useState("");
  const [bugPriority, setBugPriority] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [bugAttachment, setBugAttachment] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBugReportSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    const reportData = {
      description: bugDescription,
      category: bugCategory,
      priority: bugPriority,
      email: userEmail,
      attachment: bugAttachment ? bugAttachment.name : null, // Store attachment name if exists
      status: "Pending",
      createdAt: new Date(),
    };

    try {
      // Save the bug report to Firebase
      await addDoc(collection(db, "bugReports"), reportData);
      setSubmitStatus("Thank you! Your bug report has been submitted. We will get back to you soon.");
    } catch (error) {
      setSubmitStatus("There was an error submitting your bug report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentChange = (event) => {
    setBugAttachment(event.target.files[0]);
  };

  return (
    <div className="bug-report-container">
      <h2>Bug Report</h2>
      {submitStatus && <p className="submit-status">{submitStatus}</p>}
      
      <form onSubmit={handleBugReportSubmit}>
        <div className="form-group">
          <label>Bug Description</label>
          <textarea
            value={bugDescription}
            onChange={(e) => setBugDescription(e.target.value)}
            placeholder="Describe the bug"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Bug Category</label>
          <select
            value={bugCategory}
            onChange={(e) => setBugCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="UI Bug">UI Bug</option>
            <option value="Functionality Bug">Functionality Bug</option>
            <option value="Performance Bug">Performance Bug</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Bug Priority</label>
          <select
            value={bugPriority}
            onChange={(e) => setBugPriority(e.target.value)}
            required
          >
            <option value="">Select Priority</option>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email (Optional)</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Your email address"
          />
        </div>

        <div className="form-group">
          <label>Attachment (Optional)</label>
          <input
            type="file"
            onChange={handleAttachmentChange}
            accept="image/*, video/*"
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Submitting..." : "Submit Bug Report"}
        </button>
      </form>

      <div className="contact-options">
        <h3>Need Urgent Help?</h3>
        <button className="contact-btn">
          <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
            Contact via WhatsApp
          </a>
        </button>
        <button className="contact-btn">
          <a href="tel:+1234567890">
            Call Support
          </a>
        </button>
      </div>
    </div>
  );
};

export default BugReportPage;
