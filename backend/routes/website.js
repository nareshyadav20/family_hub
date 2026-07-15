const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/v1/website/home
router.get('/home', async (req, res) => {
    try {
        const stats = {
            totalMembers: await prisma.user.count({ where: { status: 'ACTIVE' } }),
            generations: 4, // or calculate dynamically if possible
            countries: 3, 
            photos: await prisma.document.count({ where: { type: { startsWith: 'image/' } } })
        };

        const recentMemories = await prisma.familyHistory.findMany({
            take: 3,
            orderBy: { eventDate: 'desc' },
            include: { addedBy: { select: { firstName: true, lastName: true } } }
        });

        const upcomingEvents = await prisma.event.findMany({
            where: { eventDate: { gte: new Date() }, visibility: 'Public' },
            take: 3,
            orderBy: { eventDate: 'asc' }
        });

        res.json({ stats, memories: recentMemories, upcomingEvents });
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/v1/website/events
router.get('/events', async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            where: { visibility: 'Public' },
            orderBy: { eventDate: 'asc' }
        });
        res.json(events);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/v1/website/stories
router.get('/stories', async (req, res) => {
    try {
        const stories = await prisma.familyHistory.findMany({
            where: { visibility: 'Public', category: { not: 'Property' } },
            orderBy: { eventDate: 'desc' },
            include: { addedBy: { select: { firstName: true, lastName: true, avatar: true } } }
        });
        res.json(stories);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/v1/website/gallery
router.get('/gallery', async (req, res) => {
    try {
        const gallery = await prisma.document.findMany({
            where: { visibility: 'FAMILY', type: { startsWith: 'image/' } },
            orderBy: { createdAt: 'desc' },
            include: { uploader: { select: { firstName: true, lastName: true, avatar: true } } }
        });
        res.json(gallery);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/v1/website/tree
router.get('/tree', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, firstName: true, lastName: true, avatar: true, relationship: true }
        });
        
        // Build a fake tree out of the users for the demo
        if (users.length === 0) return res.json({ id: '1', name: 'No Members', role: 'Root', born: 'N/A', avatar: '', children: [] });

        const rootUser = users[0];
        const treeData = {
           id: rootUser.id,
           name: `${rootUser.firstName} ${rootUser.lastName}`,
           role: rootUser.relationship || 'Patriarch',
           born: '1950', // placeholder
           avatar: rootUser.avatar || `https://ui-avatars.com/api/?name=${rootUser.firstName}`,
           children: users.slice(1).map((u, i) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              role: u.relationship || 'Member',
              born: (1975 + i).toString(),
              avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.firstName}`,
              children: []
           }))
        };

        res.json(treeData);
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
