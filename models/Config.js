const mongoose = require('mongoose');
const configSchema = new mongoose.Schema({
  appName: String,
  tagline: String,
  logo: String,
  address: String,
  phone: String,
  whatsapp: [String],
  email: String,
  upiId: String,
  qrCode: String,
  deliveryCharge: Number,
  minOrder: Number,
  extraCharge: Number,
  openTime: String,
  closeTime: String,
  shopOff: Boolean,
  bannerTitle: String,
  bannerSubtitle: String,
  bannerImg: String,
  areas: [{name: String, time: String, charge: Number}],
  coupons: [{code: String, discount: Number}],
  boys: [{name: String, phone: String}]
},{timestamps:true});
module.exports = mongoose.model('Config', configSchema);
