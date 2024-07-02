// src/components/Login.jsx
import React from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/Login", {
        email,
        password,
      })
      .then((result) => {
        console.log(result);
        if (result.data === "Success") {
          toast.success("Login successful!");
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          toast.error(result.data);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Login failed!");
      });
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <img
          src="path_to_wildcat_image.png"
          alt="Wildcat"
          className="wildcat-img"
        />
        <h1>Wildcat Food Express</h1>
        <h2>Fast. Fresh. Fierce.</h2>
      </div>
      <div className="right-panel">
        <h2>Hi Teknoy!</h2>
        <h3>Welcome Back</h3>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password:</label>
          <input
            type="password"
            name="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Log in</button>
        </form>
        <p>
          No account yet? <a href="/signup">Sign up here instead</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
