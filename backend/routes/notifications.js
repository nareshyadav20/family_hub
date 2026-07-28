const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

router.use(authenticateToken);

// GET /api/v1/notifications
router.get('/', async (req, res) => {
  try {
     const familyId = req.user.familyId;
     if (!familyId) return res.json([]);
     
     const notifs = await prisma.notification.findMany({
        where: { familyId },
        orderBy: { createdAt: 'desc' }
     });
     res.json(notifs);
  } catch (error) {
     res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/v1/notifications
// Usually called internally but we can expose it for triggering tests
router.post('/', async (req, res) => {
  try {
     const { title, message, type, targetType } = req.body;
     const familyId = req.user.familyId;
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

     const notif = await prisma.notification.create({
        data: {
           title: title || 'New Notification',
           message: message || '',
           type: type || 'system',
           targetType: targetType || 'All',
           familyId: familyId
        }
     });
     const io = req.app.get('socketio');
     io.emit('notification.created', notif);
     res.status(201).json(notif);
  } catch (error) {
     res.status(500).json({ error: 'Failed to create notification' });
  }
});

// PUT /api/v1/notifications/:id/read
router.put('/:id/read', async (req, res) => {
   try {
      const familyId = req.user.familyId;
      const notif = await prisma.notification.update({
         where: { id: req.params.id, familyId },
         data: { isRead: true }
      });
      res.json(notif);
   } catch(e) {
      res.status(500).json({ error: 'Failed' });
   }
});

module.exports = router;
