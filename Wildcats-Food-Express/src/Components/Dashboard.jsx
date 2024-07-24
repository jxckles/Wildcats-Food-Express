import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
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
  const [orders, setOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [searchMonth, setSearchMonth] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amountSent, setAmountSent] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [oldestUnpaidOrder, setOldestUnpaidOrder] = useState(null);
  const [hasUnpaidOrders, setHasUnpaidOrders] = useState(false);
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  /* FOR AUTHENTICATION */
  const [message, setMessage] = useState();

  //for change pass
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    courseYear: "",
    profilePicture: null,
  });

  const [user, setUser] = useState({
    name: "",
    profilePicture: null,
  });

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

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
    fetchQRCode();
  }, []);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationPermission(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Authenticate the socket connection with the user ID
    const userId = localStorage.getItem("userID");
    newSocket.emit("authenticate", userId);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("orderStatusUpdate", (updatedOrder) => {
        console.log("Received order update:", updatedOrder);
        const userId = localStorage.getItem("userID");
        if (updatedOrder.userId === userId) {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === updatedOrder._id
                ? { ...order, ...updatedOrder }
                : order
            )
          );
          addNotification(
            `Your Order ${
              updatedOrder.studentNumber || "Unknown"
            } status has been updated to ${updatedOrder.status || "Unknown"}`,
            updatedOrder._id
          );
        }
      });

      return () => {
        socket.off("orderStatusUpdate");
      };
    }
  }, [socket]);

  const addNotification = (message, orderId) => {
    if (!message) {
      console.error("Attempted to add empty notification");
      return;
    }

    const userId = localStorage.getItem("userID");
    const newNotification = { id: Date.now(), userId, message, orderId };

    setNotifications((prev) => {
      // Remove any existing notification for the same order
      const filteredNotifications = prev.filter((n) => n.orderId !== orderId);
      return [...filteredNotifications, newNotification];
    });

    if (Notification.permission === "granted") {
      // Close any existing notification for this order
      if (window.activeNotifications && window.activeNotifications[orderId]) {
        window.activeNotifications[orderId].close();
      }

      const notification = new Notification("Order Status Update", {
        body: message,
        icon: "/cat_profile.svg",
        tag: orderId, // This ensures only one notification per order is shown
      });

      // Store the notification reference
      if (!window.activeNotifications) window.activeNotifications = {};
      window.activeNotifications[orderId] = notification;

      const notificationDuration = 2000;
      setTimeout(() => {
        notification.close();
        delete window.activeNotifications[orderId];
      }, notificationDuration);
    }
  };

  //fetch qr code image
  const fetchQRCode = async () => {
    try {
      const response = await axios.get("http://localhost:5000/get-qr-code");
      if (response.data.qrCodeUrl) {
        setQrCodeImage(`http://localhost:5000${response.data.qrCodeUrl}`);
      } else {
        setQrCodeImage(null);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      setQrCodeImage(null);
    }
  };

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
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem("userID");
      const response = await axios.get(
        `http://localhost:5000/orders?userId=${userId}`
      );
      const orders = response.data;
  
      // Store all orders
      setOrders(orders);
  
      // Check if there are any unpaid orders
      const hasUnpaidOrders = orders.some(
        (order) => !order.receiptPath && !order.referenceNumber && !order.amountSent
      );
      setHasUnpaidOrders(hasUnpaidOrders);
  
      // Find the oldest unpaid order
      const oldestUnpaid = orders
        .filter(
          (order) =>
            !order.receiptPath && !order.referenceNumber && !order.amountSent
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
  
      // Store the oldest unpaid order
      setOldestUnpaidOrder(oldestUnpaid);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem("userID");
      const response = await axios.get(`http://localhost:5000/user/${userId}`);
      setUser({
        name: `${response.data.firstName} ${response.data.lastName}`,
        profilePicture: response.data.profilePicture,
      });

      setUserProfile({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        courseYear: response.data.courseYear,
        profilePicture: response.data.profilePicture,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchHistoryOrders = async () => {
    try {
      const userId = localStorage.getItem("userID");
      if (!userId) {
        return;
      }
      console.log(`Fetching history orders for user ID: ${userId}`);
      const response = await axios.get(
        `http://localhost:5000/history-orders?userId=${userId}`
      );
      setHistoryOrders(response.data);
    } catch (error) {
      console.error("Error fetching history orders:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      console.log("Fetching history orders...");
      fetchHistoryOrders();
    }
  }, [activeTab]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddToCart = (item) => {
    if (item.quantity <= 0) {
      alert("This item is out of stock.");
      return;
    }
    
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
    if (hasUnpaidOrders) {
      alert("You have unpaid orders. Please complete your payment before placing a new order.");
      return;
    }
  
    if (!schoolId.match(/^\d{2}-\d{4}-\d{3}$/)) {
      alert("Please enter a valid school ID in the format xx-xxxx-xxx");
      return;
    }

    const order = {
      userId: localStorage.getItem("userID"),
      userName: localStorage.getItem("userName"),
      menusOrdered: cart.map((item) => ({
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      studentNumber: schoolId,
      status: "Pending",
      totalPrice: calculateTotal(),
      receiptPath: null, // Added field
      referenceNumber: null, // Added field
      amountSent: null, // Added field
    };

    console.log("Order Payload:", JSON.stringify(order, null, 2));

    try {
      const response = await axios.post("http://localhost:5000/orders", order);
      console.log("Order placed successfully:", response.data);
      fetchOrders();
      alert("Order placed successfully! Please proceed to payment.");
      setActiveTab("payment");
    } catch (error) {
      console.error(
        "Error placing order:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to checkout order. Please try again.");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userID");
      const formData = new FormData();
      formData.append("firstName", userProfile.firstName);
      formData.append("lastName", userProfile.lastName);
      formData.append("courseYear", userProfile.courseYear);

      //check is the user selected a new pic
      if (userProfile.profilePicture && isFileSelected) {
        // Convert base64 to blob
        const response = await fetch(userProfile.profilePicture);
        const blob = await response.blob();
        formData.append("profilePicture", blob, "profile.jpg");
        setIsFileSelected(true);
      }

      const response = await axios.put(
        `http://localhost:5000/update-profile/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Profile updated successfully!");
      closeUserRolesModal();
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const [imagePreview, setImagePreview] = useState(userProfile.profilePicture);
  const [isFileSelected, setIsFileSelected] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsFileSelected(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setUserProfile((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
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

  const handleChangePassSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }
    const userId = localStorage.getItem("userID");
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/change-password",
        {
          userId,
          oldPassword,
          newPassword,
        }
      );
      alert("Password changed successfully!");
      setOldPassword("");
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
                  {item.quantity === 0 ? "Sold Out" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h2>Place Order</h2>
            <div className="orders-tab">
              <input
                type="text"
                placeholder="Enter School ID (xx-xxxx-xxx)"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="school-id-input"
              />
            <div className="cart-items">
                  {cart.map((item) => {
                    const menuItem = menuItems.find((menuItem) => menuItem._id === item._id);
                    const isOutOfStock = menuItem ? menuItem.quantity <= 0 : true;
                    
                    return (
                      <div key={item._id} className="cart-item">
                        <span>{item.name}</span>
                        <span>₱{item.price.toFixed(2)}</span>
                        <div className="quantity-controls">
                          <button onClick={() => handleRemoveFromCart(item)}>-</button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => handleAddToCart(menuItem)}
                            disabled={isOutOfStock}
                            
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>              
                <div className="order-actions">
                <p>Total: ₱{calculateTotal().toFixed(2)}</p>
                <button
                  onClick={handleCancelOrder}
                  className="cancel-order-btn"
                >
                  Cancel Order
                </button>
                <button onClick={handlePlaceOrder} className="place-order-btn" disabled={hasUnpaidOrders}>
                  Checkout
                </button>
                {hasUnpaidOrders && (
                  <p className="unpaid-order-warning">
                    You have unpaid orders. Please complete your payment before placing a new order.
                  </p>
                )}
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
        <h2>Recent Orders</h2>
        <table className="orders-table-user">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date Ordered</th>
              <th>Menus Ordered</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.studentNumber}</td>
                  <td>{formatDate(order.dateOrdered)}</td>
                  <td>
                    {order.menusOrdered.map((menu, index) => (
                      <div key={index} style={{ marginBottom: "10px" }}>
                        {`${menu.itemName} (x${menu.quantity}) - \u20B1${
                          menu.price * menu.quantity
                        }`}
                      </div>
                    ))}
                  </td>
                  <td>&#8369;{order.totalPrice}</td>
                  <td>{order.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-orders">
                  No recent orders available
                </td>
              </tr>
            )}
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
          <div className="options-h3">Options</div>
          <button
            onClick={() => {
              setActiveTab("editProfile");
              closeUserRolesModal();
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={() => {
              setActiveTab("changePassword");
              closeUserRolesModal();
            }}
          >
            Change Password
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              closeUserRolesModal();
            }}
          >
            History
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
      localStorage.clear();
      alert("Logged Out!");
      navigate("/login", { replace: true });
    } catch (error) {
      alert("Error logging out!");
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
          <button
            className="submit-btn-password"
            onClick={handleChangePassSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    );
  };

  const renderPaymentOrder = () => {
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        setReceiptFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleRemoveReceipt = () => {
      setReceiptImage(null);
      // Reset the file input
      const fileInput = document.getElementById("receipt-upload");
      if (fileInput) {
        fileInput.value = "";
      }
    };

    // Helper function to format amount to two decimal places
    const formatAmount = (amount) => {
      return parseFloat(amount).toFixed(2);
    };

    // Helper function to validate amount
    const validateAmount = (amount) => {
      const regex = /^\d+(\.\d{0,2})?$/;
      return regex.test(amount);
    };

    const handleSubmitPayment = async () => {
      if (!receiptImage) {
        alert("Please upload a receipt image.");
        return;
      }
      if (!referenceNumber) {
        alert("Please fill in the reference number.");
        return;
      }
      if (!amountSent) {
        alert("Please fill in the amount sent.");
        return;
      }

      // Validate and format amountSent
      if (!validateAmount(amountSent)) {
        alert("Please enter a valid amount (up to two decimal places).");
        return;
      }

      const formattedAmountSent = formatAmount(amountSent);
      const totalOrderAmount = formatAmount(oldestUnpaidOrder.totalPrice);

      if (formattedAmountSent !== totalOrderAmount) {
        alert(
          `The amount paid (${formattedAmountSent}) must exactly match the total order amount (${totalOrderAmount}).`
        );
        return;
      }

      try {
        // Create FormData and append fields
        const formData = new FormData();
        formData.append("orderId", oldestUnpaidOrder._id);
        formData.append("receipt", receiptFile); // Append the file
        formData.append("referenceNumber", referenceNumber);
        formData.append("amountSent", formattedAmountSent);
        

        const response = await axios.put(
          "http://localhost:5000/update-order",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (
          response.status === 200 &&
          response.data.message === "Order updated successfully"
        ) {
          alert("Payment submitted successfully!");

          // Clear the cart and reset the form
          setCart([]);
          setReferenceNumber("");
          setAmountSent("");
          setReceiptImage(null);
          setReceiptFile(null);
          setOldestUnpaidOrder(null); // Clear the oldest unpaid order

          // Offer to save the payment receipt as PDF
          if (
            window.confirm("Would you like to save the payment receipt as PDF?")
          ) {
            generatePDF(formattedAmountSent);
          }

          // Navigate back to the menu
          setActiveTab("menus");
        } else {
          // Handle unexpected response
          throw new Error(response.data.message || "An unknown error occurred");
        }
      } catch (error) {
        console.error("Error submitting payment:", error);
        alert("Failed to submit payment. Please try again.");
      }
    };

    const generatePDF = (formattedAmountSent) => {
      import("jspdf")
        .then((jsPDF) => {
          const { jsPDF: jsPDFConstructor } = jsPDF;
          const doc = new jsPDFConstructor();

          // Set page size to A4
          doc.setFontSize(12);

          // Add header
          doc.setFontSize(18);
          doc.setFont(undefined, "bold");
          doc.text("Payment Receipt", 105, 20, { align: "center" });

          // Add receipt details
          doc.setFontSize(12);
          doc.setFont(undefined, "normal");
          let y = 40;
          doc.text(`Order ID: ${schoolId}`, 20, y);
          doc.text(`Reference Number: ${referenceNumber}`, 20, y + 10);
          doc.text(`Amount Sent: Php ${formattedAmountSent}`, 20, y + 20);
          doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y + 30);

          // Add order summary
          y = y + 50;
          doc.setFont(undefined, "bold");
          doc.text("Order Summary:", 20, y);

          y = y + 10;
          doc.setFont(undefined, "normal");
          cart.forEach((item) => {
            const itemText = `${item.name} (x${item.quantity})`;
            const itemPrice = `Php ${formatAmount(item.price * item.quantity)}`;
            doc.text(itemText, 30, y);
            doc.text(itemPrice, 190, y, { align: "right" });
            y += 10;
          });

          // Add total
          y += 5;
          doc.setFont(undefined, "bold");
          doc.text("Total:", 30, y);
          doc.text(`Php ${formatAmount(calculateTotal())}`, 190, y, {
            align: "right",
          });

          // Save the PDF
          doc.save("payment_receipt.pdf");
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          alert("Failed to generate PDF. Please try again.");
        });
    };

    return (
      <div className="payment-container">
        <h1>Payment Portal</h1>
        <div className="payment-content">
          <div className="order_summary">
            <h2>Order Summary</h2>
            {oldestUnpaidOrder && oldestUnpaidOrder.menusOrdered ? (
              oldestUnpaidOrder.menusOrdered.map((menu) => (
                <p key={menu._id}>
                  {menu.itemName} (x{menu.quantity}){" "}
                  <span>₱{(menu.price * menu.quantity).toFixed(2)}</span>
                </p>
              ))
            ) : (
              <p>No items found.</p>
            )}
            <hr />
            <p>
              Total{" "}
              <span>
                ₱
                {oldestUnpaidOrder && oldestUnpaidOrder.menusOrdered
                  ? oldestUnpaidOrder.menusOrdered
                      .reduce(
                        (total, menu) => total + menu.price * menu.quantity,
                        0
                      )
                      .toFixed(2)
                  : "0.00"}
              </span>
            </p>
          </div>
          <div className="payment-form">
            <p>Send your Virtual payment to:</p>
            <div className="gcash-h3">
              GCASH <p className="gcash-number">+639123456789</p>
            </div>
            <div className="qr-code-container">
              {qrCodeImage ? (
                <img
                  src={qrCodeImage}
                  alt="QR Code"
                  className="qr-code-image"
                  onError={(e) => {
                    console.error("Error loading QR code image");
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="qr-code-placeholder">QR Code Not Available</div>
              )}
            </div>
            <hr className="gcash" />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitPayment();
              }}
            >
              <label className="OrderIDLabel">Order ID:</label>
              <input
                type="text"
                name="name"
                className="Name"
                value={oldestUnpaidOrder?.studentNumber || ""}
                readOnly
              />

              <label className="ReferenceLabel">Reference Number:</label>
              <input
                type="text"
                name="referenceNumber"
                className="Reference"
                required="true"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />

              <label className="AmountLabel">Amount Sent:</label>
              <input
                type="text"
                name="amountSent"
                className="Amount"
                required="true"
                value={amountSent}
                onChange={(e) => {
                  if (validateAmount(e.target.value) || e.target.value === "") {
                    setAmountSent(e.target.value);
                  }
                }}
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="receipt-upload"
              />
              <div className="receipt-upload-container">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("receipt-upload").click()
                  }
                  className="upload-btn"
                >
                  {receiptImage ? "Change" : "Upload Receipt"}
                </button>
                {receiptImage && (
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
              {receiptImage && <p>Receipt uploaded successfully!</p>}
              <button type="submit" className="submit-btn-payment">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  //In web Notification UI p.s. not yet declared
  const renderNotificationsComponent = () => {
    return (
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div key={notification.id} className="notification">
            {notification.message}
          </div>
        ))}
      </div>
    );
  };

  const renderHistory = () => {
    const filteredOrders = historyOrders.filter(
      (order) =>
        (order.status === "Completed" || order.status === "Cancelled") &&
        (!searchDate ||
          new Date(order.dateOrdered).getDate() === parseInt(searchDate)) &&
        (!searchMonth ||
          new Date(order.dateOrdered).getMonth() === parseInt(searchMonth)) &&
        (!searchYear ||
          new Date(order.dateOrdered).getFullYear() === parseInt(searchYear))
    );

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
      <div className="history-tab">
        <h2>Previous Orders</h2>
        <div className="history-search">
          <select
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          >
            <option value="">Day</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <select
            value={searchMonth}
            onChange={(e) => setSearchMonth(e.target.value)}
          >
            <option value="">Month</option>
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value)}
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <table className="history-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date Ordered</th>
              <th>Menus Ordered</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.studentNumber}</td>
                <td>{formatDate(order.dateOrdered)}</td>
                <td>
                  {order.menusOrdered.map((menu, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                      {`${menu.itemName} (x${menu.quantity}) - \u20B1${
                        menu.price * menu.quantity
                      }`}
                    </div>
                  ))}
                </td>
                <td>&#8369;{order.totalPrice}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEditProfile = () => {
    return (
      <div className="edit-profile-tab">
        <h2>Edit Profile</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="profile-picture-container">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="profile-picture"
              />
            ) : user.profilePicture ? (
              <img
                src={`http://localhost:5000${user.profilePicture}`}
                alt="Profile"
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                <span>+</span>
              </div>
            )}
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="profilePicture" className="upload-button">
              +
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={userProfile.firstName}
              onChange={(e) =>
                setUserProfile({ ...userProfile, firstName: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={userProfile.lastName}
              onChange={(e) =>
                setUserProfile({ ...userProfile, lastName: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="courseYear">Course/Year:</label>
            <input
              type="text"
              id="courseYear"
              name="courseYear"
              value={userProfile.courseYear}
              onChange={(e) =>
                setUserProfile({ ...userProfile, courseYear: e.target.value })
              }
            />
          </div>
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
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
              onClick={() => setActiveTab("payment")}
              className={`nav-link ${activeTab === "payment" ? "active" : ""}`}
            >
              Payment
            </button>
          </nav>
        </div>
        <div className="user-profile">
          <div className="user-info">
            {user.profilePicture ? (
              <img
                src={`http://localhost:5000${user.profilePicture}`}
                alt="Profile"
                className="user-avatar"
              />
            ) : (
              <div className="default-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : ""}
              </div>
            )}
            <span className="user-name" onClick={openUserRolesModal}>
              {user.name || "Users name"}
            </span>
          </div>
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
        {activeTab === "payment" && renderPaymentOrder()}
        {activeTab === "history" && renderHistory()}
        {activeTab === "editProfile" && renderEditProfile()}
      </main>
      {isUserRolesModalOpen && renderUserRolesModal()}
    </div>
  );
};

export default UserInterface;
