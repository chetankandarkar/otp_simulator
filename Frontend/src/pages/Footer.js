// src/components/Footer.js
import React from 'react';

const version = process.env.REACT_APP_VERSION;

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>Developed by Chetan Kandarkar ©2025 | Version {version}</p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '10px 0',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    textAlign: 'center',
    zIndex: 999,
  },
  text: {
    margin: 0,
    fontFamily: 'Roboto, Arial, sans-serif',
    fontSize: '14px',
    letterSpacing: '0.5px' 
  },
};

export default Footer;
