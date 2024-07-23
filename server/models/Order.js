const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  menusOrdered: [
    {
      itemName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  studentNumber: {
    type: String,
    required: true,
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Pending",
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  receiptPath: {
    type: String,
    default: null, // Will be null initially and can be updated later
  },
  referenceNumber: {
    type: String,
    default: null, // Will be null initially and can be updated later
  },
  amountSent: {
    type: Number,
    default: null, // Will be null initially and can be updated later
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
