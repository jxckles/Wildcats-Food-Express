import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MenuAdminInterface.css";
import logo from "/logo.svg";
import profileIcon from "/cat_profile.svg";
import cartIcon from "/hamburger-menu.svg";
import { useNavigate } from "react-router-dom";

const MainAdminInterface = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    _id: null,
    name: "",
    price: "",
    image: null,
    quantity: 0,
  });

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("menu");
  const [orders, setOrders] = useState([
    {
      id: "22-4355-566",
      name: "Juan Dela Cruz",
      product: "Fried Chicken",
      preparedBy: "",
      status: "",
    },
  ]);

  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const [reportYear, setReportYear] = useState("");
  const [setInterfaceType] = useState("admin");
  const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/menu");
      const menuData = response.data.map((item) => ({
        ...item,
        image: item.image
          ? `http://localhost:5000/Images/${item.image.split("\\").pop()}` // Ensures only the file name is appended
          : null,
      }));
      setMenuItems(menuData);
      console.log("Fetched menu items:", menuData);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const openModal = (
    item = { _id: null, name: "", price: "", image: null, quantity: 0 }
  ) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem({
      _id: null,
      name: "",
      price: "",
      image: null,
      quantity: 0,
    });
    if (activeTab === "userRoles") {
      setActiveTab("menu");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      setCurrentItem({ ...currentItem, [name]: e.target.files[0] });
    } else if (name === "price" || name === "quantity") {
      // Ensure non-negative numbers for price and quantity
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setCurrentItem({ ...currentItem, [name]: value });
      }
    } else {
      setCurrentItem({ ...currentItem, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", currentItem.name);
    formData.append("price", currentItem.price);
    formData.append("quantity", currentItem.quantity);
    if (currentItem.image && currentItem.image instanceof File) {
      formData.append("image", currentItem.image);
    }

    try {
      let updatedMenuItems;
      if (currentItem._id) {
        const response = await axios.put(
          `http://localhost:5000/menu/${currentItem._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        updatedMenuItems = menuItems.map((item) =>
          item._id === currentItem._id
            ? {
                ...response.data,
                image: response.data.image
                  ? `http://localhost:5000/Images/${response.data.image
                      .split("/")
                      .pop()}`
                  : null,
              }
            : item
        );
        window.location.reload();
      } else {
        const response = await axios.post(
          "http://localhost:5000/menu",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        updatedMenuItems = [
          ...menuItems,
          {
            ...response.data,
            image: response.data.image
              ? `http://localhost:5000/Images/${response.data.image
                  .split("/")
                  .pop()}`
              : null,
          },
        ];
      }
      setMenuItems(updatedMenuItems);
      closeModal();
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  const handleDelete = async (_id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/menu/${_id}`);
      if (response.status === 200) {
        setMenuItems(menuItems.filter((item) => item._id !== _id));
      } else {
        console.error("Failed to delete menu item:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "userRoles") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  };

  const handleAssignStaff = (orderId, staff) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, preparedBy: staff } : order
      )
    );
  };

  const handleStatusChange = (orderId, status) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const handleReportSearch = (e) => {
    setReportSearchTerm(e.target.value);
  };

  const handleDownloadReport = () => {
    console.log("Downloading report...", {
      reportDate,
      reportMonth,
      reportYear,
      reportSearchTerm,
    });
  };

  const handleInterfaceChange = (type) => {
    setInterfaceType(type);
    setIsModalOpen(false);
    setActiveTab("menu"); // Reset to the menu tab when switching interfaces
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setTimeout(() => navigate("/login", { replace: true }), 2000);
  };

  const toggleCartMenu = () => {
    setIsCartMenuOpen(!isCartMenuOpen);
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderOrderTracking = () => {
    return (
      <div className="order-tracking">
        <h2 className="todays-order">Today's Order</h2>
        <table className="order-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Name</th>
              <th>Product</th>
              <th>Prepared By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.name}</td>
                <td>{order.product}</td>
                <td>
                  <select
                    value={order.preparedBy}
                    onChange={(e) =>
                      handleAssignStaff(order.id, e.target.value)
                    }
                  >
                    <option value="">Click to assign</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                  </select>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                  >
                    <option value="">Select status</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  const renderReports = () => {
    const currentYear = new Date().getFullYear();
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

    return (
      <div className="admin-reports">
        <h2>Admin Reports</h2>
        <div className="report-search-container">
          <input
            type="text"
            placeholder="Search Report"
            className="report-search-input"
            value={reportSearchTerm}
            onChange={handleReportSearch}
          />
        </div>
        <div className="report-filters">
          <div className="filter-group">
            <label>Filters</label>
            <select
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            >
              <option value="">Day</option>
              {[...Array(31)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
            >
              <option value="">Month</option>
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
            >
              <option value="">Year</option>
              {[...Array(10)].map((_, i) => (
                <option key={i} value={currentYear + i}>
                  {currentYear + i}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleDownloadReport}
            className="download-report-btn"
          >
            Download Report
          </button>
        </div>
        <table className="report-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Date Ordered</th>
              <th>Status</th>
              <th>Prepared by</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" className="no-data">
                No data available
              </td>
            </tr>
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
          <button onClick={() => navigate("/client-interface")}>
            Client Interface
          </button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      </div>
    );
  };

  const renderAdminInterface = () => {
    return (
      <div className="admin-interface">
        <header className="admin-header">
          <div className="logo-and-nav">
            <div className="logo-section">
              <img src={profileIcon} alt="Cat Logo" className="cat_profile" />
              <img
                src={logo}
                alt="Wildcat Food Express Logo"
                className="logo-image"
              />
            </div>
            <nav className="admin-nav">
              <button
                onClick={() => handleTabChange("menu")}
                className="nav-link menu-button"
              >
                Add Menu
              </button>
              <button
                onClick={() => handleTabChange("orders")}
                className="nav-link"
              >
                Orders
              </button>
              <button
                onClick={() => handleTabChange("reports")}
                className="nav-link"
              >
                Reports
              </button>
              <button
                onClick={() => handleTabChange("userRoles")}
                className="nav-link"
              >
                User Roles
              </button>
            </nav>
          </div>
          <div className="admin-profile">
            <span className="admin-options">Admin</span>
            <div className="menu-container">
              <img
                src={cartIcon}
                alt="Cart"
                className="cart-icon"
                onClick={toggleCartMenu}
              />
              {isCartMenuOpen && (
                <div className="cart-menu">
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="admin-main">
          {activeTab === "menu" && (
            <>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search Menu"
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <button onClick={() => openModal()} className="add-menu-button">
                Add New Menu
              </button>
              <div className="menu-items">
                {filteredMenuItems.length > 0 ? (
                  filteredMenuItems.map((item) => (
                    <div className="menu-item" key={item._id || index}>
                      <div className="menu-image-container">
                        {item.image ? (
                          typeof item.image === "string" ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="menu-image"
                            />
                          ) : (
                            <img
                              src={URL.createObjectURL(item.image)}
                              alt={item.name}
                              className="menu-image"
                            />
                          )
                        ) : (
                          <div className="menu-image-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="menu-details">
                        <p className="menu-name">{item.name}</p>
                        <p className="menu-price">Php {item.price}</p>
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
                      <div className="menu-actions">
                        <button
                          onClick={() => openModal(item)}
                          className="action-link"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="action-link"
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-results">
                    No menu item/s {searchTerm} added.
                  </p>
                )}
              </div>
            </>
          )}
          {activeTab === "orders" && renderOrderTracking()}
          {activeTab === "reports" && renderReports()}
          {isModalOpen && activeTab === "userRoles" && renderUserRolesModal()}

          {isModalOpen && activeTab !== "userRoles" && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{currentItem._id ? "Edit Item" : "Add New Item"}</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="name"
                    value={currentItem.name}
                    onChange={handleInputChange}
                    placeholder="Item Name"
                    required
                  />
                  <input
                    type="number"
                    name="price"
                    value={currentItem.price}
                    onChange={handleInputChange}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    required
                  />
                  <input
                    type="number"
                    name="quantity"
                    value={currentItem.quantity}
                    onChange={handleInputChange}
                    placeholder="Quantity"
                    min="0"
                    step="1"
                    required
                  />
                  <div className="file-input-container">
                    <label htmlFor="image">Choose Image:</label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                    />
                  </div>
                  {currentItem.image && (
                    <p className="file-name">
                      Selected file: {currentItem.image.name}
                    </p>
                  )}
                  <div className="modal-actions">
                    <button type="submit">Save</button>
                    <button type="button" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

  return <div className="admin-interface">{renderAdminInterface()}</div>;
};

export default MainAdminInterface;
