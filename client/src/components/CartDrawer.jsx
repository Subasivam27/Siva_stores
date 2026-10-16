import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, MapPin, Tag, ArrowRight, ShieldCheck, Edit2, Check } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }) {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    refreshAll,
    currentUser,
    showNotification
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Address State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState({
    houseFlat: 'No. 14, Main Road',
    street: 'Near Bus Stand',
    areaVillage: 'Somanahalli',
    city: 'Palacode, Dharmapuri',
    state: 'Tamil Nadu',
    pincode: '636808'
  });

  if (!isOpen) return null;

  let subtotal = 0;
  let totalDiscount = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  cart.forEach(item => {
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

  const deliveryFee = subtotal >= 500 || cart.length === 0 ? 0 : 30;
  const couponDiscount = appliedCoupon ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(0, Math.round(subtotal + deliveryFee - couponDiscount));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      showNotification('Coupon WELCOME10 applied (10% OFF)!');
    } else {
      showNotification('Invalid Coupon Code. Try WELCOME10', 'error');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!address.houseFlat || !address.areaVillage || !address.pincode) {
      showNotification('Please fill in complete delivery address details', 'error');
      setIsEditingAddress(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        items: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
        paymentMethod,
        couponCode: appliedCoupon || '',
        customerName: currentUser ? currentUser.name : 'Valued Customer',
        customerPhone: currentUser ? currentUser.phone : '9786414501',
        customerEmail: currentUser ? currentUser.email : '',
        deliveryAddress: address
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        showNotification('🎉 Online Order Placed Successfully!');
        clearCart();
        refreshAll();
        onClose();
      } else {
        showNotification(data.message || 'Checkout failed', 'error');
      }
    } catch (err) {
      showNotification('Server connection error during checkout', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white border-l border-slate-200 text-slate-900 w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl space-y-4 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Your Shopping Cart ({cart.length})</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm font-medium">Your cart is currently empty.</p>
              <button
                onClick={onClose}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200"
              >
                Browse Siva Store Products
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex gap-3 items-center">
                <img
                  src={item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-xl bg-white border border-slate-100"
                />

                <div className="flex-1">
                  <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{item.name}</h5>
                  <span className="text-[10px] text-slate-500 font-medium">₹{item.sellingPrice} / {item.unitType}</span>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      <button onClick={() => updateCartQty(item._id, -1)} className="text-slate-500 hover:text-slate-900">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item._id, 1)} className="text-slate-500 hover:text-slate-900">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-extrabold text-emerald-700 text-xs">
                      ₹{item.sellingPrice * item.quantity}
                    </span>
                  </div>
                </div>

                <button onClick={() => removeFromCart(item._id)} className="text-slate-400 hover:text-rose-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Delivery Address Section */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Delivery Address</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  {isEditingAddress ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                  {isEditingAddress ? 'Done' : 'Edit Address'}
                </button>
              </div>

              {isEditingAddress ? (
                <div className="space-y-2 pt-1 text-xs">
                  <input
                    type="text"
                    placeholder="House / Flat / Door No..."
                    value={address.houseFlat}
                    onChange={(e) => setAddress({ ...address, houseFlat: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Street / Landmark..."
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Area / Village..."
                      value={address.areaVillage}
                      onChange={(e) => setAddress({ ...address, areaVillage: e.target.value })}
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Pincode..."
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs focus:outline-none font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-700 font-medium leading-tight">
                  <span className="font-bold text-slate-900 block">{address.houseFlat}, {address.street}</span>
                  <span>{address.areaVillage}, {address.city} - {address.pincode}</span>
                </div>
              )}
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon Code (e.g. WELCOME10)..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-slate-50 text-slate-900 placeholder-slate-400 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-emerald-700 font-bold px-3.5 py-1.5 rounded-xl text-xs border border-slate-200">
                Apply
              </button>
            </form>

            {/* Price Summary Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{Math.round(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Estimated GST (5%/18%)</span>
                <span>₹{(totalCgst + totalSgst).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Coupon Discount (10%)</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount Payable</span>
                <span className="text-emerald-600">₹{grandTotal}</span>
              </div>
            </div>

            {/* Payment Method Option */}
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`flex-1 py-2 rounded-xl font-bold text-center border transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`flex-1 py-2 rounded-xl font-bold text-center border transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Online UPI Pay
              </button>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Place Order & Confirm'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
