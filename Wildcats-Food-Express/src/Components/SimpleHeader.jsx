// src/components/SimpleHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './SimpleHeader.css';
import logo from '/logo.svg';

const SimpleHeader = () => {
  return (
    <header className="simple-header">
      <div className="header-left">
        <Link to="/" className="logo">
          <img src={logo} alt="Wildcats Food Express Logo" className="logo-image" />
        </Link>
      </div>
    </header>
  );
};

export default SimpleHeader;
