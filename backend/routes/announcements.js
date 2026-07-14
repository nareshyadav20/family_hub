const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/v1/admin/announcements
router.post('/', async (req, res) => {
  try {
     const { title, message, targetType, pinned } = req.body;
     const authorId = req.user?.id;
     
     if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
     }
     
     // Fallback to first user if auth fails setup (development)
     let author = authorId;
     if (!author) {
        const u = await prisma.user.findFirst();
        author = u.id;
     }

     const announcement = await prisma.announcement.create({
        data: {
           title,
           message,
           targetType: targetType || 'All Members',
           pinned: !!pinned,
           authorId: author
        },
        include: {
           author: { select: { firstName: true, lastName: true, avatar: true } }
        }
     });

     const io = req.app.get('socketio');
     io.emit('announcement.created', announcement);
     if (pinned) {
        io.emit('notification.created', { message: `Pinned Announcement: ${title}` });
     }
     
     res.status(201).json(announcement);
  } catch (error) {
     console.error('Announcement Error:', error);
     res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// GET /api/v1/admin/announcements & /api/v1/member/announcements
router.get('/', async (req, res) => {
  try {
     const announcements = await prisma.announcement.findMany({
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
