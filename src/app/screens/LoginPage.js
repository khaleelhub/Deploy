import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../Appcss/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem('userEmail', email);
      } else {
        localStorage.removeItem('userEmail');
      }
      navigate('/Home');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/Home");
    } catch (err) {
      setError("Google login failed \n Check Your Wifi Or Internet Connection ");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Welcome Back to MineFlow</h2>
        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="eye-icon" onClick={togglePassword}>
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <div className="extras">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            /> Remember me
          </label>
          <a onClick= {()=> navigate('/Resentpassword')}>Forgot Password?</a>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !email || !password}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn-google"
        >
          Login with Google
        </button>

        <div className="actions">
          <p>
            Don't have an account? <a  onClick= {()=> navigate('/SignUp')}>Sign Up</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
