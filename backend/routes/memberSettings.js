const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Ensure settings exist middleware
const ensureSettings = async (userId) => {
  let settings = await prisma.memberSettings.findUnique({ where: { userId } });
  if (!settings) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    settings = await prisma.memberSettings.create({
      data: {
        userId,
        display_name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        mobile: user.phone
      }
    });
  }
  return settings;
};

// GET /api/member/settings
router.get('/settings', authenticate, async (req, res) => {
  try {
    const settings = await ensureSettings(req.user.id);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ success: true, settings, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/member/settings
router.put('/settings', authenticate, async (req, res) => {
  try {
    const { display_name, username } = req.body;
    let updateData = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (username !== undefined) updateData.username = username;

    const settings = await prisma.memberSettings.update({
      where: { userId: req.user.id },
      data: updateData
    });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/member/security
router.put('/security', authenticate, async (req, res) => {
  try {
    const { two_factor_enabled } = req.body;
    const settings = await prisma.memberSettings.update({
      where: { userId: req.user.id },
      data: { two_factor_enabled }
    });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/member/privacy
router.put('/privacy', authenticate, async (req, res) => {
  try {
    const { show_mobile, show_email, show_dob, show_address, show_public_profile, allow_direct_messages } = req.body;
    const settings = await prisma.memberSettings.update({
      where: { userId: req.user.id },
      data: { show_mobile, show_email, show_dob, show_address, show_public_profile, allow_direct_messages }
    });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/member/notifications
router.put('/notifications', authenticate, async (req, res) => {
  try {
    const { email_notifications, whatsapp_notifications, push_notifications, birthday_notifications, event_notifications, announcement_notifications } = req.body;
    const settings = await prisma.memberSettings.update({
      where: { userId: req.user.id },
      data: { email_notifications, whatsapp_notifications, push_notifications, birthday_notifications, event_notifications, announcement_notifications }
    });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/member/appearance
router.put('/appearance', authenticate, async (req, res) => {
  try {
    const { theme, language, timezone } = req.body;
    const settings = await prisma.memberSettings.update({
      where: { userId: req.user.id },
      data: { theme, language, timezone }
    });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/member/request-account-deletion
router.post('/request-account-deletion', authenticate, async (req, res) => {
  try {
    // Just a placeholder for actual deletion logic
    res.json({ success: true, message: 'Account deletion request received' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/member/send-email-otp
router.post('/send-email-otp', authenticate, async (req, res) => {
  try {
    // Generate and send OTP logic here
    res.json({ success: true, message: 'OTP sent to new email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/member/verify-email-otp
router.post('/verify-email-otp', authenticate, async (req, res) => {
  try {
    const { otp, newEmail } = req.body;
    if (otp !== '123456') return res.status(400).json({ error: 'Invalid OTP' });
    
    const settings = await prisma.memberSettings.update({
      where: { userId: req.user.id },
      data: { email: newEmail }
    });
    res.json({ success: true, settings, message: 'Email updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/member/send-mobile-otp
router.post('/send-mobile-otp', authenticate, async (req, res) => {
  try {
    // Generate and send OTP logic here
    res.json({ success: true, message: 'OTP sent to new mobile' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/member/verify-mobile-otp
router.post('/verify-mobile-otp', authenticate, async (req, res) => {
  try {
    const { otp, newMobile } = req.body;
    if (otp !== '123456') return res.status(400).json({ error: 'Invalid OTP' });
    
    const settings = await prisma.memberSettings.update({
      where: { userId: req.user.id },
      data: { mobile: newMobile }
    });
    res.json({ success: true, settings, message: 'Mobile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
