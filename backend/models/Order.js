const mongoose = require('mongoose');

const orderedItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customerName: {
      type: String,
      default: '',
      trim: true,
    },
    mobile: {
      type: String,
      default: '',
      trim: true,
    },
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
    },
    orderedItems: [orderedItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'pay_later'],
      default: 'pay_later',
    },
    orderStatus: {
      type: String,
      enum: ['received', 'preparing', 'ready', 'served', 'cancelled'],
      default: 'received',
    },
    tableCleared: {
      type: Boolean,
      default: false,
    },
    tableClearedAt: {
      type: Date,
      default: null,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;
    this.statusHistory = [{ status: 'received', note: 'Order placed successfully' }];
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
