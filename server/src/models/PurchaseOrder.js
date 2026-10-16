const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    sku: { type: String },
    orderedQty: { type: Number, required: true },
    receivedQty: { type: Number, default: 0 },
    purchasePrice: { type: Number, required: true },
    gstRate: { type: Number, default: 5 },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  gstTotal: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Partial', 'Received', 'Cancelled'],
    default: 'Sent'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid'
  },
  invoiceNumber: { type: String, default: '' },
  expectedDelivery: { type: Date },
  receivedDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
