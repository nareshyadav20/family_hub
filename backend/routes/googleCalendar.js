const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleCalendarController');
const jwt = require('jsonwebtoken');

// Middleware to authenticate
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ success: false, message: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

router.get('/connect', authenticateToken, googleController.connectGoogleCalendar);
router.get('/callback', googleController.googleOAuthCallback);
router.get('/status', authenticateToken, googleController.getStatus);
router.delete('/disconnect', authenticateToken, googleController.disconnectGoogleCalendar);
router.post('/sync', authenticateToken, googleController.syncAllEvents);

module.exports = router;
