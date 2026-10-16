const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  orderType: { type: String, enum: ['Online', 'POS'], default: 'Online' },
  customer: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' }
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    sku: { type: String },
    barcode: { type: String },
    unitPrice: { type: Number, required: true },
    mrp: { type: Number, required: true },
    quantity: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gstRate: { type: Number, default: 5 },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discountTotal: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  gstTotal: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  grandTotal: { type: Number, required: true },
  payment: {
    method: { type: String, enum: ['Cash', 'UPI', 'Card', 'COD', 'Net Banking'], required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Paid' },
    transactionId: { type: String, default: '' },
    amountPaid: { type: Number, required: true },
    changeGiven: { type: Number, default: 0 }
  },
  orderStatus: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Processing',
      'Picking',
      'Packed',
      'Assigned',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Return Requested',
      'Returned'
    ],
    default: 'Confirmed'
  },
  deliveryAddress: {
    houseFlat: { type: String, default: '' },
    street: { type: String, default: '' },
    areaVillage: { type: String, default: '' },
    city: { type: String, default: 'Dharmapuri' },
    state: { type: String, default: 'Tamil Nadu' },
    pincode: { type: String, default: '636808' }
  },
  deliveryStaff: {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  deliveryOtp: { type: String, default: '4829' },
  cashierName: { type: String, default: '' },
  posTerminalId: { type: String, default: 'POS-COUNTER-1' },
  notes: { type: String, default: '' },
  invoiceUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
