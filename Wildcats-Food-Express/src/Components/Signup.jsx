// src/components/Signup.jsx
import React from 'react';
import './Signup.css';

const Signup = () => {
  return (
    <div className="signup-container">
      <div className="left-panel">
        <img src="path_to_wildcat_image.png" alt="Wildcat" className="wildcat-img" />
        <h1>Wildcat Food Express</h1>
        <h2>Fast. Fresh. Fierce.</h2>
      </div>
      <div className="right-panel">
        <h2>CREATE YOUR ACCOUNT</h2>
        <form>
          <label>First Name:</label>
          <input type="text" name="firstName" required />
          <label>Last Name:</label>
          <input type="text" name="lastName" required />
          <label>Course/year:</label>
          <input type="text" name="courseYear" required />
          <label>Email:</label>
          <input type="email" name="email" required />
          <label>Password:</label>
          <input type="password" name="password" required />
          <label>Confirm Password:</label>
          <input type="password" name="confirmPassword" required />
          <button type="submit">SIGN UP</button>
        </form>
        <p>Already have an account? <a href="/login">Log in instead</a></p>
      </div>
    </div>
  );
};

export default Signup;
