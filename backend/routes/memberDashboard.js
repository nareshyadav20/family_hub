const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

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

router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const familyId = req.user.familyId;
        if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

        const today = new Date();
        today.setHours(0,0,0,0);

        // Stats
        const totalMembers = await prisma.user.count({ where: { familyId, status: 'ACTIVE' } });
        const myPhotos = await prisma.document.count({ where: { familyId, type: { startsWith: 'image/' }, uploaderId: userId } });
        
        // Upcoming Events
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const upcomingEventsRaw = await prisma.event.findMany({
            where: { familyId, eventDate: { gte: today } },
            orderBy: { eventDate: 'asc' },
            take: 3
        });
        
        const upcomingEvents = upcomingEventsRaw.map(e => ({
            title: e.name,
            date: new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            location: e.location || 'Online',
            color: '#4F46E5'
        }));

        const eventsThisMonth = await prisma.event.count({
            where: { familyId, eventDate: { gte: today, lt: nextMonth } }
        });

        // Birthdays (Scan profiles)
        const allProfiles = await prisma.memberProfile.findMany({
            where: { user: { familyId }, dob: { not: null } },
            include: { user: { select: { firstName: true, lastName: true, avatar: true } } }
        });
        
        let upcomingBirthdays = [];
        allProfiles.forEach(p => {
             if(p.dob) {
                 const dob = new Date(p.dob);
                 let bdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
                 let diffTime = bdayThisYear.getTime() - today.getTime();
                 let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 
                 if (diffDays < 0) {
                     bdayThisYear.setFullYear(today.getFullYear() + 1);
                     diffTime = bdayThisYear.getTime() - today.getTime();
                     diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 }

                 if (diffDays >= 0 && diffDays <= 30) {
                     upcomingBirthdays.push({
                         name: `${p.user.firstName} ${p.user.lastName}`.trim(),
                         avatar: p.user.avatar || `https://ui-avatars.com/api/?name=${p.user.firstName}&background=random&color=fff`,
                         date: bdayThisYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                         daysLeft: diffDays
                     });
                 }
             }
        });
        upcomingBirthdays.sort((a,b) => a.daysLeft - b.daysLeft);

        // Feed (Combine Gallery & Family History)
        let feedPosts = [];
        
        const galleries = await prisma.document.findMany({
            where: { familyId, type: { startsWith: 'image/' }, visibility: 'FAMILY' },
            include: { uploader: { select: { firstName: true, lastName: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        galleries.forEach(g => {
            feedPosts.push({
                id: 'gal_' + g.id,
                author: `${g.uploader.firstName} ${g.uploader.lastName}`,
                avatar: g.uploader.avatar || `https://ui-avatars.com/api/?name=${g.uploader.firstName}&background=random&color=fff`,
                time: new Date(g.createdAt).toLocaleDateString(),
                timestamp: g.createdAt,
                content: `Uploaded a family memory photo!`,
                image: g.url,
                likes: 0,
                comments: 0,
                type: 'photo'
            });
        });

        const histories = await prisma.familyHistory.findMany({
            where: { familyId },
            include: { addedBy: { select: { firstName: true, lastName: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        histories.forEach(h => {
             feedPosts.push({
                id: 'his_' + h.id,
                author: `${h.addedBy.firstName} ${h.addedBy.lastName}`,
                avatar: h.addedBy.avatar || `https://ui-avatars.com/api/?name=${h.addedBy.firstName}&background=random&color=fff`,
                time: new Date(h.createdAt).toLocaleDateString(),
                timestamp: h.createdAt,
                content: h.description || `Added a new family timeline event: ${h.title}`,
                image: h.thumbnailUrl || null,
                likes: 0,
                comments: 0,
                type: 'memory' 
             });
        });
        
        feedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        feedPosts = feedPosts.slice(0, 10);
        
        const activityData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const nextD = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
            
            const monthName = d.toLocaleString('en-US', { month: 'short' });
            
            const postsCount = await prisma.document.count({
                where: { familyId, type: { startsWith: 'image/' }, createdAt: { gte: d, lt: nextD } }
            });
            const memoriesCount = await prisma.familyHistory.count({
                where: { familyId, createdAt: { gte: d, lt: nextD } }
            });
            activityData.push({ month: monthName, posts: postsCount, memories: memoriesCount });
        }
        
        const newMessagesCount = await prisma.message.count({
            where: {
                receiverId: userId,
                sender: { familyId },
                isRead: false
            }
        });
        
        res.json({
            stats: { familyMembers: totalMembers, myPhotos, eventsThisMonth, newMessages: newMessagesCount },
            upcomingEvents,
            upcomingBirthdays: upcomingBirthdays.slice(0,3),
            feedPosts,
            activityData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
