// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logoImage from '../assets/path_to_logo_image.png';
import cartIcon from '../assets/path_to_cart_icon.png';


const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
      <img src={logoImage} alt="Logo" className="logo" />
        <div>
          <h1>Wildcat Food Express</h1>
          <h2>CIT-UNIVERSITY</h2>
        </div>
      </div>
      <div className="header-right">
        <Link to="/login" className="header-button">LOG IN</Link>
        <Link to="/signup" className="header-button">SIGN UP</Link>
        <img src={cartIcon} alt="Cart" className="cart-icon" />
      </div>
    </header>
  );
};

export default Header;
