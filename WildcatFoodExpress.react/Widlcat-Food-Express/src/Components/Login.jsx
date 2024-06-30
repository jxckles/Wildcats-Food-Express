// src/components/Login.jsx
import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      <div className="left-panel">
        <img src="path_to_wildcat_image.png" alt="Wildcat" className="wildcat-img" />
        <h1>Wildcat Food Express</h1>
        <h2>Fast. Fresh. Fierce.</h2>
      </div>
      <div className="right-panel">
        <h2>Hi Teknoy!</h2>
        <h3>Welcome Back</h3>
        <form>
          <label>Email:</label>
          <input type="email" name="email" required />
          <label>Password:</label>
          <input type="password" name="password" required />
          <button type="submit">Log in</button>
        </form>
        <p>No account yet? <a href="/signup">Sign up here instead</a></p>
      </div>
    </div>
  );
};

export default Login;
