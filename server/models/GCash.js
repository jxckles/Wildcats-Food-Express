const mongoose = require('mongoose');

const gcashSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('GCash', gcashSchema);