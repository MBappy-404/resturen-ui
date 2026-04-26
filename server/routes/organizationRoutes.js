const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  getOrganization, updateOrganization, updateSettings,
  getBranches, createBranch, updateBranch, deleteBranch,
  getUsers, inviteUser, updateUserRole
} = require('../controllers/organizationController');

router.use(protect);
router.get('/', getOrganization);
router.put('/', roleCheck('super_admin', 'admin'), updateOrganization);
router.put('/settings', roleCheck('super_admin', 'admin'), updateSettings);
router.get('/branches', getBranches);
router.post('/branches', roleCheck('super_admin', 'admin'), createBranch);
router.put('/branches/:id', roleCheck('super_admin', 'admin'), updateBranch);
router.delete('/branches/:id', roleCheck('super_admin', 'admin'), deleteBranch);
router.get('/users', getUsers);
router.post('/users/invite', roleCheck('super_admin', 'admin'), inviteUser);
router.patch('/users/:id/role', roleCheck('super_admin', 'admin'), updateUserRole);

module.exports = router;
