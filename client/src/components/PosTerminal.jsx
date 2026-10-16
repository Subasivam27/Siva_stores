import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Barcode, Search, Plus, Minus, Trash2, CreditCard, DollarSign, QrCode, Printer, RefreshCw, Camera, X, CheckCircle2, Zap, AlertCircle, ShoppingBag } from 'lucide-react';

export default function PosTerminal() {
  const {
    products,
    storeSettings,
    currentUser,
    refreshAll,
    showNotification
  } = useStore();

  const [posCart, setPosCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '9999999999' });
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [cashTendered, setCashTendered] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDaySummaryModal, setShowDaySummaryModal] = useState(false);
  const [daySummaryData, setDaySummaryData] = useState(null);

  // Camera Scanner Modal State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Dynamically initialize HTML5 camera reader when camera modal is active
  useEffect(() => {
    let html5QrCode = null;

    if (isCameraActive) {
      import('html5-qrcode')
        .then(({ Html5Qrcode }) => {
          try {
            html5QrCode = new Html5Qrcode('camera-reader');
            const config = { fps: 10, qrbox: { width: 260, height: 160 } };

            html5QrCode.start(
              { facingMode: 'environment' },
              config,
              (decodedText) => {
                handleCameraBarcodeDetected(decodedText);
              },
              () => {}
            ).catch(err => {
              console.warn('Camera permission or device error:', err);
              setCameraError('Camera access not available or permission denied. Use quick barcode tap below.');
            });
          } catch (e) {
            setCameraError('Camera module initialization error. Use quick barcode tap below.');
          }
        })
        .catch(() => {
          setCameraError('HTML5 Scanner library loading. Use quick tap below.');
        });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error(err));
      }
    };
  }, [isCameraActive]);

  // Handle Barcode Detection
  const handleCameraBarcodeDetected = (code) => {
    const product = products.find(p => p.barcode === code || p.sku.toUpperCase() === code.toUpperCase());

    if (product) {
      addItemToPosCart(product);
      showNotification(`📷 Scanned & Added: ${product.name} (₹${product.sellingPrice})`);
    } else {
      showNotification(`Scanned Barcode ${code} not found in catalog`, 'error');
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const barcodeToFind = barcodeInput.trim();
    const product = products.find(p => p.barcode === barcodeToFind || p.sku.toUpperCase() === barcodeToFind.toUpperCase());

    if (product) {
      addItemToPosCart(product);
      setBarcodeInput('');
    } else {
      showNotification(`No product found for Barcode / SKU: ${barcodeToFind}`, 'error');
    }
  };

  const addItemToPosCart = (product) => {
    if (product.stock <= 0) {
      showNotification(`Product ${product.name} is OUT OF STOCK!`, 'error');
      return;
    }

    setPosCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          showNotification(`Cannot exceed available stock limit (${product.stock})`, 'error');
          return prev;
        }
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updatePosQty = (productId, delta) => {
    setPosCart(prev => {
      return prev.map(item => {
        if (item._id === productId) {
          const product = products.find(p => p._id === productId);
          const maxStock = product ? product.stock : 999;
          const newQty = item.quantity + delta;
          if (newQty > maxStock) {
            showNotification(`Max stock limit reached (${maxStock})`, 'error');
            return item;
          }
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removePosItem = (productId) => {
    setPosCart(prev => prev.filter(item => item._id !== productId));
  };

  let subtotal = 0;
  let totalDiscount = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  posCart.forEach(item => {
    const itemSub = item.sellingPrice * item.quantity;
    const itemDisc = Math.max(0, (item.mrp - item.sellingPrice) * item.quantity);
    const gstRate = item.gstRate || 5;

    const taxAmount = (itemSub * gstRate) / (100 + gstRate);
    const halfTax = taxAmount / 2;

    subtotal += itemSub;
    totalDiscount += itemDisc;
    totalCgst += halfTax;
    totalSgst += halfTax;
  });

  const grandTotal = Math.round(subtotal);
  const changeAmount = Math.max(0, Number(cashTendered) - grandTotal);

  const handleProcessBill = async () => {
    if (posCart.length === 0) {
      showNotification('POS Cart is empty! Scan items to bill.', 'error');
      return;
    }

    if (paymentMode === 'Cash' && cashTendered && Number(cashTendered) < grandTotal) {
      showNotification(`Cash tendered (₹${cashTendered}) is less than Bill Total (₹${grandTotal})`, 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        items: posCart.map(item => ({ productId: item._id, quantity: item.quantity })),
        customer,
        payment: {
          method: paymentMode,
          amountPaid: Number(cashTendered) || grandTotal,
          changeGiven: changeAmount
        },
        cashierName: currentUser ? currentUser.name : 'Mani (Cashier)'
      };

      const res = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        showNotification('✅ POS Invoice Generated Successfully!');
        setCompletedOrder(data.order);
        setShowReceiptModal(true);
        setPosCart([]);
        setCashTendered('');
        refreshAll();
      } else {
        showNotification(data.message || 'POS Checkout Failed', 'error');
      }
    } catch (err) {
      showNotification('Error connecting to POS API server', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchDayClosingSummary = async () => {
    try {
      const res = await fetch('/api/pos/day-summary');
      if (res.ok) {
        const data = await res.json();
        setDaySummaryData(data);
        setShowDaySummaryModal(true);
      }
    } catch (err) {
      showNotification('Failed to load day summary', 'error');
    }
  };

  const filteredProducts = products.filter(p => {
    const s = searchQuery.toLowerCase();
    return !searchQuery || p.name.toLowerCase().includes(s) || p.barcode.includes(s) || p.sku.toLowerCase().includes(s);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* POS Top Header & Quick Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
            <Barcode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg">POS COUNTER TERMINAL #1</h2>
            <p className="text-xs text-slate-500 font-medium">Cashier: <span className="text-emerald-600 font-bold">{currentUser ? currentUser.name : 'Mani (Cashier)'}</span></p>
          </div>
        </div>

        {/* Barcode Fast Scanner Input */}
        <form onSubmit={handleBarcodeSubmit} className="flex-1 max-w-md relative">
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan Barcode or Type SKU (Press Enter)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="w-full bg-slate-50 text-emerald-800 font-mono placeholder-slate-400 pl-10 pr-28 py-2.5 rounded-xl border border-amber-300 text-sm focus:outline-none focus:border-amber-500 focus:bg-white shadow-inner"
          />
          <Barcode className="w-5 h-5 text-amber-600 absolute left-3 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm"
          >
            SCAN
          </button>
        </form>

        {/* Open Camera Barcode Scanner Button */}
        <button
          onClick={() => { setCameraError(''); setIsCameraActive(true); }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
        >
          <Camera className="w-4 h-4" /> Open Camera Scanner
        </button>

        <button
          onClick={fetchDayClosingSummary}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-emerald-600" /> Day Summary
        </button>
      </div>

      {/* Main POS Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog by product name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-slate-800 placeholder-slate-400 text-xs focus:outline-none"
            />
          </div>

          {/* Quick Item Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredProducts.map(prod => (
              <button
                key={prod._id}
                onClick={() => addItemToPosCart(prod)}
                disabled={prod.stock <= 0}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 relative ${
                  prod.stock <= 0
                    ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md'
                }`}
              >
                <div>
                  <span className="text-[10px] text-amber-600 font-mono font-bold block truncate">{prod.barcode}</span>
                  <h5 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight mt-0.5">{prod.name}</h5>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 mt-1">
                  <span className="font-extrabold text-emerald-600">₹{prod.sellingPrice}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Qty: {prod.stock}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: POS Billing Cart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                Current POS Bill Items ({posCart.length})
              </h3>
              {posCart.length > 0 && (
                <button
                  onClick={() => setPosCart([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items Table */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 my-2 pr-1">
              {posCart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  Scan barcode or click items on the left to add to bill.
                </div>
              ) : (
                posCart.map(item => (
                  <div key={item._id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex-1">
                      <h6 className="font-bold text-slate-900 leading-tight line-clamp-1">{item.name}</h6>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                        <span>₹{item.sellingPrice} / item</span>
                        <span>• GST {item.gstRate}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                      <button onClick={() => updatePosQty(item._id, -1)} className="text-slate-500 hover:text-slate-900">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-slate-900 text-xs w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updatePosQty(item._id, 1)} className="text-slate-500 hover:text-slate-900">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right font-extrabold text-slate-900 w-14">
                      ₹{item.sellingPrice * item.quantity}
                    </div>

                    <button onClick={() => removePosItem(item._id)} className="text-slate-400 hover:text-rose-600 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* POS Bill Summary */}
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="space-y-1 text-xs text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal (Excl. Tax)</span>
                <span>₹{Math.max(0, Math.round(subtotal - (totalCgst + totalSgst)))}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>CGST</span>
                <span>+₹{totalCgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>SGST</span>
                <span>+₹{totalSgst.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Customer Savings</span>
                  <span>-₹{Math.round(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-emerald-600">₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Payment Method:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('Cash')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    paymentMode === 'Cash'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> Cash
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    paymentMode === 'UPI'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> UPI QR
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('Card')}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    paymentMode === 'Card'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Card
                </button>
              </div>
            </div>

            {/* Cash Tendered */}
            {paymentMode === 'Cash' && (
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 block font-semibold">Cash Tendered (₹):</label>
                  <input
                    type="number"
                    placeholder={`Min ₹${grandTotal}`}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="bg-transparent text-slate-900 font-extrabold text-sm w-full focus:outline-none"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-semibold">Change to Return:</span>
                  <span className="text-amber-600 font-extrabold text-sm">₹{changeAmount}</span>
                </div>
              </div>
            )}

            {/* Complete Bill */}
            <button
              onClick={handleProcessBill}
              disabled={isProcessing || posCart.length === 0}
              className={`w-full py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                isProcessing || posCart.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              <Printer className="w-4 h-4" />
              {isProcessing ? 'Processing Bill...' : `Complete Sale & Print GST Bill (₹${grandTotal})`}
            </button>
          </div>
        </div>
      </div>

      {/* Camera Barcode Scanner Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsCameraActive(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Camera Barcode Scanner Active</span>
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Scan Product Barcode</h3>
              <p className="text-xs text-slate-500">Align barcode inside the camera detection box or tap below</p>
            </div>

            {/* Live Camera Feed Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500 min-h-[220px] flex items-center justify-center">
              <div id="camera-reader" className="w-full h-full min-h-[220px]"></div>
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-rose-500 shadow-lg shadow-rose-500/80 animate-pulse pointer-events-none z-10"></div>
            </div>

            {cameraError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] text-center font-medium">
                {cameraError}
              </div>
            )}

            {/* Quick Barcode Tap Scanner */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block text-center">Quick Tap Barcode Scan Simulation:</span>
              <div className="grid grid-cols-2 gap-2">
                {products.slice(0, 4).map(prod => (
                  <button
                    key={prod._id}
                    onClick={() => handleCameraBarcodeDetected(prod.barcode)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-800 hover:text-emerald-700 transition-all text-left flex flex-col justify-between"
                  >
                    <span className="line-clamp-1">{prod.name}</span>
                    <span className="font-mono text-[10px] text-amber-600">[{prod.barcode}]</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsCameraActive(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}

      {/* Printable Thermal Receipt Modal */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div id="printable-receipt" className="font-mono text-xs space-y-3">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <h3 className="font-extrabold text-sm uppercase">{storeSettings.storeName}</h3>
                <p className="text-[11px] text-slate-600">{storeSettings.location}</p>
                <p className="text-[11px]">GSTIN: <span className="font-bold">{storeSettings.gstin}</span></p>
                <p className="text-[11px]">Phone: {storeSettings.phone}</p>
              </div>

              <div className="flex justify-between text-[11px] py-1 border-b border-dashed border-slate-300">
                <span>Bill: #{completedOrder.orderNumber}</span>
                <span>{new Date(completedOrder.createdAt).toLocaleDateString('en-IN')}</span>
              </div>

              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {completedOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1 max-w-[120px] truncate">{it.productName}</td>
                      <td className="py-1 text-center">{it.quantity}</td>
                      <td className="py-1 text-right">₹{it.unitPrice}</td>
                      <td className="py-1 text-right font-bold">₹{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>CGST:</span>
                  <span>₹{completedOrder.cgst}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST:</span>
                  <span>₹{completedOrder.sgst}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-400">
                  <span>Grand Total:</span>
                  <span>₹{completedOrder.grandTotal}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
                <p>Thank you for shopping at Siva Dept Store!</p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Thermal GST Receipt
            </button>
          </div>
        </div>
      )}

      {/* Day Closing Summary Modal */}
      {showDaySummaryModal && daySummaryData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowDaySummaryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-900">
              <RefreshCw className="w-5 h-5 text-emerald-600" /> POS Day Closing Summary ({daySummaryData.date})
            </h3>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Revenue</span>
                <p className="text-xl font-extrabold text-emerald-600">₹{daySummaryData.totalSales}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Bills Issued</span>
                <p className="text-xl font-extrabold text-slate-900">{daySummaryData.totalBills} Bills</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Cash Collected</span>
                <p className="text-lg font-bold text-slate-800">₹{daySummaryData.cashSales}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">UPI & Card</span>
                <p className="text-lg font-bold text-slate-800">₹{daySummaryData.upiSales + daySummaryData.cardSales}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
              Total items sold counter today: <span className="text-slate-900 font-bold">{daySummaryData.totalItemsSold} items</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
