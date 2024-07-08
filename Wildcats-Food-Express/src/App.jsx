// src/App.jsx
import React from "react";
import "./App.css";
import Header from "./Components/Header";
import SimpleHeader from "./Components/SimpleHeader";
import MainContent from "./Components/MainContent";
import Footer from "./Components/Footer";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Dashboard from "./Components/Dashboard";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import MenuAdminInterface from "./Components/MenuAdminInterface";
import ClientInterface from "./Components/ClientInterface";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const AppLayout = () => {
  const location = useLocation();
  const isResetPassword = location.pathname === "/reset-password";
  const isAdminPage = location.pathname === "/admin";
  const isClientInterface = location.pathname === "/client-interface";
  const isDashboard = location.pathname === "/dashboard";

  if (isAdminPage) {
    return <MenuAdminInterface />;
  }

  if (isClientInterface) {
    return <ClientInterface />;
  }

  if (isDashboard) {
    return <Dashboard />;
  }

  const headerComponent = isResetPassword ? <SimpleHeader /> : <Header />;

  return (
    <div className="wrap">
      {!isDashboard && headerComponent}
      {!isResetPassword && !isDashboard && <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>}
      {!isDashboard && <Footer />}
    </div>
  );
};

const HomePage = () => (
  <div>
    <MainContent />
  </div>
);

export default App;