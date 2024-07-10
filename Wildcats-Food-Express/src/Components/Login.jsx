// src/components/Login.jsx
import React from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import catProfile from "/cat_profile.svg"; // Update the path to your cat profile image

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/Login", {
        email,
        password,
      })
      .then((result) => {
        axios
          .post("http://localhost:5000/Login", { email, password })
          .then((res) => {
            if (res.data.role === "Admin") {
              navigate("/admin");
            } else if (res.data.role === "User") {
              navigate("/dashboard");
            } else {
              alert("Login failed");
            }
          })
          .catch((err) => {
            console.error(err);
            alert("Login failed");
          });
      });
  };

  return (
    <div className="login-container">
      <div className="right-panel">
        <img src={catProfile} alt="Cat Profile" className="cat-profile" />
        <h3>Hi Teknoy!</h3>
        <h3 className="welcome">Welcome Back</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log in</button>
        </form>
        <p className="reset_password">
          <a href="/forgot-password">Forgot password?</a> {/* Updated link */}
        </p>
        <p className="no_account">
          No account yet? <a href="/signup">Sign up here instead.</a>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
