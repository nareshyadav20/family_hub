const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

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

// POST /api/v1/website/contact
router.post('/contact', async (req, res) => {
    try {
        const { name, phone, email, message } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'Name and Email are required' });
        }
        
        await prisma.supportTicket.create({
            data: {
                family: `${name} (Phone: ${phone || 'N/A'})`,
                subject: `Email: ${email} | Message: ${message || 'Contact Inquiry'}`,
                priority: 'High',
                status: 'Open'
            }
        });
        
        res.json({ success: true, message: 'Contact request submitted successfully!' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to submit contact request' });
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
