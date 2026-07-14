const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/v1/admin/polls (Create)
router.post('/', async (req, res) => {
  try {
     const { question, options, endDate } = req.body;
     const authorId = req.user?.id;
     
     if (!question || !options || options.length < 2) {
        return res.status(400).json({ error: 'Question and at least 2 options are required' });
     }

     let author = authorId;
     if (!author) {
        const u = await prisma.user.findFirst();
        author = u.id;
     }

     // Build options array structure: [{id: 1, text: "Opt"}, {id: 2, text: "Opt"}]
     const formattedOptions = options.map((opt, i) => ({ id: i + 1, text: opt }));

     const safeEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 86400000); // default 7 days week

     const poll = await prisma.poll.create({
        data: {
           question,
           options: formattedOptions,
           votes: {},
           endDate: safeEndDate,
           authorId: author
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
router.get('/', async (req, res) => {
  try {
     const polls = await prisma.poll.findMany({
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
router.post('/:id/vote', async (req, res) => {
  try {
     const { optionId } = req.body;
     let userId = req.user?.id;
     
     if (!userId) {
        const u = await prisma.user.findFirst(); // stub auth fallback
        userId = u.id;
     }
     
     const poll = await prisma.poll.findUnique({ where: { id: req.params.id } });
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

module.exports = router;
