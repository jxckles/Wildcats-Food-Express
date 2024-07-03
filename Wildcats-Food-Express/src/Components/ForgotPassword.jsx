// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import './ForgotPassword.css';
import catProfile from '/cat_profile.svg'; // Update the path if necessary
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('http://localhost:5000/forgot-password', { email })
      .then((response) => {
        if (response.data === 'Success') {
          toast.success('Password reset link sent to your email!');
        } else {
          toast.error(response.data);
        }
      })
      .catch((error) => {
        toast.error('Failed to send reset link!');
      });
  };

  return (
    <div className="forgot-password-container">
      <div className="right-panel">
        <img src={catProfile} alt="Cat Profile" className="cat-profile" />
        <h2>Forgot Password?</h2>
        <h3>Please enter your email address to reset your password.</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
        <p>
          Remembered your password? <a href="/login">Log in here.</a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;