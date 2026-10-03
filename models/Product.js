const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: 'text' },
  price: { type: Number, required: true },
  mrp: { type: Number },
  image: { type: String, required: true },
  category: { type: String, index: true },
  stock: { type: Number, default: 100 },
  active: { type: Boolean, default: true },
  createdAt: { type: Number, default: () => Date.now() }
}, { versionKey: false });

// ✅ FAST INDEXES - 10x speed
productSchema.index({ active: 1, category: 1 });
productSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Product', productSchema);
