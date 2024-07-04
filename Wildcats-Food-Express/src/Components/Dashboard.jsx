import React from "react";
import './dashboard.css';

function Dashboard() {
  return (
    <div className="heading">
  <div className="heading-text">
    <div className="prodlog">
      <img src="images/wildcatlog.png" alt="Wildcat" />
    </div>
   
    <div className="menu-text">
      <h1>Wildcat Food Express</h1>
      <h2>CIT-UNIVERSITY</h2>
    </div>
    <div className="orderstrack">
      <h3>My Orders</h3>
      
    </div>
    <div className="cart">
      <img src="images/cart.png" alt="cart" />
    </div>
    
  </div>

  <input type="text" placeholder="Search Menu..." className="search-input" />

  <div className="Choices" id="FoodChoices">
    <h1>Our <span>Menu</span></h1>
    <div className="Menu_Box">
      <div className="Menu_image">
        <img src="Components/Images/baconsilog.png" alt="baconsilog" />
      </div>
    </div>
  </div>
</div>

  );
}

export default Dashboard;
