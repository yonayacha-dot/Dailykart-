const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  tag: String,
  emoji: String,
  link: String,
  active: { type: Boolean, default: true }
}, { versionKey: false });
module.exports = mongoose.model('Banner', bannerSchema);
