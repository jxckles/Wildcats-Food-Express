import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClientInterface.css";
import logo from "/logo.svg";
import profileIcon from "/cat_profile.svg";
import cartIcon from "/hamburger-menu.svg";
import { useNavigate } from "react-router-dom";

const ClientInterface = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("menus");
  const [cart, setCart] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [orders, setOrders] = useState([]);
  const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);
  const [isUserRolesModalOpen, setIsUserRolesModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/menu");
      const menuData = response.data.map((item) => ({
        ...item,
        image: item.image
          ? `http://localhost:5000/Images/${item.image.split("\\").pop()}`
          : null,
      }));
      setMenuItems(menuData);
      console.log("Fetched menu items:", menuData);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    updateMenuItemQuantity(item._id, -1);
  };

  const handleRemoveFromCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);
    if (existingItem.quantity === 1) {
      setCart(cart.filter((cartItem) => cartItem._id !== item._id));
    } else {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    }
    updateMenuItemQuantity(item._id, 1);
  };

  const updateMenuItemQuantity = (itemId, change) => {
    setMenuItems(
      menuItems.map((item) =>
        item._id === itemId
          ? { ...item, quantity: item.quantity + change }
          : item
      )
    );
  };

  const handleCancelOrder = () => {
    cart.forEach((item) => {
      updateMenuItemQuantity(item._id, item.quantity);
    });
    setCart([]);
  };

  const handlePlaceOrder = async () => {
    if (!schoolId.match(/^\d{2}-\d{4}-\d{3}$/)) {
      alert("Please enter a valid school ID in the format xx-xxxx-xxx");
      return;
    }

    const order = {
      schoolId,
      items: cart,
      status: "Pending",
    };

    try {
      const response = await axios.post("http://localhost:5000/orders", order);
      setCart([]);
      setSchoolId("");
      fetchOrders(); // Refresh orders after placing new order
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const toggleCartMenu = () => {
    setIsCartMenuOpen(!isCartMenuOpen);
  };

  const openUserRolesModal = () => {
    setIsUserRolesModalOpen(true);
  };

  const closeUserRolesModal = () => {
    setIsUserRolesModalOpen(false);
  };

  const handleAdminInterfaceChange = () => {
    navigate('/admin');
  };

  const renderMenus = () => {
    const filteredMenuItems = menuItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="menus-tab">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Menu"
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="menu-items">
          {filteredMenuItems.map((item) => (
            <div className="menu-item" key={item._id}>
              <div className="menu-image-container">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="menu-image" />
                ) : (
                  <div className="menu-image-placeholder">No Image</div>
                )}
              </div>
              <div className="menu-details">
                <p className="menu-name">{item.name}</p>
                <p className="menu-price">₱{item.price.toFixed(2)}</p>
                <p className="menu-quantity">Available: {item.quantity}</p>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                disabled={item.quantity === 0}
                className="add-to-cart-btn"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    return (
      <div className="orders-tab">
        <h2>Your Order</h2>
        <input
          type="text"
          placeholder="Enter School ID (xx-xxxx-xxx)"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          className="school-id-input"
        />
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <span>{item.name}</span>
              <span>₱{item.price.toFixed(2)}</span>
              <div className="quantity-controls">
                <button onClick={() => handleRemoveFromCart(item)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleAddToCart(item)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <p>Total: ₱{calculateTotal().toFixed(2)}</p>
          <button onClick={handleCancelOrder} className="cancel-order-btn">
            Cancel Order
          </button>
          <button onClick={handlePlaceOrder} className="place-order-btn">
            Place Order
          </button>
        </div>
        <div className="receipt-preview">
          <h3>Receipt Preview</h3>
          <p>School ID: {schoolId}</p>
          <ul>
            {cart.map((item) => (
              <li key={item._id}>
                {item.name} x {item.quantity} - ₱{(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p>Total: ₱{calculateTotal().toFixed(2)}</p>
          <button onClick={() => window.print()} className="print-receipt-btn">
            Print Receipt
          </button>
        </div>
      </div>
    );
  };

  const renderOrderStatus = () => {
    return (
      <div className="order-status-tab">
        <h2>Order Status</h2>
        <table className="order-status-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>School ID</th>
              <th>Items</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.schoolId}</td>
                <td>{order.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderUserRolesModal = () => {
    return (
      <div className="modal-overlay">
        <div className="modal user-roles-modal">
          <h3>My Roles</h3>
          <button onClick={handleAdminInterfaceChange}>
            Admin Interface
          </button>
          <button onClick={closeUserRolesModal}>Cancel</button>
        </div>
      </div>
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="client-interface">
      <header className="client-header">
        <div className="logo-and-nav">
          <div className="logo-section">
            <img src={profileIcon} alt="Cat Logo" className="cat_profile" />
            <img
              src={logo}
              alt="Wildcat Food Express Logo"
              className="logo-image"
            />
          </div>
          <nav className="client-nav">
            <button
              onClick={() => setActiveTab("menus")}
              className={`nav-link ${activeTab === "menus" ? "active" : ""}`}
            >
              Menus
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("orderStatus")}
              className={`nav-link ${activeTab === "orderStatus" ? "active" : ""}`}
            >
              Order Status
            </button>
          </nav>
        </div>
        <div className="client-profile">
          <span className="client-options" onClick={openUserRolesModal}>Client</span>
          <div className="menu-container">
            <img
              src={cartIcon}
              alt="Cart"
              className="cart-icon"
              onClick={toggleCartMenu}
            />
            {isCartMenuOpen && (
              <div className="client-cart-menu">
                <p>{cart.length} items in cart</p>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="client-main">
        {activeTab === "menus" && renderMenus()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "orderStatus" && renderOrderStatus()}
      </main>
      {isUserRolesModalOpen && renderUserRolesModal()}
    </div>
  );
};

export default ClientInterface;
