const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getReservations, createReservation, updateReservation, updateReservationStatus, deleteReservation, getAvailableSlots } = require('../controllers/reservationController');

router.use(protect);
router.get('/', getReservations);
router.get('/available-slots', getAvailableSlots);
router.post('/', createReservation);
router.put('/:id', updateReservation);
router.patch('/:id/status', updateReservationStatus);
router.delete('/:id', deleteReservation);

module.exports = router;
