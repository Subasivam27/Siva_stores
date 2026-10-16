const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
  discountValue: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 200 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  usageLimit: { type: Number, default: 100 },
  timesUsed: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
