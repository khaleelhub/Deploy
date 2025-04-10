import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom'; // React Router for navigation
import '../Appcss/ResetPassword.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Navigation hook

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Send password reset email
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setSuccess('Password reset email sent! Please check your inbox.');
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div className="reset-password-container">
      <h2 className='resent'>Reset Password</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handlePasswordReset}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading || !email}>
          {loading ? 'Sending email...' : 'Reset Password'}
        </button>
      </form>
      <div className="actions">
        <button onClick={() => navigate('/Login')}>Back to Login</button>
      </div>
    </div>
  );
};

export default ResetPassword;
