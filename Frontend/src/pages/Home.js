import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function Home() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const allowedEmails = process.env.REACT_APP_ALLOWED_EMAILS?.split(',') || [];

  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const userEmail = decoded.email;

    if (allowedEmails.includes(userEmail)) {
      navigate('/unlockuser', { state: { user: decoded } });
    } else {
      setError('Access denied: Unauthorized email.');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.heading}>OTP Simulator</h1>

        <div style={styles.verticalButtons}>
          <button
            style={{ ...styles.navButton, backgroundColor: 'violet' }}
            onClick={() => navigate('/about')}
          >
            About
          </button>
          <button
            style={{ ...styles.navButton, backgroundColor: 'green', color: 'white' }}
            onClick={() => navigate('/generateotp')}
          >
            Generate OTP
          </button>
          <button
            style={{ ...styles.navButton, backgroundColor: 'orange' }}
            onClick={() => navigate('/validateotp')}
          >
            Validate OTP
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={styles.description}>Unlock User (Only for Admin)</p>
            <div style={styles.googleLoginWrapper}>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google Login Failed')}
                text="continue_with"
                shape="pill"
                size="medium"
                ux_mode="popup"
                width="250"
                prompt="select_account"
              />
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
    boxSizing: 'border-box',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '40px',
  },
  verticalButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
  },
  navButton: {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    width: '100%',
    cursor: 'pointer',
  },
  googleLoginWrapper: {
    transform: 'scale(0.95)',
    marginTop: '0px', // No gap between label and button
  },
  description: {
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '5px', // slight spacing to avoid visual overlap
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default Home;
