const express = require('express');
const router = express.Router();
const {
  uploadResult,
  getStudentResults,
  getResultsForAdmin,
  deleteResult
} = require('../controllers/resultController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/', adminOnly, upload.single('pdf'), uploadResult);
router.get('/all', adminOnly, getResultsForAdmin);
router.get('/my-results', getStudentResults);
router.delete('/:id', adminOnly, deleteResult);

module.exports = router;
