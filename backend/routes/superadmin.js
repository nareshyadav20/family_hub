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
      const emailResult = await sendFamilyAdminEmail(adminName, adminEmail, familyName, result.family.id, adminPassword);
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
      family.id,
      newTempPassword
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

// Update Plan details
router.put('/subscriptions/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, storage, status } = req.body;

    let plansData = [];
    if (fs.existsSync(PLANS_FILE)) {
      plansData = JSON.parse(fs.readFileSync(PLANS_FILE, 'utf-8'));
    }

    const planIndex = plansData.findIndex(p => p.id === id);
    if (planIndex >= 0) {
      plansData[planIndex] = { ...plansData[planIndex], name, price, storage, status };
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

module.exports = router;
