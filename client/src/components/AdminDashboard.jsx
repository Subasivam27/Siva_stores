import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Package, ShoppingCart, Truck, Users, FileText, Settings, AlertTriangle, Plus, RefreshCw, Barcode, TrendingUp, DollarSign, Edit3, Trash2, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const {
    products,
    orders,
    suppliers,
    inventoryLogs,
    metrics,
    storeSettings,
    refreshAll,
    showNotification
  } = useStore();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'products' | 'orders' | 'suppliers' | 'gst' | 'settings'

  // Form States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Grocery',
    brand: 'Siva Select',
    mrp: 100,
    sellingPrice: 90,
    gstRate: 5,
    hsnCode: '1006',
    stock: 50,
    minimumStock: 10,
    unitType: 'kg',
    description: ''
  });

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustData, setAdjustData] = useState({ productId: '', type: 'Stock In', quantity: 10, reason: 'Restock' });

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('✅ New Product Added Successfully!');
        setShowAddProductModal(false);
        refreshAll();
      } else {
        showNotification(data.message || 'Failed to add product', 'error');
      }
    } catch (err) {
      showNotification('Server error adding product', 'error');
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustData)
      });
      if (res.ok) {
        showNotification('Stock Adjusted & Logged to Central Inventory!');
        setShowAdjustModal(false);
        refreshAll();
      }
    } catch (err) {
      showNotification('Failed to adjust stock', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showNotification(`Order status updated to: ${newStatus}`);
        refreshAll();
      }
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Executive Overview Header Cards (Light Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Today's Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{metrics ? metrics.todayRevenue : 725}
          </p>
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Online: ₹{metrics ? metrics.todayOnlineSales : 320}</span>
            <span>POS: ₹{metrics ? metrics.todayPosSales : 405}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Orders Today</span>
            <ShoppingCart className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {metrics ? metrics.todayOrdersCount : orders.length} Orders
          </p>
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Pending: <span className="text-amber-600 font-bold">{metrics ? metrics.pendingOrdersCount : 1}</span></span>
            <span>Delivered: <span className="text-emerald-600 font-bold">{orders.filter(o => o.orderStatus === 'Delivered').length}</span></span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600">
            {metrics ? metrics.lowStockCount : products.filter(p => p.stock <= p.minimumStock).length} Alerts
          </p>
          <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
            Out of Stock: <span className="text-rose-600 font-bold">{metrics ? metrics.outOfStockCount : 0} items</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Supplier Dues</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{metrics ? metrics.totalSupplierOutstanding : 39000}
          </p>
          <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
            Active Suppliers: {suppliers.length}
          </div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'inventory'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" /> Central Shared Inventory
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'products'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Barcode className="w-4 h-4" /> Products & Barcodes
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" /> Orders & Delivery Dispatch
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'suppliers'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Suppliers & Purchases
        </button>

        <button
          onClick={() => setActiveTab('gst')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'gst'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> GST Reports & Tax
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" /> Store Settings
        </button>
      </div>

      {/* Tab 1: Central Shared Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Central Inventory Pool (Shared POS + Online)</h3>
            <button
              onClick={() => setShowAdjustModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Manual Stock Adjustment / Stock-In
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Available Stock</th>
                  <th className="p-3 text-center">Min Threshold</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(prod => {
                  const isLow = prod.stock <= prod.minimumStock;
                  return (
                    <tr key={prod._id} className="hover:bg-slate-50">
                      <td className="p-3 font-extrabold text-slate-900">{prod.name}</td>
                      <td className="p-3 font-mono text-amber-700 font-bold">{prod.barcode}</td>
                      <td className="p-3 font-mono text-slate-500">{prod.sku}</td>
                      <td className="p-3 font-medium">{prod.category}</td>
                      <td className="p-3 text-center font-extrabold text-emerald-700 text-sm">
                        {prod.stock} {prod.unitType}
                      </td>
                      <td className="p-3 text-center text-slate-500">{prod.minimumStock}</td>
                      <td className="p-3 text-center">
                        {isLow ? (
                          <span className="bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-extrabold border border-rose-200 text-[10px]">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 text-[10px]">
                            HEALTHY
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Products & Barcode Manager */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">Product Catalog & Barcode Registry</h3>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(prod => (
              <div key={prod._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-amber-700 font-mono font-bold block">{prod.barcode}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{prod.name}</h4>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                    {prod.sku}
                  </span>
                </div>

                <div className="flex justify-between text-xs pt-2 border-t border-slate-100 font-medium">
                  <span className="text-slate-500">MRP: ₹{prod.mrp}</span>
                  <span className="font-bold text-emerald-600">Selling Price: ₹{prod.sellingPrice}</span>
                  <span className="text-slate-500">GST: {prod.gstRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Orders & Delivery Dispatch */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base">Online & POS Orders Registry</h3>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(ord => (
                  <tr key={ord._id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="p-3 font-bold text-emerald-700">{ord.orderType}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{ord.customer.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{ord.customer.phone}</div>
                    </td>
                    <td className="p-3 font-extrabold text-slate-900">₹{ord.grandTotal}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {ord.payment.method} ({ord.payment.status})
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 font-extrabold'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {ord.orderStatus !== 'Delivered' && (
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          className="bg-slate-50 text-slate-800 font-semibold text-xs px-2 py-1 rounded border border-slate-300"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Mark Delivered</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base">Suppliers & Purchase Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(sup => (
              <div key={sup._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{sup.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{sup.company}</p>
                  </div>
                  <span className="bg-amber-50 text-amber-800 text-xs font-extrabold px-2.5 py-1 rounded-xl border border-amber-200">
                    Outstanding: ₹{sup.outstandingAmount}
                  </span>
                </div>
                <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1 font-medium">
                  <p>GSTIN: <span className="font-mono text-slate-800">{sup.gstin}</span></p>
                  <p>Phone: {sup.phone}</p>
                  <p>Address: {sup.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: GST Reports */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          <h3 className="font-extrabold text-slate-900 text-base">GST Tax Report Summary</h3>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block font-semibold">Total CGST Collected</span>
                <p className="text-xl font-extrabold text-emerald-600">₹24.50</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block font-semibold">Total SGST Collected</span>
                <p className="text-xl font-extrabold text-emerald-600">₹24.50</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block font-semibold">Total Taxable Sales</span>
                <p className="text-xl font-extrabold text-slate-900">₹966.00</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Store Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">Store Information Settings</h3>
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 block font-semibold mb-1">Store Name:</label>
              <input type="text" defaultValue={storeSettings.storeName} className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="text-slate-700 block font-semibold mb-1">GSTIN Number:</label>
              <input type="text" defaultValue={storeSettings.gstin} className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 font-mono" />
            </div>
            <div>
              <label className="text-slate-700 block font-semibold mb-1">Store Location Address:</label>
              <input type="text" defaultValue={storeSettings.location} className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="text-slate-700 block font-semibold mb-1">Phone Helpline:</label>
              <input type="text" defaultValue={storeSettings.phone} className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200" />
            </div>
            <button className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900">Add New Product to Catalog</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Barcode</label>
                  <input
                    type="text"
                    required
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="w-full bg-slate-50 text-amber-700 font-mono font-bold p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 font-mono p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.mrp}
                    onChange={(e) => setNewProduct({ ...newProduct, mrp: Number(e.target.value) })}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Sell Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">GST Rate (%)</label>
                  <select
                    value={newProduct.gstRate}
                    onChange={(e) => setNewProduct({ ...newProduct, gstRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 text-emerald-700 font-extrabold p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Stock Adjustment */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900">Manual Stock Adjustment</h3>
            <form onSubmit={handleStockAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Product</label>
                <select
                  value={adjustData.productId}
                  onChange={(e) => setAdjustData({ ...adjustData, productId: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                  required
                >
                  <option value="">Choose product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Current Stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Adjustment Type</label>
                <select
                  value={adjustData.type}
                  onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="Stock In">Stock In (+)</option>
                  <option value="Stock Out">Stock Out (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
