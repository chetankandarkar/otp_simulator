import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function GenerateOtp() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const [showValidatePopup, setShowValidatePopup] = useState(false);
  const [otp, setOtp] = useState('');
  const [validateStatus, setValidateStatus] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes
  const API_URL = process.env.REACT_APP_API_URL;
  const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

  const navigate = useNavigate();

  useEffect(() => {
    let countdown;

    if (showValidatePopup) {
      document.body.style.overflow = 'hidden'; // Disable scroll when popup is open
    } else {
      document.body.style.overflow = 'hidden'; // Still disable for main page
    }

    if (showValidatePopup && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setShowValidatePopup(false);
      setOtp('');
      setStatus('❌ OTP expired. Please generate a new OTP.');
    }

    return () => {
      clearInterval(countdown);
    };
  }, [showValidatePopup, timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('❌ Enter a valid email address.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Generating OTP...');
    setStatus('');

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('action', 'generateotp');
      formData.append('secretkey', SECRET_KEY);

      const response = await axios.post(
        API_URL,
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.data.status === 'success') {
        setStatus('✅ ' + response.data.message);
        setShowValidatePopup(true);
        setTimer(600);
        setValidateStatus('');
      } else {
        setStatus('❌ ' + response.data.message);
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const handleValidateOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 4) {
      setValidateStatus('❌ Enter a valid 4-digit OTP.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Validating OTP...');
    setValidateStatus('');

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('action', 'validateotp');
      formData.append('secretkey', SECRET_KEY);
      formData.append('otp', otp);

      const response = await axios.post(
        API_URL,
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.data.status === 'success') {
        setValidateStatus('✅ ' + response.data.message);
        setTimeout(() => {
          setShowValidatePopup(false);
          setOtp('');
          navigate('/success');
        }, 1000);
      } else {
        setValidateStatus('❌ ' + response.data.message);
      }
    } catch (error) {
      console.error(error);
      setValidateStatus('❌ Something went wrong during OTP validation.');
    }

    setLoading(false);
  };

  const handleClosePopup = () => {
    setShowValidatePopup(false);
    setOtp('');
  };

  const formatTimer = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div style={styles.pageWrapper}>
      {!showValidatePopup && (
        <div style={styles.container}>
          <h2 style={styles.title}>Generate OTP</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading && loadingMessage === 'Generating OTP...' ? (
                <span>🔄 Generating OTP...</span>
              ) : (
                'Generate OTP'
              )}
            </button>
          </form>
          {status && <p style={styles.status}>{status}</p>}
          <button
  style={styles.backButton}
  onClick={() => navigate('/')}
>
Back to Home
</button>
        </div>
      )}

      {showValidatePopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <span style={styles.closeIcon} onClick={handleClosePopup}>
              &times;
            </span>
            <h2 style={styles.title}>Enter OTP</h2>
            <p style={styles.sentMessage}>✅ The OTP has been sent to your email ID</p>
            <p style={styles.timer}>⏳ Time remaining: {formatTimer(timer)}</p>
            <form onSubmit={handleValidateOtp} style={styles.form}>
              <input
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 4) setOtp(val);
                }}
                style={styles.input}
                required
              />
              <button type="submit" style={styles.button} disabled={loading}>
                {loading && loadingMessage === 'Validating OTP...' ? (
                  <span>🔄 Validating OTP...</span>
                ) : (
                  'Validate OTP'
                )}
              </button>
              {validateStatus && <p style={styles.validateStatus}>{validateStatus}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f0f2f5',
    overflow: 'hidden', // Disable scroll
  },
  container: {
    width: '100%',
    maxWidth: '500px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  button: {
    padding: '12px',
    fontSize: '1rem',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    width: 'auto',
    alignSelf: 'center',
  },
  status: {
    marginTop: '15px',
    fontSize: '0.95rem',
    color: '#555',
  },
  popupOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  popup: {
    position: 'relative',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    padding: '20px',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '1.5rem',
    color: '#999',
    cursor: 'pointer',
  },
  timer: {
    fontSize: '1rem',
    color: '#333',
    marginBottom: '10px',
  },
  validateStatus: {
    marginTop: '10px',
    fontSize: '0.95rem',
    color: '#555',
  },
  backButton: {
  marginTop: '20px',
  padding: '12px',
  fontSize: '1rem',
  backgroundColor: '#FFD700', // yellow
  color: '#000',
  alignSelf: 'center', // Center inside flex container
  width: 'auto',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
},sentMessage: {
  fontSize: '1rem',
  color: '#000000ff',
  marginBottom: '8px',
  fontWeight: '500',
},
};

export default GenerateOtp;
