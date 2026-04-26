const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTables, createTable, updateTable, deleteTable, updateTableStatus } = require('../controllers/tableController');

router.use(protect);
router.get('/', getTables);
router.post('/', createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);
router.patch('/:id/status', updateTableStatus);

module.exports = router;
