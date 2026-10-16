import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [activePortal, setActivePortal] = useState('customer'); // 'customer' | 'pos' | 'admin'

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('zyphor_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('zyphor_token') || '');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [storeSettings, setStoreSettings] = useState({
    platformName: 'ZYPHOR ZONE',
    storeName: 'Siva Department Store',
    ownerName: 'Sivaji',
    location: 'Somanahalli, Palacode, Dharmapuri, Tamil Nadu',
    phone: '9786414501',
    email: 'contact@sivastore.zyphor.zone',
    gstin: '33AAAFS1234F1Z9',
    openingTime: '09:00 AM',
    closingTime: '10:00 PM',
    defaultDeliveryFee: 30,
    freeDeliveryMinOrder: 500
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data);
        setToken(data.token);
        localStorage.setItem('zyphor_user', JSON.stringify(data));
        localStorage.setItem('zyphor_token', data.token);

        showNotification(`Welcome back, ${data.name}!`);

        // Automatically route user to relevant portal
        if (data.role === 'Owner' || data.role === 'Super Admin') {
          setActivePortal('admin');
        } else if (data.role === 'Cashier') {
          setActivePortal('pos');
        } else {
          setActivePortal('customer');
        }

        return { success: true };
      } else {
        showNotification(data.message || 'Invalid credentials', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showNotification('Network connection error', 'error');
      return { success: false, message: 'Server error' };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data);
        setToken(data.token);
        localStorage.setItem('zyphor_user', JSON.stringify(data));
        localStorage.setItem('zyphor_token', data.token);

        showNotification(`Account created successfully! Welcome, ${data.name}`);
        setActivePortal('customer');
        return { success: true };
      } else {
        showNotification(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      showNotification('Network error during registration', 'error');
      return { success: false };
    }
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setToken('');
    localStorage.removeItem('zyphor_user');
    localStorage.removeItem('zyphor_token');
    setActivePortal('customer');
    showNotification('Logged out successfully');
  };

  // Role Checking Helpers
  const isAdmin = currentUser?.role === 'Owner' || currentUser?.role === 'Super Admin';
  const isCashier = isAdmin || currentUser?.role === 'Cashier' || currentUser?.role === 'Store Manager';

  // Fetch initial data from API
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.warn('API connection offline');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.warn('API offline');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.warn('API offline');
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/reports/dashboard');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.warn('API offline');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch (err) {
      console.warn('API offline');
    }
  };

  const fetchInventoryLogs = async () => {
    try {
      const res = await fetch('/api/inventory/transactions');
      if (res.ok) {
        const data = await res.json();
        setInventoryLogs(data);
      }
    } catch (err) {
      console.warn('API offline');
    }
  };

  const refreshAll = () => {
    fetchProducts();
    fetchCategories();
    fetchOrders();
    fetchMetrics();
    fetchSuppliers();
    fetchInventoryLogs();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Cart operations
  const addToCart = (product, qty = 1) => {
    if (product.stock <= 0) {
      showNotification(`${product.name} is currently Out of Stock`, 'error');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.quantity + qty > product.stock) {
          showNotification(`Cannot add more than available stock (${product.stock})`, 'error');
          return prev;
        }
        return prev.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    showNotification(`Added ${product.name} to cart`);
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item._id === productId) {
          const product = products.find(p => p._id === productId);
          const maxStock = product ? product.stock : 999;
          const newQty = item.quantity + delta;
          if (newQty > maxStock) {
            showNotification(`Max available stock is ${maxStock}`, 'error');
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <StoreContext.Provider value={{
      activePortal,
      setActivePortal,
      currentUser,
      login,
      register,
      logout,
      isAdmin,
      isCashier,
      products,
      categories,
      cart,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      orders,
      suppliers,
      inventoryLogs,
      metrics,
      storeSettings,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      refreshAll,
      notification,
      showNotification
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
