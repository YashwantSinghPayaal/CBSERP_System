const express = require('express');
const router = express.Router();
const {
  getSessions,
  createSession,
  setActiveSession,
  clearClassSessionData,
  getClasses,
  createClass
} = require('../controllers/sessionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

// Sessions
router.get('/', getSessions);
router.post('/', adminOnly, createSession);
router.patch('/:id/activate', adminOnly, setActiveSession);
router.post('/classes/:classId/clear-session', adminOnly, clearClassSessionData);

// Classes
router.get('/classes/all', getClasses);
router.post('/classes', adminOnly, createClass);

module.exports = router;
