const express = require('express');
const router = express.Router();

// GET /api/v1/website/home
router.get('/home', async (req, res) => {
    try {
        const stats = {
            totalMembers: 450,
            generations: 4, 
            countries: 3, 
            photos: 1205
        };

        const recentMemories = [];
        const upcomingEvents = [];

        res.json({ stats, memories: recentMemories, upcomingEvents });
    } catch (e) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/v1/website/events
router.get('/events', async (req, res) => {
    res.json([]);
});

// GET /api/v1/website/stories
router.get('/stories', async (req, res) => {
    res.json([]);
});

// GET /api/v1/website/gallery
router.get('/gallery', async (req, res) => {
    res.json([]);
});

// GET /api/v1/website/tree
router.get('/tree', async (req, res) => {
    const treeData = {
        id: '1', name: 'Demo Family Patriarch', role: 'Patriarch', born: '1950', avatar: '', children: []
    };
    res.json(treeData);
});

module.exports = router;
