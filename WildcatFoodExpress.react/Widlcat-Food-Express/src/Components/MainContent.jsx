// src/components/Home.jsx
import React from 'react';
import './MainContent.css';

const MainContent = () => {
  return (
    <div className="MainContent-container">
      <div className="left-panel">
        <h1>Wildcat Food</h1>
        <h2>Express</h2>
        <p>Fast. Fresh. Fierce.</p>
        <button className="order-button">Order Food</button>
      </div>
      <div className="right-panel">
        <img src="path_to_wildcat_image.png" alt="Wildcat" className="wildcat-img" />
      </div>
    </div>
  );
};

export default MainContent;
