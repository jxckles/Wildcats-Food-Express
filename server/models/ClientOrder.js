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
    enum: ['Preparing', 'Completed'],
    default: 'Preparing',
  },
  priorityNumber: {
    type: Number,
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

ClientOrderSchema.pre('save', async function(next) {
  const order = this;
  if (order.isNew) {
    let randomNumber;
    let orderWithSameNumber;
    do {
      randomNumber = Math.floor(Math.random() * 1000000); // Generate a random number
      orderWithSameNumber = await mongoose.model('ClientOrder').findOne({ priorityNumber: randomNumber });
    } while (orderWithSameNumber);
    order.priorityNumber = randomNumber;
  }
  next();
});

const ClientOrder = mongoose.model('ClientOrder', ClientOrderSchema);

module.exports = ClientOrder;
