import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MenuAdminInterface.css";
import logo from "/logo.svg";
import profileIcon from "/cat_profile.svg";
import cartIcon from "/menu.svg";

const MenuAdminInterface = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    id: null,
    name: "",
    price: "",
    image: null,
    quantity: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/menu");
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const openModal = (
    item = { id: null, name: "", price: "", image: null, quantity: 0 }
  ) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem({ id: null, name: "", price: "", image: null, quantity: 0 });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      setCurrentItem({ ...currentItem, [name]: e.target.files[0] });
    } else {
      setCurrentItem({ ...currentItem, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newItem = {
      ...currentItem,
      id: currentItem.id || Date.now(),
    };

    try {
      if (currentItem.id) {
        // Update existing item
        await axios.put(
          `http://localhost:5000/menu/${currentItem.id}`,
          newItem
        );
        setMenuItems(
          menuItems.map((item) => (item.id === currentItem.id ? newItem : item))
        );
      } else {
        // Add new item
        const response = await axios.post(
          "http://localhost:5000/menu",
          newItem
        );
        setMenuItems([...menuItems, response.data]);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/menu/${id}`);
      setMenuItems(menuItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onClick={() => openModal()}
              className="nav-link menu-button"
            >
              Add Menu
            </button>
            <a href="#orders" className="nav-link">
              Orders
            </a>
            <a href="#reports" className="nav-link">
              Reports
            </a>
            <a href="#user-roles" className="nav-link">
              User Roles
            </a>
          </nav>
        </div>
        <div className="admin-profile">
          <span>AdminInterface</span>
          <img src={cartIcon} alt="Cart" className="cart-icon" />
        </div>
      </header>
      <main className="admin-main">
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
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => (
              <div className="menu-item" key={item.id}>
                <div className="menu-image-container">
                  {item.image ? (
                    <img
                      src={URL.createObjectURL(item.image)}
                      alt={item.name}
                      className="menu-image"
                    />
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
                    onClick={() => handleDelete(item.id)}
                    className="action-link"
                  >
                    delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No menu item/s {searchTerm} added.</p>
          )}
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{currentItem.id ? "Edit Item" : "Add New Item"}</h2>
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
                  required
                />
                <input
                  type="number"
                  name="quantity"
                  value={currentItem.quantity}
                  onChange={handleInputChange}
                  placeholder="Quantity"
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

export default MenuAdminInterface;
