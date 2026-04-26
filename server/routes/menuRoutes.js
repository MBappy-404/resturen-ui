const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getCategories, createCategory, updateCategory, deleteCategory, reorderCategories,
  getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
  toggleAvailability, toggleFeatured
} = require('../controllers/menuController');

router.use(protect);

// Categories
router.get('/categories', getCategories);
router.post('/categories', roleCheck('super_admin', 'admin', 'manager'), createCategory);
router.put('/categories/:id', roleCheck('super_admin', 'admin', 'manager'), updateCategory);
router.delete('/categories/:id', roleCheck('super_admin', 'admin', 'manager'), deleteCategory);
router.patch('/categories/reorder', roleCheck('super_admin', 'admin', 'manager'), reorderCategories);

// Menu Items
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', roleCheck('super_admin', 'admin', 'manager'), createMenuItem);
router.put('/:id', roleCheck('super_admin', 'admin', 'manager'), updateMenuItem);
router.delete('/:id', roleCheck('super_admin', 'admin', 'manager'), deleteMenuItem);
router.patch('/:id/availability', roleCheck('super_admin', 'admin', 'manager'), toggleAvailability);
router.patch('/:id/featured', roleCheck('super_admin', 'admin', 'manager'), toggleFeatured);

module.exports = router;
