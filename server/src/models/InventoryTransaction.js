const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  type: {
    type: String,
    enum: ['Stock In', 'Stock Out', 'POS Sale', 'Online Sale', 'Customer Return', 'Supplier Purchase', 'Adjustment'],
    required: true
  },
  quantity: { type: Number, required: true }, // positive or negative
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  referenceId: { type: String, default: '' }, // Order ID or PO ID
  reason: { type: String, default: '' },
  performedBy: { type: String, default: 'System Admin' }
}, { timestamps: true });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
