const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getClassAttendance,
  getStudentAttendance
} = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', adminOnly, markAttendance);
router.get('/class', adminOnly, getClassAttendance);
router.get('/my-attendance', getStudentAttendance);

module.exports = router;
