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

// GET /api/v1/gallery
router.get('/', async (req, res) => {
    try {
        const photos = await prisma.document.findMany({
            where: { type: { startsWith: 'image/' }, visibility: 'FAMILY' }, // Using visibility FAMILY to distinguish gallery photos
            include: { uploader: { select: { firstName: true, lastName: true, avatar: true } } },
            orderBy: { createdAt: 'desc' }
        });
        
        res.json(photos.map(p => ({
            id: p.id,
            url: p.url,
            h: 240 + Math.floor(Math.random() * 160), 
            hearts: 0,
            comments: 0,
            uploader: `${p.uploader.firstName} ${p.uploader.lastName}`.trim(),
            avatar: p.uploader.avatar || `https://i.pravatar.cc/150?u=${p.uploaderId}`,
            tag: p.category || 'Reunion',
            year: new Date(p.createdAt).getFullYear().toString()
        })));
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/v1/gallery
router.post('/', async (req, res) => {
    try {
        const { category, fileUrl, fileName, fileSize, fileType } = req.body;
        const photo = await prisma.document.create({
            data: {
               name: fileName || `Photo_${Date.now()}`,
               type: fileType || 'image/jpeg',
               size: fileSize || '0MB',
               category: category || 'Family',
               url: fileUrl,
               uploaderId: req.user.userId,
               visibility: 'FAMILY',
               status: 'VERIFIED'
            }
        });
        res.status(201).json(photo);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await prisma.document.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
