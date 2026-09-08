const express = require('express');
const router = express.Router();
const {
  updateFeeRecord,
  getAllFees,
  getStudentFee
} = require('../controllers/feeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', adminOnly, updateFeeRecord);
router.get('/', adminOnly, getAllFees);
router.get('/my-fee', getStudentFee);

module.exports = router;
