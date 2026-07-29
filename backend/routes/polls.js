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

// POST /api/v1/admin/polls (Create)
router.post('/', authenticateToken, async (req, res) => {
  try {
     const { question, options, endDate } = req.body;
     const authorId = req.user.userId;
     const familyId = req.user.familyId;
     
     if (!question || !options || options.length < 2) {
        return res.status(400).json({ error: 'Question and at least 2 options are required' });
     }
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

     // Build options array structure: [{id: 1, text: "Opt"}, {id: 2, text: "Opt"}]
     const formattedOptions = options.map((opt, i) => ({ id: i + 1, text: opt }));

     const safeEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 86400000); // default 7 days week

     const poll = await prisma.poll.create({
        data: {
           question,
           options: formattedOptions,
           votes: {},
           endDate: safeEndDate,
           authorId: authorId,
           familyId: familyId
        },
        include: {
           author: { select: { firstName: true, lastName: true, avatar: true } }
        }
     });

     const io = req.app.get('socketio');
     io.emit('poll.created', poll);
     
     res.status(201).json(poll);
  } catch (error) {
     console.error('Poll Error:', error);
     res.status(500).json({ error: 'Failed to create poll' });
  }
});

// GET /api/v1/admin/polls & /api/v1/member/polls
router.get('/', authenticateToken, async (req, res) => {
  try {
     const familyId = req.user.familyId;
     if (!familyId) return res.json([]);
     
     const polls = await prisma.poll.findMany({
        where: { familyId },
        orderBy: { createdAt: 'desc' },
        include: {
           author: { select: { firstName: true, lastName: true, avatar: true } }
        }
     });
     res.json(polls);
  } catch (error) {
     console.error('Polls Fetch Error:', error);
     res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// POST /api/v1/member/polls/:id/vote
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
     const { optionId } = req.body;
     const userId = req.user.userId;
     const familyId = req.user.familyId;
     
     const poll = await prisma.poll.findUnique({ where: { id: req.params.id, familyId } });
     if (!poll) return res.status(404).json({ error: 'Poll not found' });
     
     const existingVotes = typeof poll.votes === 'object' && poll.votes !== null ? poll.votes : {};
     existingVotes[userId] = optionId;
     
     const updated = await prisma.poll.update({
        where: { id: req.params.id },
        data: { votes: existingVotes },
        include: {
           author: { select: { firstName: true, lastName: true, avatar: true } }
        }
     });
     
     const io = req.app.get('socketio');
     io.emit('poll.updated', updated);

     res.json(updated);
  } catch (error) {
     console.error('Poll Vote Error:', error);
     res.status(500).json({ error: 'Failed to record vote' });
  }
});

// PUT /api/v1/admin/polls/:id (Edit)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
     const { question, options, endDate } = req.body;
     const familyId = req.user.familyId;

     const existingPoll = await prisma.poll.findFirst({ where: { id: req.params.id, familyId } });
     if (!existingPoll) return res.status(404).json({ error: 'Poll not found' });

     let formattedOptions = existingPoll.options;
     if (options && options.length >= 2) {
        formattedOptions = options.map((opt, i) => ({ id: i + 1, text: opt }));
     }

     const updated = await prisma.poll.update({
        where: { id: req.params.id, familyId },
        data: {
           question: question || undefined,
           options: formattedOptions,
           endDate: endDate ? new Date(endDate) : undefined
        },
        include: {
           author: { select: { firstName: true, lastName: true, avatar: true } }
        }
     });

     const io = req.app.get('socketio');
     io.emit('poll.updated', updated);

     res.json(updated);
  } catch (error) {
     console.error('Poll Update Error:', error);
     res.status(500).json({ error: 'Failed to update poll' });
  }
});

// DELETE /api/v1/admin/polls/:id (Delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
     const familyId = req.user.familyId;
     await prisma.poll.delete({
        where: { id: req.params.id, familyId }
     });
     
     const io = req.app.get('socketio');
     io.emit('poll.updated', { id: req.params.id, deleted: true });

     res.json({ success: true });
  } catch (error) {
     console.error('Poll Delete Error:', error);
     res.status(500).json({ error: 'Failed to delete poll' });
  }
});

module.exports = router;
