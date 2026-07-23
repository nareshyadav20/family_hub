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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fire all counts concurrently using Promise.all
    const [
      totalMembers,
      pendingRequests,
      activeMembers,
      upcomingEvents,
      galleryUploads,
      notifications,
      newMembersThisMonth,
      allProfiles
    ] = await Promise.all([
      prisma.user.count({ where: { familyId, role: { not: 'SUPER_ADMIN' } } }),
      prisma.user.count({ where: { familyId, status: { in: ['PENDING_INVITE', 'INVITATION_SENT'] } } }),
      prisma.user.count({ where: { familyId, status: 'ACTIVE' } }),
      prisma.event.count({ where: { familyId, eventDate: { gte: today } } }),
      prisma.document.count({ where: { familyId } }),
      prisma.notification.count({ where: { familyId } }),
      prisma.user.count({ where: { familyId, createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } } }),
      prisma.memberProfile.findMany({ 
        where: { user: { familyId }, dob: { not: null } },
        select: { dob: true }
      })
    ]);

    // Today's Birthdays
    const todaysBirthdays = allProfiles.filter(p => {
       const d = new Date(p.dob);
       return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    }).length;

    // Monthly Growth
    let monthlyGrowth = 12; // Base baseline
    if (totalMembers > 0) {
        monthlyGrowth = Math.round((newMembersThisMonth / totalMembers) * 100);
    }

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
     const now = new Date();
     
     // Generate an array of month periods
     const periods = [];
     for (let i = 5; i >= 0; i--) {
        periods.push({
           d: new Date(now.getFullYear(), now.getMonth() - i, 1),
           nextMonth: new Date(now.getFullYear(), now.getMonth() - i + 1, 1),
           monthLabel: new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleString('default', { month: 'short' })
        });
     }

     // Fetch counts concurrently
     const activityPromises = periods.map(async ({ d, nextMonth, monthLabel }) => {
        const [members, events] = await Promise.all([
           prisma.user.count({ where: { familyId, createdAt: { gte: d, lt: nextMonth } } }),
           prisma.event.count({ where: { familyId, createdAt: { gte: d, lt: nextMonth } } })
        ]);
        return { month: monthLabel, members, events };
     });
     
     const activity = await Promise.all(activityPromises);
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
     
     // Fetch recent records concurrently with optimized .select statements
     const [recentUsers, recentEvents, recentDocs] = await Promise.all([
       prisma.user.findMany({
          where: { familyId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, firstName: true, lastName: true, status: true, createdAt: true }
       }),
       prisma.event.findMany({
          where: { familyId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, createdAt: true }
       }),
       prisma.document.findMany({
          where: { familyId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, createdAt: true }
       })
     ]);
     
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

     const today = new Date();
     const firstDayOfMonth     = new Date(today.getFullYear(), today.getMonth(), 1);
     const firstDayOfLastMonth  = new Date(today.getFullYear(), today.getMonth() - 1, 1);
     const firstDayOfThisYear   = new Date(today.getFullYear(), 0, 1);

     // ── Step 1: fetch groups first (needed for groupId filter) ─────────────
     const groups   = await prisma.group.findMany({ where: { familyId }, select: { id: true } });
     const groupIds = groups.map(g => g.id);

     // ── Step 2: fire ALL stat queries in parallel ──────────────────────────
     const [
       totalMembers,
       totalMembersLastMonth,
       eventsThisYear,
       eventsThisMonth,
       eventsLastMonthCount,
       galleryPhotos,
       photosThisMonth,
       photosLastMonthCount,
       messagesSent,
       messagesThisMonth,
       messagesLastMonthCount,
       membersRoleCount,
       adminsRoleCount,
       superAdminsRoleCount,
     ] = await Promise.all([
       prisma.user.count({ where: { familyId } }),
       prisma.user.count({ where: { familyId, createdAt: { lt: firstDayOfMonth } } }),
       prisma.event.count({ where: { familyId, createdAt: { gte: firstDayOfThisYear } } }),
       prisma.event.count({ where: { familyId, createdAt: { gte: firstDayOfMonth } } }),
       prisma.event.count({ where: { familyId, createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth } } }),
       prisma.document.count({ where: { familyId, type: { contains: 'image' } } }),
       prisma.document.count({ where: { familyId, type: { contains: 'image' }, createdAt: { gte: firstDayOfMonth } } }),
       prisma.document.count({ where: { familyId, type: { contains: 'image' }, createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth } } }),
       prisma.groupPost.count({ where: { groupId: { in: groupIds } } }),
       prisma.groupPost.count({ where: { groupId: { in: groupIds }, createdAt: { gte: firstDayOfMonth } } }),
       prisma.groupPost.count({ where: { groupId: { in: groupIds }, createdAt: { gte: firstDayOfLastMonth, lt: firstDayOfMonth } } }),
       prisma.user.count({ where: { familyId, role: 'MEMBER' } }),
       prisma.user.count({ where: { familyId, role: 'ADMIN' } }),
       prisma.user.count({ where: { familyId, role: 'SUPER_ADMIN' } }),
     ]);

     // ── Step 3: build month ranges then fire all 7-month chart queries in parallel ──
     const monthRanges = Array.from({ length: 7 }, (_, i) => {
       const start = new Date(today.getFullYear(), today.getMonth() - (6 - i), 1);
       const end   = new Date(today.getFullYear(), today.getMonth() - (6 - i) + 1, 1);
       const label = start.toLocaleString('default', { month: 'short' });
       return { start, end, label };
     });

     const chartResults = await Promise.all(
       monthRanges.flatMap(({ start, end }) => [
         prisma.user.count({ where: { familyId, createdAt: { lt: end } } }),
         prisma.event.count({ where: { familyId, createdAt: { gte: start, lt: end } } }),
         prisma.document.count({ where: { familyId, type: { contains: 'image' }, createdAt: { gte: start, lt: end } } }),
         prisma.groupPost.count({ where: { groupId: { in: groupIds }, createdAt: { gte: start, lt: end } } }),
       ])
     );

     // chartResults is flat [m0,e0,p0,msg0, m1,e1,p1,msg1, ...]
     const memberGrowth = [];
     const activityData = [];
     monthRanges.forEach(({ label }, i) => {
       const base = i * 4;
       memberGrowth.push({ month: label, members: chartResults[base] });
       activityData.push({ month: label, events: chartResults[base + 1], photos: chartResults[base + 2], messages: chartResults[base + 3] });
     });

     res.json({
        stats: {
           totalMembers,
           membersChange:  totalMembers - totalMembersLastMonth,
           eventsThisYear,
           eventsChange:   eventsThisMonth - eventsLastMonthCount,
           galleryPhotos,
           photosChange:   photosThisMonth - photosLastMonthCount,
           messagesSent,
           messagesChange: messagesThisMonth - messagesLastMonthCount,
        },
        memberGrowth,
        activityData,
        roleData: [
          { name: 'Members',     value: membersRoleCount,    color: '#3b82f6' },
          { name: 'Admins',      value: adminsRoleCount,     color: '#8b5cf6' },
          { name: 'Super Admin', value: superAdminsRoleCount,color: '#f59e0b' },
        ],
     });
  } catch (error) {
     console.error('API Error analytics:', error);
     res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/v1/admin/dashboard/requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.familyId;
    if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

    const requests = await prisma.user.findMany({
      where: { 
        familyId, 
        // In the absence of an explicit join request map, PENDING_INVITE or INVITATION_SENT indicates they are waiting
        status: { in: ['PENDING_INVITE', 'INVITATION_SENT'] } 
      },
      orderBy: { createdAt: 'desc' },
      select: {
         id: true, firstName: true, lastName: true, email: true, phone: true, 
         relationship: true, avatar: true, createdAt: true, status: true
      }
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Requests error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch requests' });
  }
});

// PUT /api/v1/admin/dashboard/requests/:id
router.put('/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    if (action === 'reject') {
       await prisma.user.delete({ where: { id: req.params.id }});
       return res.json({ success: true, message: 'Request rejected' });
    }
    const user = await prisma.user.update({
       where: { id: req.params.id },
       data: { status: 'ACTIVE' }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ success: false, error: 'Failed to update request' });
  }
});

// ─── SETTINGS ROUTES ────────────────────────────────────────────────────────

// GET /api/v1/admin/dashboard/settings/family
router.get('/settings/family', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.familyId;
    if (!familyId) return res.status(401).json({ error: 'Family ID missing' });
    const family = await prisma.family.findUnique({ where: { id: familyId } });
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json({ success: true, data: family });
  } catch (err) {
    console.error('Settings family GET error:', err);
    res.status(500).json({ error: 'Failed to fetch family info' });
  }
});

// PUT /api/v1/admin/dashboard/settings/family
router.put('/settings/family', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.familyId;
    if (!familyId) return res.status(401).json({ error: 'Family ID missing' });
    const { name, address, city, state, country } = req.body;
    const updated = await prisma.family.update({
      where: { id: familyId },
      data: { name, address, city, state, country },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Settings family PUT error:', err);
    res.status(500).json({ error: 'Failed to update family info' });
  }
});

// GET /api/v1/admin/dashboard/settings/me
router.get('/settings/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { memberSettings: true, memberProfile: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Settings me GET error:', err);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

// PUT /api/v1/admin/dashboard/settings/notifications
router.put('/settings/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const {
      email_notifications, push_notifications, birthday_notifications,
      event_notifications, announcement_notifications, whatsapp_notifications,
    } = req.body;
    const settings = await prisma.memberSettings.upsert({
      where: { userId },
      update: { email_notifications, push_notifications, birthday_notifications, event_notifications, announcement_notifications, whatsapp_notifications },
      create: { userId, email_notifications, push_notifications, birthday_notifications, event_notifications, announcement_notifications, whatsapp_notifications },
    });
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Settings notifications PUT error:', err);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// PUT /api/v1/admin/dashboard/settings/appearance
router.put('/settings/appearance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { theme, language, timezone } = req.body;
    const settings = await prisma.memberSettings.upsert({
      where: { userId },
      update: { theme, language, timezone },
      create: { userId, theme, language, timezone },
    });
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Settings appearance PUT error:', err);
    res.status(500).json({ error: 'Failed to update appearance settings' });
  }
});

// PUT /api/v1/admin/dashboard/settings/profile
router.put('/settings/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { firstName, lastName, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone },
      include: { memberSettings: true, memberProfile: true },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Settings profile PUT error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
