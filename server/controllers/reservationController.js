const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

const getReservations = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = { organization: req.user.organization._id };
    if (status) query.status = status;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const total = await Reservation.countDocuments(query);
    const reservations = await Reservation.find(query)
      .populate('table', 'tableNo capacity')
      .populate('customer', 'name phone')
      .sort('-date')
      .skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, data: reservations, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create({ ...req.body, organization: req.user.organization._id });
    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, { status: 'reserved' });
    }
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    ).populate('table', 'tableNo');
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      { status }, { new: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    if (status === 'cancelled' || status === 'completed' || status === 'no_show') {
      if (reservation.table) await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
    }
    if (status === 'seated' && reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, { status: 'occupied' });
    }
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    if (reservation.table) await Table.findByIdAndUpdate(reservation.table, { status: 'available' });
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const tables = await Table.find({ organization: req.user.organization._id, isActive: true });
    const reservations = await Reservation.find({
      organization: req.user.organization._id,
      date: new Date(date),
      status: { $nin: ['cancelled', 'no_show'] }
    });
    const slots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
    const available = slots.map(slot => ({
      time: slot,
      availableTables: tables.filter(t => !reservations.some(r => r.timeSlot === slot && String(r.table) === String(t._id))).length
    }));
    res.json({ success: true, data: available });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReservations, createReservation, updateReservation, updateReservationStatus, deleteReservation, getAvailableSlots };
