const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
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
    default: "Completed", // Assuming orders in history are always completed
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  completedDate: {
    type: Date,
    default: Date.now, // The date when the order was moved to history
  },
});

const History = mongoose.model("History", historySchema);

module.exports = History;
