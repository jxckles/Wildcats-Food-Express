const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);