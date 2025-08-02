import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function UnlockUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [unlockStatus, setUnlockStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [engineStatusMessage, setEngineStatusMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;
  const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
  const ADMIN_SECRET_KEY = process.env.REACT_APP_ADMIN_SECRET_KEY;

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    if (!location.state || !location.state.user) {
      localStorage.removeItem('adminUser');
      navigate('/', { replace: true });
    } else {
      const currentUser = location.state.user;
      setUser(currentUser);
      localStorage.setItem('adminUser', JSON.stringify(currentUser));
    }

    fetchCurrentEngineStatus(); // fetch status on load

    return () => {
      localStorage.removeItem('adminUser');
      document.body.style.overflow = 'auto';
    };
  }, [location.state, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/', { replace: true });
  };

  const handleUnlock = async () => {
    if (!email.trim()) {
      setUnlockStatus('❌ Please enter an email.');
      return;
    }

    setLoading(true);
    setUnlockStatus('');

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('secretkey', SECRET_KEY);
      formData.append('adminkey', ADMIN_SECRET_KEY);
      formData.append('action', 'unlockuser');

      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status === 'success') {
        setUnlockStatus('✅ ' + response.data.message);
        setEmail('');
      } else {
        setUnlockStatus('❌ ' + response.data.message);
      }
    } catch (error) {
      console.error(error);
      setUnlockStatus('❌ Failed to unlock user.');
    } finally {
      setLoading(false);
    }
  };

  const handleEngineStatusChange = async (status) => {
    setEngineStatusMessage('');
    try {
      const formData = new URLSearchParams();
      formData.append('email', user.email);
      formData.append('secretkey', SECRET_KEY);
      formData.append('adminkey', ADMIN_SECRET_KEY);
      formData.append('action', 'enginestatus');
      formData.append('status', status);

      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status === 'success') {
        setEngineStatusMessage('✅ Engine status updated to ' + status.toUpperCase());
      } else {
        setEngineStatusMessage('❌ ' + response.data.message);
      }
    } catch (error) {
      setEngineStatusMessage('❌ Failed to update engine status.');
      console.error(error);
    }
  };

  const fetchCurrentEngineStatus = async () => {
    try {
      const res = await axios.get('https://otp-engine-76ee3-default-rtdb.firebaseio.com/engine.json');
      if (res.data && res.data.status) {
        setEngineStatusMessage('OTP Engine currently: ' + res.data.status.toUpperCase());
      }
    } catch (err) {
      console.error('Error fetching engine status', err);
    }
  };

  if (!user) return null;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.userCard}>
        <h2 style={styles.heading}>Admin Panel</h2>
        <span style={styles.closeIcon} onClick={handleLogout}>&times;</span>
        <h3>Name: {user.name}</h3>
        <p>Email: {user.email}</p>

       {engineStatusMessage && <p style={{ ...styles.status, fontWeight: 'bold' }}>{engineStatusMessage}</p>}

       {unlockStatus && <p style={styles.status}>{unlockStatus}</p>}
        <input
          type="email"
          placeholder="Enter email to unlock"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleUnlock} style={styles.unlockButton} disabled={loading}>
          {loading ? 'Unlocking...' : 'Unlock User'}
        </button>

        <button onClick={() => handleEngineStatusChange('on')} style={{ ...styles.unlockButton, backgroundColor: '#28a745' }}>
          Start Engine
        </button>

        <button onClick={() => handleEngineStatusChange('off')} style={{ ...styles.unlockButton, backgroundColor: '#ffc107', color: '#000' }}>
          Stop Engine
        </button>

        <a
          href="https://docs.google.com/spreadsheets/d/1azYqswLE8q_qNyGEoWGk4pn35KS_WrDfg1xFIS7Y8Oo/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.viewLogsButton}
        >
          View Logs
        </a>

        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>

      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  userCard: {
    position: 'relative',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
    boxSizing: 'border-box',
  },
  profilePic: {
    borderRadius: '50%',
    width: '100px',
    height: '100px',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '15px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  unlockButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  logoutButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  closeIcon: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    fontSize: '1.5rem',
    color: '#888',
    cursor: 'pointer',
  },
  status: {
    marginTop: '15px',
    fontSize: '0.95rem',
    color: '#333',
    wordBreak: 'break-word',
  },
  viewLogsButton: {
    display: 'inline-block',
    fontFamily: 'Arial, sans-serif',
    width: '100%',
    padding: '10px',
    backgroundColor: '#add8e6',
    color: '#003366',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
    textDecoration: 'none',
    marginBottom: '10px',
    boxSizing: 'border-box',
  },
};

export default UnlockUser;