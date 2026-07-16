const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

router.use(authMiddleware);

// GET /api/v1/family-history
router.get('/', async (req, res) => {
    try {
        const familyId = req.user.familyId;
        if (!familyId) return res.json([]);
        
        const histories = await prisma.familyHistory.findMany({
            where: { familyId },
            include: { addedBy: { select: { firstName: true, lastName: true } } },
            orderBy: { eventDate: 'desc' }
        });
        
        const cats = {
           'Birth': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
           'Marriage': 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
           'Education': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
           'Reunion': 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
           'Property': 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
           'Achievement': 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
        };

        const timelines = {
           'Birth': 'bg-purple-600',
           'Marriage': 'bg-teal-500',
           'Education': 'bg-blue-500',
           'Reunion': 'bg-purple-600',
           'Property': 'bg-amber-500',
           'Achievement': 'bg-indigo-500'
        };
        
        res.json(histories.map(h => ({
            id: h.id,
            title: h.title,
            subtitle: h.description || '',
            category: h.category,
            catColor: cats[h.category] || 'bg-slate-50 text-slate-600',
            timelineColor: timelines[h.category] || 'bg-slate-600',
            date: new Date(h.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            year: new Date(h.eventDate).getFullYear().toString(),
            members: h.relatedMembers || [], 
            extraMembers: h.relatedMembers && h.relatedMembers.length > 3 ? h.relatedMembers.length - 3 : 0,
            location: h.location || 'Unknown',
            addedBy: `${h.addedBy.firstName} ${h.addedBy.lastName}`.trim(),
            status: h.status,
            thumbnail: h.thumbnailUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=200&q=80'
        })));
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/v1/family-history
router.post('/', async (req, res) => {
    try {
        const { title, category, eventDate, description, related, visibility, status, fileUrl } = req.body;
        const familyId = req.user.familyId;
        
        if (!title || !category || !eventDate || !description) {
            return res.status(400).json({ error: 'Required fields missing' });
        }
        if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

        let relatedArr = [];
        if (related) {
           relatedArr = [`https://ui-avatars.com/api/?name=${encodeURIComponent(related)}&background=random&color=fff`];
        }

        const history = await prisma.familyHistory.create({
            data: {
               title,
               category,
               eventDate: new Date(eventDate),
               description,
               visibility: visibility || 'Family Only',
               status: status || 'Published',
               thumbnailUrl: fileUrl,
               addedById: req.user.userId,
               familyId: familyId,
               relatedMembers: relatedArr
            }
        });
        
        const io = req.app.get('socketio');
        io.emit('history.created', { message: `New Family History Added: ${title}` });
        
        res.status(201).json(history);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create family history' });
    }
});

module.exports = router;
