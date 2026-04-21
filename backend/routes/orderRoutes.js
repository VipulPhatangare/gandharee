const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  getOrder,
  getOrdersByTable,
  clearTableOrders,
  getTableHistory,
  updateOrderStatus,
  getAnalytics,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', placeOrder);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/history/tables', protect, adminOnly, getTableHistory);
router.post('/table/:tableNumber/clear', protect, adminOnly, clearTableOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/table/:tableNumber', getOrdersByTable);
router.get('/:id', getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
