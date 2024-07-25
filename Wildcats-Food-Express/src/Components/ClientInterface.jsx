import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClientInterface.css";
import logo from "/logo.svg";
import profileIcon from "/cat_profile.svg";
import cartIcon from "/shopping_cart.svg";
import { useNavigate } from "react-router-dom";

const ClientInterface = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("activeTab") || "menus"
  );
  const [cart, setCart] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [orders, setOrders] = useState([]);
  const [clientorders, setClientOrders] = useState([]);
  const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);
  const [isUserRolesModalOpen, setIsUserRolesModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState();
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("https://wildcats-food-express.onrender.com/admin")
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

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
    fetchClientOrders();
  }, [refreshKey]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMenuItems();
      fetchClientOrders();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("https://wildcats-food-express.onrender.com/menu");
      const menuData = response.data.map((item) => ({
        ...item,
        image: item.image
          ? `https://wildcats-food-express.onrender.com/Images/${item.image.split("\\").pop()}`
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
      const response = await axios.get("https://wildcats-food-express.onrender.com/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  //fetch client orders

  const fetchClientOrders = async () => {
    try {
      const response = await axios.get("https://wildcats-food-express.onrender.com/clientorders");
      setClientOrders(response.data);
    } catch (error) {
      console.error("Error fetching client orders:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddToCart = async (item) => {
    try {
      // Fetch the current available quantity from the database
      const response = await axios.get(
        `https://wildcats-food-express.onrender.com/menu/${item._id}/quantity`
      );
      const availableQuantity = response.data.quantity;

      if (availableQuantity > 0) {
        // Check if the item is already in the cart
        const existingItem = cart.find((cartItem) => cartItem._id === item._id);

        if (existingItem) {
          // Update the quantity of the existing item in the cart
          setCart(
            cart.map((cartItem) =>
              cartItem._id === item._id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
          );
        } else {
          // Add the new item to the cart
          setCart([...cart, { ...item, quantity: 1 }]);
        }

        // Decrease the available quantity in the database
        await updateMenuItemQuantity(item._id, -1);
      } else {
        alert("This item is out of stock.");
      }
    } catch (error) {
      console.error("Error fetching item quantity:", error);
    }
  };

  const handleRemoveFromCart = async (item) => {
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
    await updateMenuItemQuantity(item._id, 1);
  };

  const updateMenuItemQuantity = async (itemId, change) => {
    try {
      await axios.post("https://wildcats-food-express.onrender.com/update-quantity", {
        itemId,
        quantityChange: change,
      });
      setMenuItems(
        menuItems.map((item) =>
          item._id === itemId
            ? { ...item, quantity: item.quantity + change }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating menu item quantity:", error);
    }
  };

  const handleCancelOrder = () => {
    cart.forEach(async (item) => {
      await updateMenuItemQuantity(item._id, item.quantity);
    });
    setCart([]);
  };

  const handlePlaceOrder = async () => {
    if (!schoolId.match(/^\d{2}-\d{4}-\d{3}$/)) {
      alert("Please enter a valid school ID in the format xx-xxxx-xxx");
      return;
    }

    const totalPrice = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    // Function to generate a random priority number
    const generateRandomPriorityNumber = () => {
      return Math.floor(Math.random() * 1000000); // Adjust range as needed
    };

    const order = {
      schoolId,
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      status: "Preparing",
      priorityNumber: generateRandomPriorityNumber(),
      totalPrice,
    };

    console.log("Order to be placed:", order); // Log the order data

    try {
      const response = await axios.post(
        "https://wildcats-food-express.onrender.com/clientorders",
        order,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Server response:", response.data); // Log the server response
      setCart([]);
      setSchoolId("");
      fetchOrders(); // Refresh orders after placing new order
      alert("Order placed successfully!");

      const isPrint = window.confirm("Do you want to print the receipt?");
      if (isPrint) {
        window.print();
      }
    } catch (error) {
      console.error(
        "Error placing order:",
        error.response?.data || error.message
      ); // Log detailed error message
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
    navigate("/admin");
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
                {item.name} x {item.quantity} - ₱
                {(item.price * item.quantity).toFixed(2)}
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
              <th>Priority Number</th>
              <th>School ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clientorders
              .filter((order) => order.status !== "Completed")
              .map((order) => (
                <tr key={order._id}>
                  <td>{order.priorityNumber}</td>
                  <td>{order.schoolId}</td>
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
      <div className="modal-overlay-client">
        <div className="modal user-roles-modal-client">
          <div className="my-roles-h3">My Roles</div>
          <button onClick={handleAdminInterfaceChange}>Admin Interface</button>
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
              className={`nav-link ${
                activeTab === "orderStatus" ? "active" : ""
              }`}
            >
              Order Status
            </button>
          </nav>
        </div>
        <div className="client-profile">
          <span className="client-options" onClick={openUserRolesModal}>
            Client
          </span>
          <div className="menu-container">
            <img
              src={cartIcon}
              alt="Cart"
              className="cart-icon-client"
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
