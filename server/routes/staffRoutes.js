const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getStaff, getStaffMember, createStaff, updateStaff, deleteStaff,
  markAttendance, getAttendance, getPerformance, manageLeave, updateLeave
} = require('../controllers/staffController');

router.use(protect);
router.get('/', getStaff);
router.get('/:id', getStaffMember);
router.post('/', roleCheck('super_admin', 'admin'), createStaff);
router.put('/:id', roleCheck('super_admin', 'admin'), updateStaff);
router.delete('/:id', roleCheck('super_admin', 'admin'), deleteStaff);
router.post('/:id/attendance', markAttendance);
router.get('/:id/attendance', getAttendance);
router.get('/:id/performance', getPerformance);
router.post('/:id/leaves', manageLeave);
router.patch('/:id/leaves/:leaveId', roleCheck('super_admin', 'admin', 'manager'), updateLeave);

module.exports = router;
