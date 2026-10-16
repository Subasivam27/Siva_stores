const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
  zoneName: { type: String, required: true, trim: true },
  pincodes: [{ type: String, required: true }],
  deliveryCharge: { type: Number, required: true, default: 30 },
  freeDeliveryThreshold: { type: Number, default: 500 },
  minOrderAmount: { type: Number, default: 100 },
  estimatedDeliveryHours: { type: Number, default: 2 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);
