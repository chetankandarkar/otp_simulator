import React from 'react';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();

  const styles = {
    wrapper: {
      backgroundColor: '#f4f4f4', // Same as GenerateOtp
      height: '100vh',
      overflow: 'hidden', // ✅ Prevent scrolling
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box',
    },
    container: {
      maxWidth: '800px',
      width: '100%',
      padding: '30px 20px',
      fontFamily: 'Arial, sans-serif',
      color: '#333',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      textAlign: 'center',
      overflowY: 'auto', // keep content scrollable internally (optional)
      maxHeight: '90vh', // ensure it doesn't overflow
    },
    heading: {
      fontSize: '28px',
      marginBottom: '16px',
    },
    subheading: {
      marginTop: '24px',
      fontSize: '20px',
    },
    list: {
      listStyleType: 'disc',
      textAlign: 'left',
      paddingLeft: '20px',
      marginTop: '10px',
    },
    listItem: {
      marginBottom: '10px',
      lineHeight: '1.6',
    },
    button: {
      marginTop: '30px',
      padding: '10px 20px',
      fontSize: '16px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.heading}>About</h2>
        <p>OTP Simulator is a tool used for OTP validation.</p>

        <h3 style={styles.subheading}>Rules:</h3>
        <ul style={styles.list}>
          <li style={styles.listItem}>A user can generate an OTP up to <strong>5 times per day</strong>.</li>
          <li style={styles.listItem}>OTP will be sent to the <strong>email address</strong> entered on the website.</li>
          <li style={styles.listItem}>OTP expires in <strong>10 minutes</strong>.</li>
          <li style={styles.listItem}>If the user generates an OTP but does not validate it, they must wait <strong>10 minutes</strong> to generate a new one.</li>
          <li style={styles.listItem}>If the user enters the wrong OTP <strong>3 times</strong>, they will be blocked for <strong>24 hours</strong>.</li>
          <li style={styles.listItem}><strong>Blocked users</strong> can only be unblocked by an <strong>admin</strong>.</li>
        </ul>

        <button
          style={styles.button}
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default About;
