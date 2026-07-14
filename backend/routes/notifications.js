const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/v1/notifications
router.get('/', async (req, res) => {
  try {
     const notifs = await prisma.notification.findMany({
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
     const notif = await prisma.notification.create({
        data: {
           title: title || 'New Notification',
           message: message || '',
           type: type || 'system',
           targetType: targetType || 'All'
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
      const notif = await prisma.notification.update({
         where: { id: req.params.id },
         data: { isRead: true }
      });
      res.json(notif);
   } catch(e) {
      res.status(500).json({ error: 'Failed' });
   }
});

module.exports = router;
