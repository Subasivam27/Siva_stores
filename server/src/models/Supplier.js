const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierCode: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  company: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  gstin: { type: String, default: '33AAAAA0000A1Z5' },
  address: { type: String, required: true },
  categoriesSupplied: [{ type: String }],
  paymentTerms: { type: String, default: 'Net 30 Days' },
  outstandingAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
