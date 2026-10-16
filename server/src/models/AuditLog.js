const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '127.0.0.1' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
