const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: String,
    phone: { type: String, required: true }, // +91...
    address: String,
    area: String
  },
  items: [{ id: String, name: String, qty: Number, price: Number }],
  bill: { sub: Number, del: Number, total: Number },
  payMode: { type: String, default: 'COD' },
  status: { type: String, default: 'NEW' },
  deliveryOtp: String,
  deliveryOtpVerified: { type: Boolean, default: false },
  estimateMin: { type: Number, default: 30 },
  createdAt: { type: Number, default: () => Date.now() }
}, { versionKey: false });

// ✅ CRITICAL INDEX - My Orders stuck fix
orderSchema.index({ 'customer.phone': 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
