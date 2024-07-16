// src/components/Login.jsx
import React from "react";
import "./Login.css";
import "./ToastStyles.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import catProfile from "/cat_profile.svg";

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
            localStorage.setItem("userID", res.data.userID);
            localStorage.setItem("userName", res.data.userName);
            if (res.data.role === "Admin") {
              showSuccessToast("Login successful! Welcome Admin!");
              setTimeout(() => navigate("/admin"), 2000);
            } else if (res.data.role === "User") {
              showSuccessToast("Login successful!");
              setTimeout(() => navigate("/dashboard"), 2000);
            } else {
              showErrorToast("Login failed! Invalid Email or Password.");
            }
          })
          .catch((err) => {
            console.error(err);
            toast.error("Login error! Please check your connection.");
          });
      });
  };

  const showSuccessToast = (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      closeButton: false,
      theme: "colored",
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      closeButton: false,
      theme: "colored",
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
          <a href="/forgot-password">Forgot password?</a>
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
