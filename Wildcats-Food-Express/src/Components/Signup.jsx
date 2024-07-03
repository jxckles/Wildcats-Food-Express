// src/components/Signup.jsx
import React from "react";
import "./Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  //variables
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [courseYear, setCourseYear] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const navigate = useNavigate();

  //function
  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", {
        autoClose: 500,
      }); // Show error toast
      return;
    }

    axios
      .post("http://localhost:5000/Register", {
        firstName,
        lastName,
        courseYear,
        email,
        password,
      })
      .then((response) => {
        console.log(response);
        if (response.data === "Email already exists", {
          autoClose: 500,
        }) {
          toast.error("Email already exists!", {
            autoClose: 500,
          }); // Show error toast
          return;
        } else {
          toast.success("Registration successful!", {
            autoClose: 500,
          }); // Show success toast
          setTimeout(() => navigate("/login"), 2000);
        }
      })
      .catch((error) => {
        // Handle error
        console.error(error);
        toast.error("Registration failed!", {
          autoClose: 500,
        });
      });
  };

  return (
    <div className="signup-container">
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
        <h2>CREATE YOUR ACCOUNT</h2>
        <form onSubmit={handleSubmit}>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            required
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            required
            onChange={(e) => setLastName(e.target.value)}
          />
          <label>Course/year:</label>
          <input
            type="text"
            name="courseYear"
            required
            onChange={(e) => setCourseYear(e.target.value)}
          />
          <label>Email:</label>
          <input
            type="email"
            name="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password:</label>
          <input
            type="password"
            name="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit">SIGN UP</button>
        </form>
        <p>
          Already have an account? <a href="/login">Log in instead</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
