// src/components/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '/finallogo.svg';
import menuIcon from '/menu.svg';
import closeIcon from '/close.svg';



const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          <img src={logo} alt="Wildcats Food Express Logo" className="logo" />
        </Link>
      </div>
      <nav>
        <div
          className="menu-open hide-desktop"
          onClick={toggleMenu}
          style={{ display: menuOpen ? 'none' : 'inline-block' }} // Hide menu button when menu is open
        >
          <img src={menuIcon} alt="Open Menu" className="menuIcon hide-desktop" />
        </div>

        <ul className={menuOpen ? 'open' : ''}>
          <li className="hide-desktop">
            <div onClick={toggleMenu}>
              <img src={closeIcon} alt="Close Menu" className="menuClose" />
            </div>
          </li>
          <li>
            <Link to="/login" className="cta login-cta" onClick={toggleMenu}>
              LOG IN
            </Link>
          </li>
          <li>
            <Link to="/signup" className="cta signup-cta" onClick={toggleMenu}>
              SIGN UP
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
