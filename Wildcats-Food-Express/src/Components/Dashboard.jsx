import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dashboard.css";
import logo from "/logo.svg";
import profileIcon from "/cat_profile.svg";
import cartIcon from "/shopping_cart.svg";
import { useNavigate } from "react-router-dom";

const UserInterface = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("menus");
  const [cart, setCart] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);
  const [isUserRolesModalOpen, setIsUserRolesModalOpen] = useState(false);
  const [orders, setOrders] = useState([
    {
      id: "22-3456-345",
      date: "2024-06-07",
      amount: "₱120.00",
      product: "Burger & Fries",
      status: "Pending",
    },
  ]);
  const navigate = useNavigate();

  /* FOR AUTHENTICATION */
  const [message, setMessage] = useState();

  //for change pass
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("http://localhost:5000/dashboard")
      .then((res) => {
        if (res.data.valid) {
          setMessage(res.data.message);
        } else {
          navigate("/login");
        }
      })
      .catch((err) => {
        console.log(err);
        navigate("/login");
      });
  }, []);
  /* ----------- */

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
      const userId = localStorage.getItem("userID"); // Get user ID from localStorage
      const response = await axios.get(
        `http://localhost:5000/orders?userId=${userId}`
      ); // Include userId in the request
      setOrders(response.data);
      console.log("Fetched orders:", response.data);
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
      userId: localStorage.getItem("userID"),
      menusOrdered: cart.map((item) => ({
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      studentNumber: schoolId,
      status: "Pending",
      totalPrice: calculateTotal(),
    };

    console.log("Order Payload:", JSON.stringify(order, null, 2));

    try {
      const response = await axios.post("http://localhost:5000/orders", order);
      console.log("Order placed successfully:", response.data);
      setCart([]);
      setSchoolId("");
      fetchOrders();
      alert("Order placed successfully!");
    } catch (error) {
      console.error(
        "Error placing order:",
        error.response ? error.response.data : error.message
      );
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

  const handleAdminInterfaceChange = () => {};

  //for change pass
  const handleChangePassSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }
    // Retrieve the user ID from localStorage
    const userId = localStorage.getItem("userID");
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/change-password",
        {
          userId, // Include the userId in the request body
          oldPassword,
          newPassword,
        }
      );
      alert("Password changed successfully!");
      setOldPassword(""); //clear textfields
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      alert("Failed to change password.");
    }
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
        <div className="menu-and-summary-container">
          <div className="menu-items">
            {filteredMenuItems.map((item) => (
              <div className="menu-item" key={item._id}>
                <div className="menu-image-container">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="menu-image"
                    />
                  ) : (
                    <div className="menu-image-placeholder">No Image</div>
                  )}
                </div>
                <div className="menu-details">
                  <p className="menu-name">{item.name}</p>
                  <p className="menu-price">₱{item.price.toFixed(2)}</p>
                  <p
                    className={`menu-quantity ${
                      item.quantity === 0 ? "sold-out" : ""
                    }`}
                  >
                    {item.quantity > 0
                      ? `Available: ${item.quantity}`
                      : "Sold Out"}
                  </p>
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

          {/* Moved Order Summary Section */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="orders-tab">
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
                      <button onClick={() => handleRemoveFromCart(item)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleAddToCart(item)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-actions">
                <p>Total: ₱{calculateTotal().toFixed(2)}</p>
                <button
                  onClick={handleCancelOrder}
                  className="cancel-order-btn"
                >
                  Cancel Order
                </button>
                <button onClick={handlePlaceOrder} className="place-order-btn">
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    return (
      <div className="orders-tab-user">
        <h2>Your Orders</h2>
        <table className="orders-table-user">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date Ordered</th>
              <th>Total Amount</th>
              <th>Menus Ordered</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.studentNumber}</td>
                <td>{formatDate(order.dateOrdered)}</td>
                <td>&#8369;{order.totalPrice}</td>
                <td>
                  {order.menusOrdered.map((menu, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                      {`${menu.itemName} (x${menu.quantity}) - \u20B1${
                        menu.price * menu.quantity
                      }`}
                    </div>
                  ))}
                </td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const renderUserRolesModal = () => {
    return (
      <div className="modal-overlay">
        <div className="modal user-roles-modal-dashboard">
          <h3>Options</h3>
          <button onClick={handleAdminInterfaceChange}>Edit Profile</button>
          <button onClick={handleAdminInterfaceChange}>History</button>
          <button
            onClick={() => {
              setActiveTab("trackOrder");
              closeUserRolesModal();
            }}
          >
            Track My Order
          </button>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={closeUserRolesModal}>Cancel</button>
        </div>
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        { withCredentials: true }
      );
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const renderChangePassword = () => {
    return (
      <div className="change-password-tab">
        <div className="change-password-form">
          <h2>Change Password</h2>
          <div className="form-group">
            <label>Old Password:</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          <button className="submit-btn" onClick={handleChangePassSubmit}>
            Submit
          </button>
        </div>
      </div>
    );
  };

  const renderTrackMyOrder = () => {
    return (
      <div className="track-order-tab">
        <h2>My Order Status:</h2>
        <table className="track-order-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Date Ordered</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.studentNumber}</td>
                <td>{new Date(order.dateOrdered).toLocaleDateString()}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="user-interface">
      <header className="user-header">
        <div className="logo-and-nav">
          <div className="logo-section">
            <img src={profileIcon} alt="Cat Logo" className="cat_profile" />
            <img
              src={logo}
              alt="Wildcat Food Express Logo"
              className="logo-image"
            />
          </div>
          <nav className="user-nav">
            <button
              onClick={() => setActiveTab("menus")}
              className={`nav-link ${activeTab === "menus" ? "active" : ""}`}
            >
              Food Menu
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
            >
              My Orders
            </button>
            <button
              onClick={() => setActiveTab("changePassword")}
              className={`nav-link ${
                activeTab === "changePassword" ? "active" : ""
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>
        <div className="user-profile">
          <span className="user-options" onClick={openUserRolesModal}>
            User's Name Here
          </span>
          <div className="menu-container-dashboard">
            <img
              src={cartIcon}
              alt="Cart"
              className="cart"
              onClick={toggleCartMenu}
            />
            {isCartMenuOpen && (
              <div className="user-cart-menu">
                <p>{cart.length} items in cart</p>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="user-main">
        {activeTab === "menus" && renderMenus()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "changePassword" && renderChangePassword()}
        {activeTab === "trackOrder" && renderTrackMyOrder()}
      </main>
      {isUserRolesModalOpen && renderUserRolesModal()}
    </div>
  );
};

export default UserInterface;
