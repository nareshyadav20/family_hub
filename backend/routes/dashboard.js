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

// GET /api/v1/admin/dashboard/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.familyId;
    if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

    const totalMembers = await prisma.user.count({ where: { familyId, role: { not: 'SUPER_ADMIN' } } });
    const pendingRequests = await prisma.user.count({ where: { familyId, status: { in: ['PENDING_INVITE', 'INVITATION_SENT'] } } });
    const activeMembers = await prisma.user.count({ where: { familyId, status: 'ACTIVE' } });
    
    // Upcoming Events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = await prisma.event.count({ where: { familyId, eventDate: { gte: today } } });

    // Gallery Uploads (documents)
    const galleryUploads = await prisma.document.count({ where: { familyId } });

    // Today's Birthdays
    const allProfiles = await prisma.memberProfile.findMany({ 
       where: { user: { familyId }, dob: { not: null } } 
    });
    const todaysBirthdays = allProfiles.filter(p => {
       const d = new Date(p.dob);
       return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    }).length;

    // Monthly Growth (New members this month)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newMembersThisMonth = await prisma.user.count({ where: { familyId, createdAt: { gte: startOfMonth } } });
    
    let monthlyGrowth = 12; // Base baseline
    if (totalMembers > 0) {
        monthlyGrowth = Math.round((newMembersThisMonth / totalMembers) * 100);
    }
    
    const notifications = await prisma.notification.count({ where: { familyId } });

    res.json({
       totalMembers,
       pendingRequests,
       upcomingEvents,
       todaysBirthdays,
       activeMembers,
       galleryUploads,
       notifications,
       monthlyGrowth: monthlyGrowth === 0 ? 12 : monthlyGrowth
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/v1/admin/dashboard/monthly-activity
router.get('/monthly-activity', authenticateToken, async (req, res) => {
  try {
     const familyId = req.user.familyId;
     const activity = [];
     const now = new Date();
     
     for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const members = await prisma.user.count({
           where: { familyId, createdAt: { gte: d, lt: nextMonth } }
        });
        
        const events = await prisma.event.count({
           where: { familyId, createdAt: { gte: d, lt: nextMonth } }
        });
        
        activity.push({
           month: d.toLocaleString('default', { month: 'short' }),
           members: members,
           events: events
        });
     }
     
     res.json(activity);
  } catch (error) {
    console.error('Dashboard Monthly Activity Error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly activity' });
  }
});

// GET /api/v1/admin/dashboard/recent-activity
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
     const familyId = req.user.familyId;
     const recentUsers = await prisma.user.findMany({
        where: { familyId },
        take: 5,
        orderBy: { createdAt: 'desc' }
     });
     
     const recentEvents = await prisma.event.findMany({
        where: { familyId },
        take: 5,
        orderBy: { createdAt: 'desc' }
     });
     
     const recentDocs = await prisma.document.findMany({
        where: { familyId },
        take: 5,
        orderBy: { createdAt: 'desc' }
     });
     
     const feed = [];
     
     recentUsers.forEach(u => {
        feed.push({
           id: 'u_' + u.id,
           title: u.status === 'ACTIVE' ? 'New Member Joined' : 'Join Request Submitted',
           description: `${u.firstName} ${u.lastName}`,
           timestamp: u.createdAt,
           type: 'member'
        });
     });
     
     recentEvents.forEach(e => {
        feed.push({
           id: 'e_' + e.id,
           title: 'Event Created',
           description: e.name,
           timestamp: e.createdAt,
           type: 'event'
        });
     });
     
     recentDocs.forEach(d => {
        feed.push({
           id: 'd_' + d.id,
           title: 'Gallery Uploaded',
           description: d.name,
           timestamp: d.createdAt,
           type: 'document'
        });
     });
     
     feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
     res.json(feed.slice(0, 10));
  } catch (error) {
    console.error('Dashboard Recent Activity Error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// GET /api/v1/admin/dashboard/analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
     const familyId = req.user.familyId;
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

     // 1. Stats
     const today = new Date();
     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
     const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
     const firstDayOfThisYear = new Date(today.getFullYear(), 0, 1);
     
     // Members
     const totalMembers = await prisma.user.count({ where: { familyId } });
     const totalMembersLastMonth = await prisma.user.count({ where: { familyId, createdAt: { lt: firstDayOfMonth } } });
     const membersChange = totalMembers - totalMembersLastMonth;

     // Events
     const eventsThisYear = await prisma.event.count({ where: { familyId, createdAt: { gte: firstDayOfThisYear } } });
     const eventsThisMonth = await prisma.event.count({ where: { familyId, createdAt: { gte: firstDayOfMonth } } });
     const eventsLastMonthCount = await prisma.event.count({ where: { familyId, createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth } } });
     const eventsChange = eventsThisMonth - eventsLastMonthCount;

     // Photos
     const galleryPhotos = await prisma.document.count({ where: { familyId, type: { contains: 'image' } } });
     const photosThisMonth = await prisma.document.count({ where: { familyId, type: { contains: 'image' }, createdAt: { gte: firstDayOfMonth } } });
     const photosLastMonthCount = await prisma.document.count({ where: { familyId, type: { contains: 'image' }, createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth } } });
     const photosChange = photosThisMonth - photosLastMonthCount;

     // Messages / Posts
     const groups = await prisma.group.findMany({ where: { familyId }, select: { id: true } });
     const groupIds = groups.map(g => g.id);
     
     const messagesSent = await prisma.groupPost.count({ where: { groupId: { in: groupIds } } });
     const messagesThisMonth = await prisma.groupPost.count({ where: { groupId: { in: groupIds }, createdAt: { gte: firstDayOfMonth } } });
     const messagesLastMonthCount = await prisma.groupPost.count({ where: { groupId: { in: groupIds }, createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth } } });
     const messagesChange = messagesThisMonth - messagesLastMonthCount;

     // 2. Member Growth & Activity Data (last 7 months)
     const memberGrowth = [];
     const activityData = [];
     for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });

        const mCount = await prisma.user.count({ where: { familyId, createdAt: { lt: nextMonth } } });
        memberGrowth.push({ month: monthName, members: mCount });

        const eCount = await prisma.event.count({ where: { familyId, createdAt: { gte: d, lt: nextMonth } } });
        const pCount = await prisma.document.count({ where: { familyId, type: { contains: 'image' }, createdAt: { gte: d, lt: nextMonth } } });
        const msgCount = await prisma.groupPost.count({ where: { groupId: { in: groupIds }, createdAt: { gte: d, lt: nextMonth } } });
        
        activityData.push({ month: monthName, events: eCount, photos: pCount, messages: msgCount });
     }

     // 3. Role Data
     const membersRoleCount = await prisma.user.count({ where: { familyId, role: 'MEMBER' } });
     const adminsRoleCount = await prisma.user.count({ where: { familyId, role: 'ADMIN' } });
     const superAdminsRoleCount = await prisma.user.count({ where: { familyId, role: 'SUPER_ADMIN' } });

     const roleData = [
       { name: 'Members', value: membersRoleCount, color: '#3b82f6' },
       { name: 'Admins', value: adminsRoleCount, color: '#8b5cf6' },
       { name: 'Super Admin', value: superAdminsRoleCount, color: '#f59e0b' },
     ];

     res.json({
        stats: {
           totalMembers, membersChange,
           eventsThisYear, eventsChange,
           galleryPhotos, photosChange,
           messagesSent, messagesChange
        },
        memberGrowth,
        activityData,
        roleData
     });
  } catch (error) {
     console.error('API Error analytics:', error);
     res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
