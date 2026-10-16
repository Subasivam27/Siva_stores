import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Truck, MapPin, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

export default function OrderModal({ isOpen, onClose }) {
  const { orders, refreshAll, showNotification } = useStore();
  const [processingOrderId, setProcessingOrderId] = useState(null);

  if (!isOpen) return null;

  // Handle Delete Order (Converts order status to Cancelled & restores stock)
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete and cancel this order? Stock will be restored to inventory.')) {
      return;
    }

    setProcessingOrderId(orderId);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (res.ok) {
        showNotification('Order status converted to Cancelled & stock restored!');
        refreshAll();
      } else {
        showNotification(data.message || 'Failed to cancel order', 'error');
      }
    } catch (err) {
      showNotification('Server error processing cancellation', 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const getStepStatus = (currentStatus, step) => {
    const steps = ['Confirmed', 'Packed', 'Out for Delivery', 'Delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);

    if (currentStatus === 'Cancelled') return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    if (currentIndex === stepIndex - 1) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">My Orders & Live Delivery Tracker</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              No recent orders found.
            </div>
          ) : (
            orders.map(order => {
              const isCancelled = order.orderStatus === 'Cancelled';
              const isCanCancel = !['Delivered', 'Cancelled'].includes(order.orderStatus);

              return (
                <div key={order._id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">{order.orderType} Order</span>
                      <h4 className="font-extrabold text-sm text-slate-900">{order.orderNumber}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(order.createdAt).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="font-extrabold text-base text-emerald-700">₹{order.grandTotal}</span>
                      <span className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200">
                        {order.payment.method} ({order.payment.status})
                      </span>

                      {/* Convert to Cancelled tag or Delete Order button */}
                      {isCancelled ? (
                        <span className="mt-1 text-[11px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-3 py-1 rounded-xl flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Cancelled
                        </span>
                      ) : isCanCancel ? (
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={processingOrderId === order._id}
                          className="mt-1 text-[11px] font-extrabold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                          title="Click to cancel and restore stock"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>{processingOrderId === order._id ? 'Cancelling...' : 'Delete Order'}</span>
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 font-medium flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Delivery Address: <strong className="text-slate-900">{order.deliveryAddress.houseFlat}, {order.deliveryAddress.street}, {order.deliveryAddress.areaVillage} - {order.deliveryAddress.pincode}</strong></span>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.quantity}x {it.productName}</span>
                        <span className="font-bold text-slate-900">₹{it.total}</span>
                      </div>
                    ))}
                  </div>

                  {/* Live Status Tracking */}
                  {order.orderType === 'Online' && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Live Status Tracking:</span>
                      {isCancelled ? (
                        <div className="bg-rose-50 text-rose-700 p-2.5 rounded-xl text-xs font-bold border border-rose-200 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-600" /> Order Status: Cancelled</span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono font-bold">Stock Restored</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-1 text-center">
                          {['Confirmed', 'Packed', 'Out for Delivery', 'Delivered'].map(step => {
                            const status = getStepStatus(order.orderStatus, step);
                            return (
                              <div key={step} className="space-y-1">
                                <div className={`h-1.5 rounded-full transition-all ${
                                  status === 'completed'
                                    ? 'bg-emerald-600 shadow-sm'
                                    : status === 'active'
                                    ? 'bg-amber-500 animate-pulse'
                                    : 'bg-slate-200'
                                }`} />
                                <span className={`text-[9px] font-extrabold block ${
                                  status === 'completed' ? 'text-emerald-700' : 'text-slate-400'
                                }`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery Partner */}
                  {order.deliveryStaff && order.deliveryStaff.name && (
                    <div className="bg-white p-2.5 rounded-xl text-xs text-slate-700 flex items-center justify-between border border-slate-200">
                      <div className="flex items-center gap-2 font-medium">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>Delivery Partner: <span className="font-bold text-slate-900">{order.deliveryStaff.name}</span></span>
                      </div>
                      <span className="text-emerald-700 font-mono text-[11px] font-bold">{order.deliveryStaff.phone}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
