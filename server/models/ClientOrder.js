const mongoose = require('mongoose');

const ClientOrderSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    match: /^\d{2}-\d{4}-\d{3}$/,
  },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  }],
  status: {
    type: String,
    enum: ['Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'],
    default: 'Preparing',
  },
  priorityNumber: {
    type: String,
    required: true,
    unique: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true,
});

ClientOrderSchema.pre('save', async function(next) {
  const order = this;
  if (order.isNew) {
    let orderWithSameNumber;
    let maxPriorityNumber = 0;

    const lastOrder = await mongoose.model('ClientOrder').findOne().sort({ priorityNumber: -1 }).exec();
    if (lastOrder && lastOrder.priorityNumber) {
      maxPriorityNumber = parseInt(lastOrder.priorityNumber, 10);
    }

    const newPriorityNumber = maxPriorityNumber + 1;
    order.priorityNumber = String(newPriorityNumber).padStart(3, '0');  // Pad with leading zeros

    orderWithSameNumber = await mongoose.model('ClientOrder').findOne({ priorityNumber: order.priorityNumber });
    while (orderWithSameNumber) {
      maxPriorityNumber += 1;
      order.priorityNumber = String(maxPriorityNumber).padStart(3, '0');
      orderWithSameNumber = await mongoose.model('ClientOrder').findOne({ priorityNumber: order.priorityNumber });
    }
  }
  next();
});

const ClientOrder = mongoose.model('ClientOrder', ClientOrderSchema);

module.exports = ClientOrder;
