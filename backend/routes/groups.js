const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ensure basic user fetching if middleware is mocked
const getUserId = async (req) => {
   if (req.user?.id) return req.user.id;
   const u = await prisma.user.findFirst();
   return u.id; 
};

// GET /api/v1/groups
router.get('/', async (req, res) => {
  try {
     // For admins, return all groups. For members, they shouldn't realistically hit this unless admin
     const groups = await prisma.group.findMany({
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
     const userId = await getUserId(req);
     const groups = await prisma.group.findMany({
        where: { members: { some: { userId: userId } } },
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
     const authorId = await getUserId(req);
     const g = await prisma.group.create({
        data: {
           ...req.body,
           ownerId: authorId,
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
     const g = await prisma.group.findUnique({
        where: { id: req.params.id },
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
      const g = await prisma.group.update({ where: { id: req.params.id }, data: req.body });
      res.json(g);
   } catch(e) { res.status(500).json({ error: 'Update failed' }); }
});

router.delete('/:id', async (req, res) => {
   try {
      await prisma.group.delete({ where: { id: req.params.id } });
      res.json({ success: true });
   } catch(e) { res.status(500).json({ error: 'Delete failed' }); }
});

// Members
router.post('/:id/members', async (req, res) => {
   try {
      const { userId, role } = req.body;
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
      const senderId = await getUserId(req);
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
