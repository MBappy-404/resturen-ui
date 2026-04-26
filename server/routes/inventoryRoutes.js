const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, updateStock, getLowStock, getStockHistory } = require('../controllers/inventoryController');

router.use(protect);
router.get('/', getInventory);
router.get('/low-stock', getLowStock);
router.post('/', roleCheck('super_admin', 'admin', 'manager'), createInventoryItem);
router.put('/:id', roleCheck('super_admin', 'admin', 'manager'), updateInventoryItem);
router.delete('/:id', roleCheck('super_admin', 'admin', 'manager'), deleteInventoryItem);
router.post('/:id/stock', updateStock);
router.get('/:id/history', getStockHistory);

module.exports = router;
