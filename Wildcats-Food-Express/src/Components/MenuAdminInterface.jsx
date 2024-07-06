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
      const menuData = response.data.map((item) => ({
        ...item,
        image: item.image ? `http://localhost:5000/${item.image}` : null,
      }));
      setMenuItems(menuData);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      // Consider setting an error state and displaying it to the user
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
      setCurrentItem({
        ...currentItem,
        [name]: e.target.files[0],
      });
    } else {
      setCurrentItem({ ...currentItem, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add validation for form data here if needed
    const formData = new FormData();
    formData.append("name", currentItem.name);
    formData.append("price", currentItem.price);
    formData.append("quantity", currentItem.quantity);
    if (currentItem.image && currentItem.image instanceof File) {
      formData.append("image", currentItem.image);
    }

    try {
      if (currentItem.id) {
        await axios.put(
          `http://localhost:5000/menu/${currentItem.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
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
        setMenuItems([
          ...menuItems,
          {
            ...response.data,
            image: response.data.image
              ? `http://localhost:5000/${response.data.image}`
              : null,
          },
        ]);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving menu item:", error);
      // Consider setting an error state and displaying it to the user
    }
  };

  const handleDelete = async (id) => {
    // Check if the ID is valid and the item exists
    const itemExists = menuItems.some((item) => item.id === id);
    if (!id || !itemExists) {
      console.error("Invalid or non-existent ID for deletion");
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/menu/${id}`);
      setMenuItems(menuItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
      // Consider setting an error state and displaying it to the user
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
            filteredMenuItems.map(
              (
                item,
                index // Use index as part of key if necessary
              ) => (
                <div className="menu-item" key={item.id || index}>
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
                      onClick={() => handleDelete(item.id)}
                      className="action-link"
                    >
                      delete
                    </button>
                  </div>
                </div>
              )
            )
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
