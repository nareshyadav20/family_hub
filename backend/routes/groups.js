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
     const { role, familyId } = req.user;
     
     let whereClause = {};
     if (role !== 'SUPER_ADMIN') {
        if (!familyId) return res.json([]);
        whereClause.familyId = familyId;
     }
     
     const groups = await prisma.group.findMany({
        where: whereClause,
        include: { 
          _count: { select: { members: true, posts: true } },
          members: {
            where: { userId: req.user.userId }
          }
        },
        orderBy: { createdAt: 'desc' }
     });
     res.json(groups);
  } catch (error) {
     res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// POST /api/v1/groups/my-groups
router.get('/my-groups', async (req, res) => {
  try {
     const userId = req.user.userId;
     const familyId = req.user.familyId;
     if (!familyId) return res.json([]);
     
     const groups = await prisma.group.findMany({
        where: { familyId, members: { some: { userId: userId } } },
        include: { _count: { select: { members: true, posts: true } } },
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
     if (req.user.role === 'MEMBER') return res.status(403).json({ error: 'Members cannot create groups' });
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
     res.status(500).json({ error: 'Failed to create group' });
  }
});

// GET /api/v1/groups/:id
router.get('/:id', async (req, res) => {
  try {
     const { role, familyId } = req.user;
     
     let whereClause = { id: req.params.id };
     if (role !== 'SUPER_ADMIN') {
        whereClause.familyId = familyId;
     }

     const g = await prisma.group.findUnique({
        where: whereClause,
        include: {
           members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } } },
           _count: { select: { posts: true, members: true } }
        }
     });
     if (!g) return res.status(404).json({ error: 'Group not found' });
     res.json(g);
  } catch(e) {
     res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// PUT /api/v1/groups/:id
router.put('/:id', async (req, res) => {
   try {
      if (req.user.role === 'MEMBER') return res.status(403).json({ error: 'Access denied' });
      const familyId = req.user.familyId;
      const g = await prisma.group.update({ where: { id: req.params.id, familyId }, data: req.body });
      res.json(g);
   } catch(e) { res.status(500).json({ error: 'Update failed' }); }
});

// DELETE /api/v1/groups/:id
router.delete('/:id', async (req, res) => {
   try {
      if (req.user.role === 'MEMBER') return res.status(403).json({ error: 'Access denied' });
      const familyId = req.user.familyId;
      await prisma.group.delete({ where: { id: req.params.id, familyId } });
      res.json({ success: true });
   } catch(e) { res.status(500).json({ error: 'Delete failed' }); }
});

// JOIN GROUP
router.post('/:id/join', async (req, res) => {
   try {
      const familyId = req.user.familyId;
      const userId = req.user.userId;
      
      const groupCheck = await prisma.group.findUnique({ where: { id: req.params.id, familyId }});
      if (!groupCheck) return res.status(404).json({ error: 'Group not found in your family' });

      // check if already joined
      const existing = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: req.params.id, userId } } });
      if (existing) return res.status(400).json({ error: 'Already a member' });

      const mem = await prisma.groupMember.create({
         data: { groupId: req.params.id, userId, role: 'Member' }
      });
      
      const io = req.app.get('socketio');
      io.emit(`group.${req.params.id}.member_joined`, { userId });

      res.status(201).json(mem);
   } catch(e) { res.status(500).json({ error: 'Join failed' }); }
});

// POSTS / DISCUSSIONS
router.get('/:id/posts', async (req, res) => {
   try {
      const { role, familyId } = req.user;
      let whereGroup = { id: req.params.id };
      if (role !== 'SUPER_ADMIN') whereGroup.familyId = familyId;

      const groupCheck = await prisma.group.findUnique({ where: whereGroup });
      if (!groupCheck) return res.status(404).json({ error: 'Not found' });

      const posts = await prisma.groupPost.findMany({
         where: { groupId: req.params.id },
         include: { 
            author: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
            _count: { select: { likes: true, comments: true } },
            likes: { where: { userId: req.user.userId }, select: { id: true } },
            comments: {
               include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
               orderBy: { createdAt: 'asc' }
            }
         },
         orderBy: { createdAt: 'desc' }
      });
      res.json(posts);
   } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/:id/posts', async (req, res) => {
   try {
      const { content, attachments } = req.body;
      const authorId = req.user.userId;
      const familyId = req.user.familyId;

      const groupCheck = await prisma.group.findUnique({ where: { id: req.params.id, familyId }});
      if (!groupCheck) return res.status(404).json({ error: 'Not found' });

      // allow if super admin, or if member of family (we verified family above)
      const post = await prisma.groupPost.create({
         data: { groupId: req.params.id, authorId, content, attachments },
         include: { 
            author: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
            _count: { select: { likes: true, comments: true } },
            likes: true, comments: true
         }
      });
      const io = req.app.get('socketio');
      io.emit(`group.${req.params.id}.post_created`, post);
      res.status(201).json(post);
   } catch(e) { res.status(500).json({ error: 'Failed to create post' }); }
});

router.put('/posts/:postId', async (req, res) => {
   try {
      const { content, attachments } = req.body;
      const authorId = req.user.userId;
      
      const postCheck = await prisma.groupPost.findUnique({ where: { id: req.params.postId } });
      if (!postCheck) return res.status(404).json({ error: 'Not found' });
      
      if (postCheck.authorId !== authorId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
         return res.status(403).json({ error: 'Unauthorized to edit' });
      }

      const post = await prisma.groupPost.update({
         where: { id: req.params.postId },
         data: { content, attachments },
         include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } }
      });
      
      const io = req.app.get('socketio');
      io.emit(`group.${post.groupId}.post_updated`, post);
      res.json(post);
   } catch(e) { res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/posts/:postId', async (req, res) => {
   try {
      const authorId = req.user.userId;
      
      const postCheck = await prisma.groupPost.findUnique({ where: { id: req.params.postId } });
      if (!postCheck) return res.status(404).json({ error: 'Not found' });
      
      if (postCheck.authorId !== authorId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
         return res.status(403).json({ error: 'Unauthorized to delete' });
      }

      await prisma.groupPost.delete({ where: { id: req.params.postId } });
      
      const io = req.app.get('socketio');
      io.emit(`group.${postCheck.groupId}.post_deleted`, { postId: req.params.postId });
      res.json({ success: true });
   } catch(e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// LIKE / COMMENT POSTS
router.post('/posts/:postId/like', async (req, res) => {
   try {
      const userId = req.user.userId;
      const existing = await prisma.groupPostLike.findUnique({ where: { postId_userId: { postId: req.params.postId, userId } } });
      
      if (existing) {
         await prisma.groupPostLike.delete({ where: { id: existing.id } });
         res.json({ liked: false });
      } else {
         await prisma.groupPostLike.create({ data: { postId: req.params.postId, userId } });
         res.json({ liked: true });
      }
      const post = await prisma.groupPost.findUnique({ where: { id: req.params.postId } });
      if(post) {
         const io = req.app.get('socketio');
         io.emit(`group.${post.groupId}.post_changed`, { postId: req.params.postId });
      }
   } catch(e) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/posts/:postId/comment', async (req, res) => {
   try {
      const { content } = req.body;
      const authorId = req.user.userId;
      
      const comment = await prisma.groupPostComment.create({
         data: { postId: req.params.postId, authorId, content },
         include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
      });
      
      const post = await prisma.groupPost.findUnique({ where: { id: req.params.postId } });
      if(post) {
         const io = req.app.get('socketio');
         io.emit(`group.${post.groupId}.post_changed`, { postId: req.params.postId });
      }
      res.json(comment);
   } catch(e) { res.status(500).json({ error: 'Failed to comment' }); }
});

module.exports = router;
