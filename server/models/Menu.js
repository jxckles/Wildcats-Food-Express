const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);

module.exports = MenuItem;
