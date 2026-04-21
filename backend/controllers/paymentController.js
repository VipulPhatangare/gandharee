const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const buildTableQuery = (rawValue) => {
  const rawTable = String(rawValue || '').trim();
  const numericPart = rawTable.match(/\d+/)?.[0] || rawTable;
  const candidates = Array.from(
    new Set([
      rawTable,
      numericPart,
      `Table ${numericPart}`,
      `table ${numericPart}`,
      `#${numericPart}`,
    ].filter(Boolean))
  );
  return { $or: candidates.map((t) => ({ tableNumber: t })) };
};

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order for a table's bill
// @route   POST /api/payment/create-order
// @access  Public
const createPaymentOrder = async (req, res) => {
  try {
    const { tableNumber } = req.body;
    
    if (!tableNumber) {
      return res.status(400).json({ success: false, message: 'Table number is required' });
    }

    // Find all pending/unpaid orders for this table
    const tableQuery = buildTableQuery(tableNumber);
    const pendingOrders = await Order.find({
      ...tableQuery,
      paymentStatus: 'pending',
      tableCleared: { $ne: true },
    });

    if (pendingOrders.length === 0) {
      return res.status(400).json({ success: false, message: 'No pending bill for this table' });
    }

    const totalAmount = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const options = {
      amount: totalAmount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_table_${tableNumber}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Public
const verifyPayment = async (req, res) => {
  try {
    const { tableNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment completely verified. Update all pending orders for this table.
      const tableQuery = buildTableQuery(tableNumber);
      await Order.updateMany(
        { ...tableQuery, paymentStatus: 'pending', tableCleared: { $ne: true } },
        { 
          $set: { paymentStatus: 'paid', paymentMethod: 'upi', orderStatus: 'served' },
          $push: { statusHistory: { status: 'served', note: 'Payment completed via Razorpay' } }
        }
      );

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verify Error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};

module.exports = { createPaymentOrder, verifyPayment };
