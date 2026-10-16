const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'ZYPHOR ZONE' },
  storeName: { type: String, default: 'Siva Department Store' },
  ownerName: { type: String, default: 'Sivaji' },
  location: { type: String, default: 'Somanahalli, Palacode, Dharmapuri, Tamil Nadu' },
  pincode: { type: String, default: '636808' },
  phone: { type: String, default: '9786414501' },
  email: { type: String, default: 'contact@sivastore.zyphor.zone' },
  gstin: { type: String, default: '33AAAFS1234F1Z9' },
  currency: { type: String, default: '₹' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  openingTime: { type: String, default: '09:00 AM' },
  closingTime: { type: String, default: '10:00 PM' },
  deliveryEnabled: { type: Boolean, default: true },
  defaultDeliveryFee: { type: Number, default: 30 },
  freeDeliveryMinOrder: { type: Number, default: 500 },
  returnPeriodDays: { type: Number, default: 7 }
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
