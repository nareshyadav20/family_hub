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

// POST /api/v1/admin/announcements
router.post('/', authenticateToken, async (req, res) => {
  try {
     const { title, message, targetType, pinned } = req.body;
     const authorId = req.user.userId;
     const familyId = req.user.familyId;
     
     if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
     }
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

     const announcement = await prisma.announcement.create({
        data: {
           title,
           message,
           targetType: targetType || 'All Members',
           pinned: !!pinned,
           authorId: authorId,
           familyId: familyId
        },
        include: {
           author: { select: { firstName: true, lastName: true, avatar: true } }
        }
     });

     const io = req.app.get('socketio');
     io.emit('announcement.created', announcement);
     
     const newNotif = await prisma.notification.create({
        data: {
           familyId,
           title: pinned ? 'Pinned Announcement' : 'New Announcement',
           message: title,
           type: 'announcement',
           targetType: targetType || 'All Members'
        }
     });
     io.emit('notification.created', newNotif);
     
     res.status(201).json(announcement);
  } catch (error) {
     console.error('Announcement Error:', error);
     res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// GET /api/v1/admin/announcements & /api/v1/member/announcements
router.get('/', authenticateToken, async (req, res) => {
  try {
     const familyId = req.user.familyId;
     if (!familyId) return res.json([]); // Return empty if no family

     const announcements = await prisma.announcement.findMany({
        where: { familyId },
        orderBy: [
           { pinned: 'desc' },
           { createdAt: 'desc' }
        ],
        include: {
           author: { select: { firstName: true, lastName: true, avatar: true } }
        }
     });
     res.json(announcements);
  } catch (error) {
     console.error('Announcements Fetch Error:', error);
     res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

module.exports = router;
