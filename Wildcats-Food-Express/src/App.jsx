// src/App.jsx
import React from "react";
import "./App.css";
import Header from "./Components/Header";
import SimpleHeader from "./Components/SimpleHeader"; // Import SimpleHeader component
import MainContent from "./Components/MainContent";
import CatImage from "./Components/CatImage";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Dashboard from "./Components/Dashboard";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify css

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        color="red"
      />
      <Router>
        <AppLayout />
      </Router>
    </>
  );
}

// Layout component to handle different headers
const AppLayout = () => {
  const location = useLocation();
  const isResetPassword = location.pathname === "/reset-password";
  const headerComponent = isResetPassword ? <SimpleHeader /> : <Header />;

  return (
    <div className="wrap">
      {headerComponent}
      {!isResetPassword && <hr className="hide-hr" />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <Footer />
    </div>
  );
};

const HomePage = () => (
  <div>
    <MainContent />
  </div>
);

export default App;
