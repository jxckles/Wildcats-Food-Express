import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MenuAdminInterface.css";
import logo from "/logo.svg";
import profileIcon from "/cat_profile.svg";
import cartIcon from "/hamburger-menu.svg";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("menu");
  const [orderSubTab, setOrderSubTab] = useState("online");
  const [onlineOrders, setOnlineOrders] = useState([
    {
      id: "22-3456-345",
      name: "John Doe",
      amount: "₱120.00",
      product: "Burger & Fries",
      status: "Pending",
    },
    {
      id: "19-5455-678",
      name: "Jane Smith",
      amount: "₱30.00",
      product: "Pizza",
      status: "Pending",
    },
  ]);
  const [customerOrders, setCustomerOrders] = useState([
    {
      id: "POS-001",
      schoolID: "21-8877-890",
      amount: "₱50.00",
      product: "Fried Chicken",
      status: "Pending",
    },
    {
      id: "POS-002",
      schoolID: "19-2322-567",
      amount: "₱40.00",
      product: "Chicken Adobo",
      status: "Pending",
    },
  ]);

  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const [reportYear, setReportYear] = useState("");
  const [historyOrders, setHistoryOrders] = useState([]);
  const [setInterfaceType] = useState("admin");
  const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);
  const [message, setMessage] = useState();
  const [qrCodeImage, setQrCodeImage] = useState(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin")
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
  }, [refreshKey]);


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
      setOnlineOrders(response.data);
      console.log("Fetched orders:", response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
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
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      setCurrentItem({ ...currentItem, [name]: e.target.files[0] });
    } else if (name === "price" || name === "quantity") {
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
      if (currentItem._id) {
        await axios.put(
          `http://localhost:5000/menu/${currentItem._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.post("http://localhost:5000/menu", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      closeModal();
      setRefreshKey((oldKey) => oldKey + 1);
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
    if (tab === "orders") {
      setOrderSubTab("online");
    }
  };

  const handleOrderSubTabChange = (subTab) => {
    setOrderSubTab(subTab);
  };

  const handleStatusChange = async (orderId, newStatus, isOnlineOrder) => {
    try {
      if (!orderId) {
        throw new Error("Order ID is undefined");
      }

      const response = await axios.put(
        `http://localhost:5000/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      const updatedOrder = response.data;

      if (isOnlineOrder) {
        if (newStatus === "Completed" || newStatus === "Cancelled") {
          setOnlineOrders((prevOrders) =>
            prevOrders.filter((order) => order._id !== orderId)
          );
        } else {
          setOnlineOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId ? updatedOrder : order
            )
          );
        }
      } else {
        if (newStatus === "Completed") {
          setCustomerOrders((prevOrders) =>
            prevOrders.filter((order) => order._id !== orderId)
          );
        } else {
          setCustomerOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId ? updatedOrder : order
            )
          );
        }
      }

      fetchOrders();
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error);
    }
  };

  const handleReportSearch = (e) => {
    setReportSearchTerm(e.target.value);
  };

  const handleDownloadReport = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
  
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // Set document properties
    doc.setProperties({
      title: 'Wildcat Food Express - Sales Report',
      subject: 'Sales Report',
      author: 'Wildcat Food Express Admin',
      keywords: 'sales, report, food, express',
      creator: 'Wildcat Food Express System'
    });
  
    // Define styles
    const titleStyle = { fontSize: 16, fontStyle: 'bold', };
    const subtitleStyle = { fontSize: 10, fontStyle: 'normal' };
    const tableHeaderStyle = { 
      fillColor: [153, 0, 0], // #990000
      textColor: [255, 255, 255], 
      fontStyle: 'bold',
      fontSize: 8, 
      halign: 'center', 
      valign: 'middle' 
    };
    const tableBodyStyle = { 
      textColor: [50, 50, 50], 
      fontSize: 8,
      cellPadding: 2
    };
  
    // Title and basic information
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleStyle.fontSize);
    
    doc.text("Wildcat Food Express - Sales Report", 15, 20);
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(subtitleStyle.fontSize);
    doc.text(`Date: ${reportDate || "All"}`, 15, 30);
    doc.text(`Month: ${reportMonth ? months[parseInt(reportMonth) - 1] : "All"}`, 15, 35);
    doc.text(`Year: ${reportYear || "All"}`, 15, 40);
    doc.text(`Search Term: ${reportSearchTerm || "None"}`, 15, 45);
  
    // Table headers
    const headers = [
      { title: "Order Number", dataKey: "orderNumber" },
      { title: "Date Ordered", dataKey: "dateOrdered" },
      { title: "Status", dataKey: "status" },
      { title: "Product", dataKey: "product" },
      { title: "Quantity", dataKey: "quantity" },
      { title: "Total Price", dataKey: "totalPrice" },
    ];
  
    // Filter and search logic
    const filteredHistoryOrders = historyOrders.filter((order) => {
      const orderDate = new Date(order.dateOrdered);
      const searchLower = reportSearchTerm.toLowerCase();
      
      const matchesSearch = !reportSearchTerm || 
        order.studentNumber.toLowerCase().includes(searchLower) ||
        orderDate.toLocaleString().toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower) ||
        order.menusOrdered.some(menu => menu.itemName.toLowerCase().includes(searchLower));
  
      const dateMatches = !reportDate || orderDate.getDate() === parseInt(reportDate);
      const monthMatches = !reportMonth || orderDate.getMonth() === parseInt(reportMonth) - 1;
      const yearMatches = !reportYear || orderDate.getFullYear() === parseInt(reportYear);
  
      return matchesSearch && dateMatches && monthMatches && yearMatches;
    });
  
    // Data for the table
    const ordersData = filteredHistoryOrders.map((order) => ({
      orderNumber: order.studentNumber,
      dateOrdered: new Date(order.dateOrdered).toLocaleString(),
      status: order.status,
      product: order.menusOrdered.map((menu) => menu.itemName).join(", "),
      quantity: order.menusOrdered.map((menu) => menu.quantity).join(", "),
      totalPrice: `₱${order.totalPrice.toFixed(2)}`,
    }));
  
    // Generate the table
    doc.autoTable({
      head: [headers.map((header) => header.title)],
      body: ordersData.map((data) => headers.map((header) => data[header.dataKey])),
      startY: 50,
      styles: { 
        font: "helvetica", 
        overflow: "linebreak",
        cellPadding: 2,
      },
      headStyles: tableHeaderStyle,
      bodyStyles: tableBodyStyle,
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
      },
      didDrawPage: function (data) {
        // Footer
        let str = `Page ${doc.internal.getNumberOfPages()}`;
        doc.setFontSize(8);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      },
      margin: { top: 50, right: 15, bottom: 15, left: 15 },
    });
  
    // Add summary information
    const totalSales = ordersData.reduce((sum, order) => sum + parseFloat(order.totalPrice.replace('₱', '')), 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Total Sales: ₱${totalSales.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 10);
  
    // Generate filename based on filters
    let filename = "Wildcat_Food_Express_Sales_Report";
    if (reportDate) filename += `_Date ${reportDate.padStart(2, '0')}`;
    if (reportMonth) filename += `_Month ${reportMonth.padStart(2, '0')}`;
    if (reportYear) filename += `_Year ${reportYear}`;
    if (reportSearchTerm) filename += `_Search ${reportSearchTerm.replace(/\s+/g, '_')}`;
    filename += ".pdf";
  
    doc.save(filename);
  };

  const handleInterfaceChange = (type) => {
    setInterfaceType(type);
    setIsModalOpen(false);
    setActiveTab("menu");
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        { withCredentials: true }
      );
      localStorage.clear();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  //qr code upload
  const handleQRCodeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('qrCode', file);
      try {
        const response = await axios.post('http://localhost:5000/upload-qr-code', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.data.qrCodeUrl) {
          setQrCodeImage(`http://localhost:5000${response.data.qrCodeUrl}`);
        }
        alert('QR code uploaded successfully!');
      } catch (error) {
        console.error('Error uploading QR code:', error);
        alert('Failed to upload QR code. Please try again.');
      }
    }
  };
  const handleRemoveQRCode = async () => {
    try {
      await axios.delete('http://localhost:5000/remove-qr-code');
      setQrCodeImage(null);
      alert('QR code removed successfully!');
    } catch (error) {
      console.error('Error removing QR code:', error);
      alert('Failed to remove QR code. Please try again.');
    }
  };  
  

  const fetchQRCode = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-qr-code');
      if (response.data.qrCodeUrl) {
        setQrCodeImage(`http://localhost:5000${response.data.qrCodeUrl}`);
      } else {
        setQrCodeImage(null);
      }
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error('Error fetching QR code:', error);
      }
      setQrCodeImage(null);
    }
  };

  const toggleCartMenu = () => {
    setIsCartMenuOpen(!isCartMenuOpen);
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //for reports
  const fetchHistoryOrders = async () => {
    try {
      const userId = localStorage.getItem("userID");
      if (!userId) {
        return;
      }
      const response = await axios.get(
        `http://localhost:5000/history-orders?userId=${userId}`
      );
      setHistoryOrders(response.data);
    } catch (error) {
      console.error("Error fetching history orders:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "reports") {
      fetchHistoryOrders();
    }
  }, [activeTab]);

  const renderOrderTracking = () => {
    return (
      <div className="order-tracking">
        <h2 className="todays-order">Today's Orders</h2>
        <div className="order-subtabs">
          <button
            className={`order-subtab ${
              orderSubTab === "online" ? "active" : ""
            }`}
            onClick={() => handleOrderSubTabChange("online")}
          >
            Online Orders
          </button>
          <button
            className={`order-subtab ${orderSubTab === "pos" ? "active" : ""}`}
            onClick={() => handleOrderSubTabChange("pos")}
          >
            Customer Orders
          </button>
        </div>
        {orderSubTab === "online" && (
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Name</th>
                <th>Total Amount</th>
                <th>Product</th>
                <th>Status</th>
                <th>Proof of Payment</th>
              </tr>
            </thead>
            <tbody>
              {onlineOrders.length > 0 ? (
                onlineOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.studentNumber}</td>
                    <td>{order.userName}</td>
                    <td>&#8369;{order.totalPrice}</td>
                    <td>
                      {order.menusOrdered.map((menu, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                          {`${menu.itemName} (x${menu.quantity}) - ₱${
                            menu.price * menu.quantity
                          }`}
                        </div>
                      ))}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value, true)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready for Pickup">
                          Ready for Pickup
                        </option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-orders">No online orders available</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {orderSubTab === "pos" && (
          <table className="order-table">
            <thead>
              <tr>
                <th>Priority Number</th>
                <th>School ID</th>
                <th>Total Amount</th>
                <th>Product</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customerOrders.length > 0 ? (
                customerOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.id}</td>
                    <td>{order.schoolID}</td>
                    <td>&#8369;{order.amount}</td>
                    <td>{order.product}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value, false)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready for Pickup">
                          Ready for Pickup
                        </option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No customer orders available</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderReports = () => {
    const currentYear = new Date().getFullYear();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
  
    const filteredHistoryOrders = historyOrders
      ? historyOrders.filter((order) => {
          const orderDate = new Date(order.dateOrdered);
          const searchLower = reportSearchTerm.toLowerCase();
          
          const matchesSearch = 
            order.studentNumber.toLowerCase().includes(searchLower) ||
            orderDate.toLocaleString().toLowerCase().includes(searchLower) ||
            order.status.toLowerCase().includes(searchLower) ||
            order.menusOrdered.some(menu => menu.itemName.toLowerCase().includes(searchLower));
  
          return matchesSearch &&
            (!reportDate || orderDate.getDate() === parseInt(reportDate)) &&
            (!reportMonth || orderDate.getMonth() === parseInt(reportMonth) - 1) &&
            (!reportYear || orderDate.getFullYear() === parseInt(reportYear));
        })
      : [];
  
    return (
      <div className="admin-reports">
        <h2>Admin Reports</h2>
        <div className="report-search-container">
          <input
            type="text"
            placeholder="Search by Order Number, Date, Status, or Product"
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
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistoryOrders.length > 0 ? (
              filteredHistoryOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.studentNumber}</td>
                  <td>{new Date(order.dateOrdered).toLocaleString()}</td>
                  <td>{order.status}</td>
                  <td>
                    {order.menusOrdered.map((menu, index) => (
                      <div key={index}>{menu.itemName}</div>
                    ))}
                  </td>
                  <td>
                    {order.menusOrdered.map((menu, index) => (
                      <div key={index}>{menu.quantity}x</div>
                    ))}
                  </td>
                  <td>₱{order.totalPrice.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderUserRolesModal = () => {
    return (
      <div className="modal-overlay">
        <div className="modal user-roles-modal">
          <div className="my-roles-admin">My Roles</div>
          <button onClick={() => navigate("/client-interface")}>
            Client Interface
          </button>
          <button
            onClick={() => {
              setActiveTab("menu");
              setIsModalOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderQRCodeManagement = () => {
    return (
      <div className="qr-code-management-admin">
        <h2>Manage QR Code</h2>
        <div className="qr-code-container-admin">
          {qrCodeImage ? (
            <>
              <img 
                src={qrCodeImage} 
                alt="QR Code" 
                className="qr-code-image-admin" 
                onError={(e) => {
                  console.error("Error loading QR code image");
                  e.target.style.display = 'none';
                }}
              />
              <button onClick={handleRemoveQRCode} className="remove-qr-btn">
                Remove QR Code
              </button>
            </>
          ) : (
            <div className="qr-code-upload-admin">
              <input
                type="file"
                accept="image/*"
                onChange={handleQRCodeUpload}
                style={{ display: 'none' }}
                id="qr-code-upload-admin"
              />
              <label htmlFor="qr-code-upload-admin" className="upload-qr-btn-admin">
                Upload QR Code
              </label>
            </div>
          )}
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
                className={`nav-link ${activeTab === "menu" ? "active" : ""}`}
              >
                Add Menu
              </button>
              <button
                onClick={() => handleTabChange("orders")}
                className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
              >
                Orders
              </button>
              <button
                onClick={() => handleTabChange("reports")}
                className={`nav-link ${activeTab === "reports" ? "active" : ""}`}
              >
                Reports
              </button>
              <button
                onClick={() => handleTabChange("userRoles")}
                className={`nav-link ${activeTab === "userRoles" ? "active" : ""}`}
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
                <div className="cart-menu-admin">
                  <button onClick={() => setActiveTab("qrCode")}>QR Code</button>
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
                    <div className="menu-item" key={item._id}>
                      <div className="menu-image-container">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="menu-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "path/to/placeholder/image.jpg";
                            }}
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
          {activeTab === "qrCode" && renderQRCodeManagement()}
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
