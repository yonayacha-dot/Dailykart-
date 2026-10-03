const mongoose = require('mongoose');
const areaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  charge: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { versionKey: false });
module.exports = mongoose.model('Area', areaSchema);
