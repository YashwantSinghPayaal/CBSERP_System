const express = require('express');
const router = express.Router();
const {
  addStudentByAdmin,
  getStudents,
  updateStudentStatus,
  updateStudentClass,
  deleteStudent
} = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.post('/', addStudentByAdmin);
router.get('/', getStudents);
router.patch('/:id/status', updateStudentStatus);
router.patch('/:id/class', updateStudentClass);
router.delete('/:id', deleteStudent);

module.exports = router;
