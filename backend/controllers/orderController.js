const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

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

// @desc    Place new order
// @route   POST /api/orders
// @access  Public
const placeOrder = async (req, res) => {
  try {
    const { customerName, mobile, tableNumber, orderedItems, specialInstructions } = req.body;

    if (!orderedItems || orderedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
    }

    // Verify menu items exist and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of orderedItems) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item not found: ${item.menuItem}` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ success: false, message: `${menuItem.name} is currently unavailable.` });
      }
      const qty = Number(item.quantity) || 1;
      totalAmount += menuItem.price * qty;
      validatedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        image: menuItem.image,
      });
    }

    const order = await Order.create({
      customerName: customerName || '',
      mobile: mobile || '',
      tableNumber,
      orderedItems: validatedItems,
      totalAmount,
      specialInstructions,
      paymentMethod: 'pay_later',
      paymentStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: { orderId: order._id, orderNumber: order.orderNumber, totalAmount: order.totalAmount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, date } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order (for customer tracking)
// @route   GET /api/orders/:id
// @access  Public
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders by table (customer-facing)
// @route   GET /api/orders/table/:tableNumber
// @access  Public
const getOrdersByTable = async (req, res) => {
  try {
    const rawTable = String(req.params.tableNumber || '').trim();
    if (!rawTable) {
      return res.status(400).json({ success: false, message: 'Table number is required.' });
    }

    const tableQuery = buildTableQuery(rawTable);

    const orders = await Order.find({
      ...tableQuery,
      tableCleared: { $ne: true },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear table after payment completion (admin)
// @route   POST /api/orders/table/:tableNumber/clear
// @access  Admin
const clearTableOrders = async (req, res) => {
  try {
    const rawTable = String(req.params.tableNumber || '').trim();
    if (!rawTable) {
      return res.status(400).json({ success: false, message: 'Table number is required.' });
    }

    const tableQuery = buildTableQuery(rawTable);
    const unclearedOrders = await Order.find({ ...tableQuery, tableCleared: { $ne: true } });

    if (unclearedOrders.length === 0) {
      return res.status(404).json({ success: false, message: 'No active orders found for this table.' });
    }

    const pendingPayments = unclearedOrders.filter((o) => o.paymentStatus === 'pending' && o.orderStatus !== 'cancelled');
    if (pendingPayments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot clear table. Pending payment exists for this table.',
      });
    }

    const result = await Order.updateMany(
      { ...tableQuery, tableCleared: { $ne: true } },
      {
        $set: { tableCleared: true, tableClearedAt: new Date() },
        $push: { statusHistory: { status: 'served', note: 'Table cleared by admin after settlement' } },
      }
    );

    res.json({
      success: true,
      message: `Table ${rawTable} cleared successfully`,
      data: { modifiedCount: result.modifiedCount || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get table-wise history (admin)
// @route   GET /api/orders/history/tables
// @access  Admin
const getTableHistory = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    const grouped = {};

    for (const order of orders) {
      const key = String(order.tableNumber || 'Unknown').trim();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(order);
    }

    const tableHistory = Object.entries(grouped)
      .map(([tableNumber, tableOrders]) => ({
        tableNumber,
        orders: tableOrders,
        totalOrders: tableOrders.length,
        totalRevenue: tableOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      }))
      .sort((a, b) => {
        const an = Number(String(a.tableNumber).replace(/\D/g, ''));
        const bn = Number(String(b.tableNumber).replace(/\D/g, ''));
        if (Number.isFinite(an) && Number.isFinite(bn) && !Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
        return String(a.tableNumber).localeCompare(String(b.tableNumber));
      });

    res.json({ success: true, count: tableHistory.length, data: tableHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, note, paymentStatus } = req.body;
    const validStatuses = ['received', 'preparing', 'ready', 'served', 'cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    const updateData = {
      orderStatus,
      $push: { statusHistory: { status: orderStatus, note: note || `Status updated to ${orderStatus}` } },
    };
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/orders/analytics
// @access  Admin
const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, todayOrders, revenue, pendingOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ orderStatus: { $in: ['received', 'preparing'] } }),
    ]);

    // Top selling dishes
    const topDishes = await Order.aggregate([
      { $unwind: '$orderedItems' },
      { $group: { _id: '$orderedItems.name', totalSold: { $sum: '$orderedItems.quantity' }, revenue: { $sum: { $multiply: ['$orderedItems.price', '$orderedItems.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        totalRevenue: revenue[0]?.total || 0,
        pendingOrders,
        topDishes,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrder,
  getOrdersByTable,
  clearTableOrders,
  getTableHistory,
  updateOrderStatus,
  getAnalytics,
};
