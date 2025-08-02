import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/success.css';

function Success() {
  const navigate = useNavigate();

  // Auto-redirect back after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="success-wrapper">
      <div className="success-circle">
        <svg
          viewBox="0 0 52 52"
          className="success-checkmark"
        >
          <circle
            className="success-circle-path"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            className="success-check"
            fill="none"
            d="M14 27l7 7 17-17"
          />
        </svg>
      </div>
      <h2 className="success-message">OTP Verified Successfully!</h2>
      <p className="success-subtext">Redirecting in 5 seconds...</p>
      <button className="success-button" onClick={() => navigate('/')}>
        Go Back Now
      </button>
    </div>
  );
}

export default Success;
