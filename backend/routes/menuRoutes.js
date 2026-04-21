const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadFields } = require('../middleware/uploadMiddleware');

const menuUpload = uploadFields.fields([
  { name: 'image', maxCount: 1 },
  { name: 'arModel', maxCount: 1 },
]);

router.get('/', getMenuItems);
router.get('/id/:id', protect, adminOnly, getMenuItemById);
router.get('/:slug', getMenuItem);
router.post('/', protect, adminOnly, menuUpload, createMenuItem);
router.put('/:id', protect, adminOnly, menuUpload, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
