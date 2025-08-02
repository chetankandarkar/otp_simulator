import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ValidateOtp() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;
  const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('❌ Enter a valid email address.');
      return;
    }

    if (!otp || otp.length !== 4) {
      setStatus('❌ Enter a valid 4-digit OTP.');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('otp', otp);
      formData.append('action', 'validateotp');
      formData.append('secretkey', SECRET_KEY);

      const response = await axios.post(
        API_URL,
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.data.status === 'success') {
        setStatus('✅ ' + response.data.message);
        setTimeout(() => {
          navigate('/success');
        }, 1000);
      } else {
        setStatus('❌ ' + response.data.message);
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Validate OTP</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
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
            {loading ? '🔄 Validating OTP...' : 'Validate OTP'}
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
    overflow: 'hidden',
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
    backgroundColor: '#18c008ff',
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
},

};

export default ValidateOtp;
