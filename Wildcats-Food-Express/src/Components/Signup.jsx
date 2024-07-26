// src/components/Signup.jsx
import React from "react";
import "./Signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import catProfile from "/cat_profile.svg"; // Adjust the path if necessary

const Signup = () => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [courseYear, setCourseYear] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [schoolId, setSchoolId] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Validate school ID format
    const schoolIdRegex = /^\d{2}-\d{4}-\d{3}$/;
    if (!schoolIdRegex.test(schoolId)) {
      toast.error("Invalid school ID format. Please use xx-xxxx-xxx format.");
      return;
    }

    axios
      .post("https://wildcats-food-express.onrender.com/api/Register", {
        firstName,
        lastName,
        courseYear,
        email,
        password,
        schoolId,
      })
      .then((response) => {
        if (response.data === "Email already exists") {
          toast.error("Email already exists!");
        } else {
          toast.success("Registration successful!");
          setTimeout(() => navigate("/login"), 2000);
        }
      })
      .catch((error) => {
        toast.error("Registration failed!");
      });
  };

  return (
    <div className="signup-container">
      <div className="right-panel">
        <img src={catProfile} alt="Wildcat" className="wildcat-img" />

        <h2>CREATE YOUR ACCOUNT</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              required
              placeholder="John"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              required
              placeholder="Doe"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Course/year:</label>
            <input
              type="text"
              name="courseYear"
              required
              onChange={(e) => setCourseYear(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>School ID:</label>
            <input
              type="text"
              name="schoolId"
              required
              placeholder="xx-xxxx-xxx"
              pattern="\d{2}-\d{4}-\d{3}"
              onChange={(e) => setSchoolId(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              required
              placeholder="john.doe@cit.edu"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
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