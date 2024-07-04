// src/components/MenuAdminInterface.jsx
import React from 'react';
import './MenuAdminInterface.css';
import logo from '/logo.svg'; // Adjust the path to your logo
import profileIcon from '/cat_profile.svg'; // Adjust the path to your profile icon
import cartIcon from '/menu.svg'; 

const MenuAdminInterface = () => {
  return (
    <div className="admin-interface">
      <header className="admin-header">
        <div className="logo-section">
        <img src={profileIcon} alt="Cat Logo" className="cat_profile" />
          <img src={logo} alt="Wildcat Food Express Logo" className="logo-image" />
        </div>
        <nav className="admin-nav">
          <a href="#add-menu" className="nav-link">Add Menu</a>
          <a href="#orders" className="nav-link">Orders</a>
          <a href="#reports" className="nav-link">Reports</a>
          <a href="#user-roles" className="nav-link">User Roles</a>
        </nav>
        <div className="admin-profile">

          <span>AdminInterface</span>
          <img src={cartIcon} alt="Cart" className="cart-icon" />
        </div>
      </header>
      <main className="admin-main">
        <div className="search-container">
          <input type="text" placeholder="Search Menu" className="search-input" />
        </div>
        <div className="menu-items">
          {Array(8).fill().map((_, index) => (
            <div className="menu-item" key={index}>
              <div className="menu-details">
                <p className="menu-name">Tortang talong</p>
                <p className="menu-price">Php 75.00</p>
              </div>
              <div className="menu-actions">
                <a href="#edit" className="action-link">edit</a>
                <a href="#available" className="action-link">available</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MenuAdminInterface;
