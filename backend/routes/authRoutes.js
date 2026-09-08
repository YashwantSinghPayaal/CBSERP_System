const express = require('express');
const router = express.Router();
const {
  adminRegister,
  adminLogin,
  studentLogin,
  studentRegisterRequest,
  updateAdminProfile,
  getMe,
  getInstitutionAdmins
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.post('/student/login', studentLogin);
router.post('/student/register-request', studentRegisterRequest);
router.put('/admin/profile', protect, adminOnly, updateAdminProfile);
router.get('/me', protect, getMe);
router.get('/admin/team', protect, adminOnly, getInstitutionAdmins);

module.exports = router;
