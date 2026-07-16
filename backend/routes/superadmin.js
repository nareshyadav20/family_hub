const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { sendFamilyAdminEmail } = require('../services/emailService');

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

    // Send Brevo Email asynchronously
    sendFamilyAdminEmail(adminName, adminEmail, familyName, adminPassword).catch(err => console.error(err));

    res.status(201).json({ success: true, data: result.family });
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

module.exports = router;
