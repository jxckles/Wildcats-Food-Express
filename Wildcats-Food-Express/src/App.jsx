// src/App.jsx
import React from 'react';
import './App.css';
import Header from './Components/Header';
import MainContent from './Components/MainContent';
import CatImage from './Components/CatImage';
import Footer from './Components/Footer';
import Login from './Components/Login';
import Signup from './Components/Signup';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="wrap">
        <Header />
        <hr className="hide-hr" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

const HomePage = () => (
  <div>
    <MainContent />
    <CatImage />
  </div>
);

export default App;
