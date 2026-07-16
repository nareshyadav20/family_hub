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

// GET /api/v1/groups
router.get('/', async (req, res) => {
  try {
     const familyId = req.user.familyId;
     if (!familyId) return res.json([]);
     
     const groups = await prisma.group.findMany({
        where: { familyId },
        include: { _count: { select: { members: true } } },
        orderBy: { createdAt: 'desc' }
     });
     res.json(groups);
  } catch (error) {
     res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// GET /api/v1/groups/my-groups (Member Portal Only)
router.get('/my-groups', async (req, res) => {
  try {
     const userId = req.user.userId;
     const familyId = req.user.familyId;
     
     const groups = await prisma.group.findMany({
        where: { familyId, members: { some: { userId: userId } } },
        include: { _count: { select: { members: true } } },
        orderBy: { createdAt: 'desc' }
     });
     res.json(groups);
  } catch (error) {
     res.status(500).json({ error: 'Failed to fetch your groups' });
  }
});

// POST /api/v1/groups
router.post('/', async (req, res) => {
  try {
     const authorId = req.user.userId;
     const familyId = req.user.familyId;
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

     const g = await prisma.group.create({
        data: {
           ...req.body,
           ownerId: authorId,
           familyId: familyId,
           members: {
              create: {
                 userId: authorId,
                 role: 'Admin'
              }
           }
        },
        include: { _count: { select: { members: true } } }
     });
     res.status(201).json(g);
  } catch (error) {
     console.error(error);
     res.status(500).json({ error: 'Failed to create group' });
  }
});

// GET /api/v1/groups/:id
router.get('/:id', async (req, res) => {
  try {
     const familyId = req.user.familyId;
     const g = await prisma.group.findUnique({
        where: { id: req.params.id, familyId },
        include: {
           members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
           _count: { select: { messages: true } }
        }
     });
     if (!g) return res.status(404).json({ error: 'Not found' });
     res.json(g);
  } catch(e) {
     res.status(500).json({ error: 'Failed to fetch' });
  }
});

// PUT & DELETE /api/v1/groups/:id
router.put('/:id', async (req, res) => {
   try {
      const familyId = req.user.familyId;
      const g = await prisma.group.update({ where: { id: req.params.id, familyId }, data: req.body });
      res.json(g);
   } catch(e) { res.status(500).json({ error: 'Update failed' }); }
});

router.delete('/:id', async (req, res) => {
   try {
      const familyId = req.user.familyId;
      await prisma.group.delete({ where: { id: req.params.id, familyId } });
      res.json({ success: true });
   } catch(e) { res.status(500).json({ error: 'Delete failed' }); }
});

// Members
router.post('/:id/members', async (req, res) => {
   try {
      const { userId, role } = req.body;
      const familyId = req.user.familyId;
      
      const groupCheck = await prisma.group.findUnique({ where: { id: req.params.id, familyId }});
      if (!groupCheck) return res.status(404).json({ error: 'Group belongs to another family' });

      const mem = await prisma.groupMember.create({
         data: { groupId: req.params.id, userId, role: role || 'Member' }
      });
      res.status(201).json(mem);
   } catch(e) { res.status(500).json({ error: 'Add member failed' }); }
});

router.delete('/:id/members/:memberId', async (req, res) => {
   try {
      await prisma.groupMember.deleteMany({
         where: { groupId: req.params.id, userId: req.params.memberId }
      });
      res.json({ success: true });
   } catch(e) { res.status(500).json({ error: 'Remove failed' }); }
});

// Messages
router.get('/:id/messages', async (req, res) => {
   try {
      const familyId = req.user.familyId;
      const groupCheck = await prisma.group.findUnique({ where: { id: req.params.id, familyId }});
      if (!groupCheck) return res.status(404).json({ error: 'Not found' });

      const msgs = await prisma.groupMessage.findMany({
         where: { groupId: req.params.id },
         include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
         orderBy: { createdAt: 'desc' },
         take: 100
      });
      res.json(msgs);
   } catch (error) { res.status(500).json({ error: 'Messages fetch failed' }); }
});

router.post('/:id/messages', async (req, res) => {
   try {
      const { content, type, fileUrl, fileName } = req.body;
      const senderId = req.user.userId;
      const familyId = req.user.familyId;

      const groupCheck = await prisma.group.findUnique({ where: { id: req.params.id, familyId }});
      if (!groupCheck) return res.status(404).json({ error: 'Not found' });

      const msg = await prisma.groupMessage.create({
         data: { groupId: req.params.id, senderId, content, type: type || 'Text', fileUrl, fileName },
         include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
      });
      const io = req.app.get('socketio');
      io.emit(`group.${req.params.id}.message`, msg);
      res.status(201).json(msg);
   } catch(e) { res.status(500).json({ error: 'Failed to send message' }); }
});

module.exports = router;
