const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  barcode: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true },
  subcategory: { type: String, default: 'General' },
  brand: { type: String, default: 'Siva Select' },
  description: { type: String, default: '' },
  images: [{ type: String }],
  mrp: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 }, // percentage or calculated
  gstRate: { type: Number, required: true, default: 5 }, // 0, 5, 12, 18, 28 %
  hsnCode: { type: String, default: '1006' },
  stock: { type: Number, required: true, default: 0, min: 0 },
  minimumStock: { type: Number, default: 10 },
  unit: { type: Number, default: 1 },
  unitType: { type: String, enum: ['kg', 'g', 'L', 'ml', 'pcs', 'pack', 'box'], default: 'pcs' },
  weight: { type: String, default: '' },
  size: { type: String, default: '' },
  batchNumber: { type: String, default: 'BATCH-2026-A' },
  mfgDate: { type: Date },
  expiryDate: { type: Date },
  isReturnable: { type: Boolean, default: true },
  status: { type: String, enum: ['Active', 'Inactive', 'Discontinued'], default: 'Active' },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 12 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false }
}, { timestamps: true });

productSchema.index({ name: 'text', barcode: 1, sku: 1, category: 1 });

module.exports = mongoose.model('Product', productSchema);
