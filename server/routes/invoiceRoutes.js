const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getInvoices, getInvoice, createInvoice, updateInvoice, voidInvoice, getPrintInvoice } = require('../controllers/invoiceController');

router.use(protect);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.patch('/:id/void', voidInvoice);
router.get('/:id/print', getPrintInvoice);

module.exports = router;
