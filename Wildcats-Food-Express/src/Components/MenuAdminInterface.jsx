import React, { useState } from 'react';
import './MenuAdminInterface.css';
import logo from '/logo.svg';
import profileIcon from '/cat_profile.svg';
import cartIcon from '/menu.svg';

const MainAdminInterface = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: null, name: '', price: '', image: null, quantity: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('menu');
  const [orders, setOrders] = useState([
    { id: '22-4355-566', name: 'Juan Dela Cruz', preparedBy: '', status: '' }
  ]);

  const openModal = (item = { id: null, name: '', price: '', image: null, quantity: 0 }) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem({ id: null, name: '', price: '', image: null, quantity: 0 });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setCurrentItem({ ...currentItem, [name]: e.target.files[0] });
    } else {
      setCurrentItem({ ...currentItem, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      ...currentItem,
      id: currentItem.id || Date.now(),
    };
    
    if (currentItem.id) {
      // Update existing item
      setMenuItems(menuItems.map(item => 
        item.id === currentItem.id ? newItem : item
      ));
    } else {
      // Add new item
      setMenuItems([...menuItems, newItem]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAssignStaff = (orderId, staff) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, preparedBy: staff } : order
    ));
  };

  const handleStatusChange = (orderId, status) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderOrderTracking = () => {
    return (
      <div className="order-tracking">
        <h2 className='todays-order'>Today's Order</h2>
        <table className="order-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Name</th>
              <th>Prepared By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.name}</td>
                <td>
                  <select 
                    value={order.preparedBy} 
                    onChange={(e) => handleAssignStaff(order.id, e.target.value)}
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
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
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

  return (
    <div className="admin-interface">
      <header className="admin-header">
        <div className="logo-and-nav">
          <div className="logo-section">
            <img src={profileIcon} alt="Cat Logo" className="cat_profile" />
            <img src={logo} alt="Wildcat Food Express Logo" className="logo-image" />
          </div>
          <nav className="admin-nav">
            <button onClick={() => handleTabChange('menu')} className="nav-link menu-button">Add Menu</button>
            <button onClick={() => handleTabChange('orders')} className="nav-link">Orders</button>
            <button onClick={() => handleTabChange('reports')} className="nav-link">Reports</button>
            <button onClick={() => handleTabChange('userRoles')} className="nav-link">User Roles</button>
          </nav>
        </div>
        <div className="admin-profile">
          <span>Admin Interface</span>
          <img src={cartIcon} alt="Cart" className="cart-icon" />
        </div>
      </header>
      <main className="admin-main">
        {activeTab === 'menu' && (
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
            <button onClick={() => openModal()} className="add-menu-button">Add New Menu</button>
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
                      <p className={`menu-quantity ${item.quantity === 0 ? 'sold-out' : ''}`}>{item.quantity > 0 ? `Available: ${item.quantity}` : 'Sold Out'}</p>
                    </div>
                    <div className="menu-actions">
                      <button onClick={() => openModal(item)} className="action-link">edit</button>
                      <button onClick={() => handleDelete(item.id)} className="action-link">delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-results">No menu item/s {searchTerm} added.</p>
              )}
            </div>
          </>
        )}
        {activeTab === 'orders' && renderOrderTracking()}
        {activeTab === 'reports' && <div>Reports Content</div>}
        {activeTab === 'userRoles' && <div>User Roles Content</div>}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{currentItem.id ? 'Edit Item' : 'Add New Item'}</h2>
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
                  <p className="file-name">Selected file: {currentItem.image.name}</p>
                )}
                <div className="modal-actions">
                  <button type="submit">Save</button>
                  <button type="button" onClick={closeModal}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainAdminInterface;