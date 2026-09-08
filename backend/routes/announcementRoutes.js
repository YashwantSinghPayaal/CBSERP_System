const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', adminOnly, upload.single('pdf'), createAnnouncement);
router.delete('/:id', adminOnly, deleteAnnouncement);

module.exports = router;
