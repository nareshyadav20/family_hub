const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { sendFamilyAdminEmail } = require('../services/emailService');
const fs = require('fs');
const path = require('path');
const PLANS_FILE = path.join(__dirname, '../plans.json');

// Create a new family & admin
router.post('/families', async (req, res) => {
  const { familyName, familyCode, familyHead, adminName, adminMobile, adminEmail, adminPassword, plan, status, address, city, state, country } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Admin email already exists' });
    }

    // Auto generate code if not provided
    const code = familyCode || 'FAM' + Math.floor(1000 + Math.random() * 9000);

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      // Create Family
      const family = await tx.family.create({
        data: {
          name: familyName,
          familyCode: code,
          familyHead,
          plan: plan || 'Free',
          status: status || 'Active',
          address, city, state, country,
          createdBy: 'SUPER_ADMIN',
        }
      });

      // Split admin name
      const nameParts = adminName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // Create Admin
      const admin = await tx.user.create({
        data: {
          firstName,
          lastName,
          email: adminEmail,
          phone: adminMobile,
          password: hashedPassword,
          role: 'ADMIN', // Wait, earlier schema says role ADMIN for family admin
          familyId: family.id,
          isTemporaryPassword: true,
          mustChangePassword: true,
          status: 'ACTIVE'
        }
      });

      return { family, admin };
    });

    // Send Brevo Email
    let emailSent = false;
    try {
      const emailResult = await sendFamilyAdminEmail(adminName, adminEmail, familyName, result.family.familyCode, adminPassword);
      if (emailResult.success) {
        emailSent = true;
      }
    } catch (err) {
      console.error(err);
    }

    res.status(201).json({ success: true, data: result.family, emailSent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Resend credentials
router.post('/families/resend-email', async (req, res) => {
  const { familyId } = req.body;
  try {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: { members: { where: { role: 'ADMIN' } } }
    });

    if (!family || !family.members || family.members.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found for this family' });
    }

    const admin = family.members[0];
    
    // Generate new temporary password
    const crypto = require('crypto');
    const newTempPassword = crypto.randomBytes(4).toString('hex') + 'A1!';
    const hashedPassword = await bcrypt.hash(newTempPassword, 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        isTemporaryPassword: true,
        mustChangePassword: true
      }
    });

    const emailResult = await sendFamilyAdminEmail(
      admin.firstName + ' ' + (admin.lastName || ''),
      admin.email,
      family.name,
      family.familyCode,
      newTempPassword,
      true
    );

    if (emailResult.success) {
      res.json({ success: true, message: 'Credentials sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send credentials email' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all families
router.get('/families', async (req, res) => {
  try {
    const families = await prisma.family.findMany({
      include: {
        members: {
          where: { role: 'ADMIN' }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map data for Super Admin Data Table
    const formatted = families.map(f => {
      const admin = f.members[0];
      return {
        id: f.id,
        name: f.name,
        code: f.familyCode || 'N/A',
        head: f.familyHead || 'N/A',
        admin: admin ? `${admin.firstName} ${admin.lastName}` : 'N/A',
        email: admin ? admin.email : 'N/A',
        phone: admin ? admin.phone : 'N/A',
        plan: f.plan,
        members: f._count.members,
        storage: '0 GB', // Mock for now until storage system is connected
        date: f.createdAt.toISOString().split('T')[0],
        status: f.status
      };
    });
    
    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get specific family details
router.get('/families/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        members: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, status: true, createdAt: true, lastEmailAttempt: true }
        },
        events: {
          select: { id: true, name: true, eventDate: true, visibility: true, status: true, createdBy: true }
        },
        documents: {
          select: { id: true, name: true, type: true, size: true, visibility: true, createdAt: true }
        },
        familyHistories: {
          select: { id: true, title: true, category: true, eventDate: true, visibility: true }
        }
      }
    });

    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    const totalMembers = family.members.length;
    const totalAdmins = family.members.filter(m => m.role === 'ADMIN').length;

    res.json({
      success: true,
      data: {
        id: family.id,
        name: family.name,
        code: family.familyCode || 'N/A',
        status: family.status,
        plan: family.plan || 'Free Plan',
        createdAt: family.createdAt,
        totalMembers,
        totalAdmins,
        storageUsed: '0 GB / 100 GB',
        members: family.members,
        events: family.events,
        documents: family.documents,
        familyHistories: family.familyHistories
      }
    });
  } catch (error) {
    console.error('Error fetching family details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Dashboard Stats for Super Admin
router.get('/dashboard/stats', async (req, res) => {
  try {
    const totalFamilies = await prisma.family.count();
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const totalMembers = await prisma.user.count({ where: { role: 'MEMBER' } });

    // Mock other values for now
    const kpis = {
      totalFamilies,
      totalAdmins,
      totalMembers,
      monthlyRevenue: '$42,500',
      activeSubscriptions: 984,
      storageUsage: '842 GB',
      apiRequests: '1.2M',
      platformHealth: '99.9%'
    };

    const growthData = [
      { name: 'Jan', families: Math.floor(totalFamilies * 0.4), members: Math.floor(totalMembers * 0.4) },
      { name: 'Feb', families: Math.floor(totalFamilies * 0.5), members: Math.floor(totalMembers * 0.5) },
      { name: 'Mar', families: Math.floor(totalFamilies * 0.6), members: Math.floor(totalMembers * 0.6) },
      { name: 'Apr', families: Math.floor(totalFamilies * 0.7), members: Math.floor(totalMembers * 0.7) },
      { name: 'May', families: Math.floor(totalFamilies * 0.8), members: Math.floor(totalMembers * 0.8) },
      { name: 'Jun', families: Math.floor(totalFamilies * 0.9), members: Math.floor(totalMembers * 0.9) },
      { name: 'Jul', families: Math.max(totalFamilies, 1), members: Math.max(totalMembers, 1) },
    ];

    const revenueData = [
      { name: 'Mon', revenue: 4000 },
      { name: 'Tue', revenue: 3000 },
      { name: 'Wed', revenue: 2000 },
      { name: 'Thu', revenue: 2780 },
      { name: 'Fri', revenue: 1890 },
      { name: 'Sat', revenue: 2390 },
      { name: 'Sun', revenue: 3490 },
    ];

    const recentActivity = [
      { id: 1, type: 'registration', title: 'System Data Sync', desc: 'Loaded real backend stats', time: 'Just now', user: 'SYS' },
      { id: 2, type: 'alert', title: 'Admin Sync', desc: `Found ${totalAdmins} admins`, time: '1 min ago', user: 'SYS' }
    ];

    res.json({ success: true, data: { kpis, growthData, revenueData, recentActivity } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Plans and calculate active families per plan
router.get('/subscriptions/plans', async (req, res) => {
  try {
    let plansData = [];
    if (fs.existsSync(PLANS_FILE)) {
      plansData = JSON.parse(fs.readFileSync(PLANS_FILE, 'utf-8'));
    }

    // Determine counts from database
    const familyCounts = await prisma.family.groupBy({
      by: ['plan'],
      _count: { id: true }
    });

    const countsMap = {};
    for (const row of familyCounts) {
      if (row.plan) {
        countsMap[row.plan.toLowerCase()] = row._count.id;
      }
    }

    // Merge counts into plans API response
    const enrichedPlans = plansData.map(plan => {
      const activeFamilies = countsMap[(plan.dbName || plan.name).toLowerCase()] || 0;
      return { ...plan, families: activeFamilies };
    });

    res.json({ success: true, data: enrichedPlans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching plans' });
  }
});

// Add new Plan
router.post('/subscriptions/plans', async (req, res) => {
  try {
    let plansData = [];
    if (fs.existsSync(PLANS_FILE)) {
      plansData = JSON.parse(fs.readFileSync(PLANS_FILE, 'utf-8'));
    }
    
    const newPlan = {
      id: req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: req.body.name,
      dbName: req.body.dbName || req.body.name,
      price: req.body.price || 'Free',
      storage: req.body.storage || '0 GB',
      features: req.body.features || 'Basic features',
      status: req.body.status || 'Active'
    };
    
    plansData.push(newPlan);
    fs.writeFileSync(PLANS_FILE, JSON.stringify(plansData, null, 2));
    
    res.json({ success: true, data: newPlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error creating plan' });
  }
});

// Update Plan details
router.put('/subscriptions/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dbName, price, storage, features, status } = req.body;

    let plansData = [];
    if (fs.existsSync(PLANS_FILE)) {
      plansData = JSON.parse(fs.readFileSync(PLANS_FILE, 'utf-8'));
    }

    const planIndex = plansData.findIndex(p => p.id === id);
    if (planIndex >= 0) {
      plansData[planIndex] = { 
        ...plansData[planIndex], 
        name: name || plansData[planIndex].name, 
        dbName: dbName !== undefined ? dbName : plansData[planIndex].dbName,
        price: price !== undefined ? price : plansData[planIndex].price, 
        storage: storage !== undefined ? storage : plansData[planIndex].storage, 
        features: features !== undefined ? features : plansData[planIndex].features,
        status: status !== undefined ? status : plansData[planIndex].status 
      };
      fs.writeFileSync(PLANS_FILE, JSON.stringify(plansData, null, 2));
      res.json({ success: true, data: plansData[planIndex] });
    } else {
      res.status(404).json({ success: false, message: 'Plan not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error updating plan' });
  }
});

// Delete a Plan
router.delete('/subscriptions/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let plansData = [];
    if (fs.existsSync(PLANS_FILE)) {
      plansData = JSON.parse(fs.readFileSync(PLANS_FILE, 'utf-8'));
    }

    const initialLength = plansData.length;
    plansData = plansData.filter(p => p.id !== id);

    if (plansData.length < initialLength) {
      fs.writeFileSync(PLANS_FILE, JSON.stringify(plansData, null, 2));
      res.json({ success: true, message: 'Plan deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Plan not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error deleting plan' });
  }
});

// DELETE /api/v1/superadmin/families/:id
router.delete('/families/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Relying on Postgres onDelete: Cascade for all models attached to Family/User
    // The only model missing Cascade against Family is User. 
    await prisma.$transaction([
      prisma.user.deleteMany({ where: { familyId: id } }),
      prisma.family.delete({ where: { id: id } }),
      prisma.auditLog.create({ 
        data: { user: 'Super Admin', action: 'Deleted Family', module: 'Families', details: `Deleted Family ID: ${id}` }
      })
    ]);

    res.json({ success: true, message: 'Family deleted successfully' });
  } catch (err) {
    console.error('Delete Family Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete family' });
  }
});

// GET superadmin profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { memberSettings: true }
    });
    if (!user) return res.status(404).json({ success: false, message: 'Super admin not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT superadmin profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, theme, language, timezone, password, avatar } = req.body;
    
    let updateData = { firstName, lastName, email, phone };
    
    // Save avatar (base64 string) if provided
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Upsert member settings
    await prisma.memberSettings.upsert({
      where: { userId: req.params.id },
      update: { theme, language, timezone },
      create: { userId: req.params.id, theme: theme || 'System', language: language || 'English', timezone: timezone || 'UTC' }
    });
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      include: { memberSettings: true }
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Get Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    if (logs.length === 0) {
      const initLog = await prisma.auditLog.create({
        data: { user: 'System', action: 'Audit Log Initialized', module: 'System', details: 'No previous records' }
      });
      return res.json({ success: true, data: [initLog] });
    }
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching logs' });
  }
});

// GET /revenue
router.get('/revenue', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({ 
      orderBy: { createdAt: 'desc' },
      take: 50 
    });
    
    let todaysRevenue = 0, monthlyRevenue = 0, yearlyRevenue = 0, pendingRevenue = 0;
    
    // Quick mock calc if no transactions
    if (transactions.length === 0) {
       todaysRevenue = 0; monthlyRevenue = 0; yearlyRevenue = 0; pendingRevenue = 0;
    } else {
       const today = new Date(); today.setHours(0,0,0,0);
       const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
       const thisYear = new Date(today.getFullYear(), 0, 1);
       
       transactions.forEach(t => {
         const tDate = new Date(t.createdAt);
         if (t.status === 'Paid') {
           if (tDate >= today) todaysRevenue += t.amount;
           if (tDate >= thisMonth) monthlyRevenue += t.amount;
           if (tDate >= thisYear) yearlyRevenue += t.amount;
         } else {
           pendingRevenue += t.amount;
         }
       });
    }

    const summary = { today: todaysRevenue, thisMonth: monthlyRevenue, thisYear: yearlyRevenue, pending: pendingRevenue };
    const chartData = [
      { name: 'May', revenue: 0 }, { name: 'Jun', revenue: 0 }, { name: 'Jul', revenue: 0 }, { name: 'Aug', revenue: monthlyRevenue }
    ];

    res.json({ success: true, data: { transactions, summary, chartData } });
  } catch(error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching revenue' });
  }
});

// GET /support
router.get('/support', async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } });
    const stats = {
      open: tickets.filter(t => t.status === 'Open').length,
      resolved: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
      pending: tickets.filter(t => t.status === 'Pending').length,
      closed: tickets.filter(t => t.status === 'Closed').length
    };
    res.json({ success: true, data: { tickets, stats } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching support' });
  }
});

// GET /settings
router.get('/settings', async (req, res) => {
  try {
    const totalFamilies = await prisma.family.count();
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const totalMembers = await prisma.user.count({ where: { role: 'MEMBER' } });
    const totalEvents = await prisma.event.count();
    const totalDocuments = await prisma.document.count();
    
    // Check SMTP config safely
    const hasSmtp = !!process.env.SMTP_HOST;
    const hasGoogle = !!process.env.GOOGLE_CLIENT_ID;

    const data = {
      config: {
        platformName: 'FamilyHub OS',
        version: 'v1.0.0',
        timezone: 'Asia/Kolkata',
        maintenance: 'OFF',
        emailProvider: hasSmtp ? (process.env.SMTP_HOST.includes('brevo') ? 'Brevo' : 'SMTP') : 'Not Configured',
        senderName: process.env.MAIL_FROM_NAME || 'FamilyHub',
        senderEmail: process.env.MAIL_FROM_EMAIL || 'Not Configured',
        jwtExpiry: process.env.JWT_EXPIRES_IN || '7d',
        googleOAuth: hasGoogle ? 'Enabled' : 'Disabled'
      },
      stats: {
        totalFamilies,
        totalAdmins,
        totalMembers,
        totalEvents,
        totalDocuments,
        storageUsed: '0 GB', // Mocked as storage integration isn't tracked in DB size
        galleryPhotos: 0 // Mocked for now
      }
    };
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching settings data' });
  }
});

// GET /notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { familyId: null }, // System level notifications
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

module.exports = router;
