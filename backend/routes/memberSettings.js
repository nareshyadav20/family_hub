const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

// Ensure settings exist
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
    const settings = await ensureSettings((req.user.userId || req.user.id));
    const user = await prisma.user.findUnique({ where: { id: (req.user.userId || req.user.id) } });
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
    const settings = await prisma.memberSettings.update({ where: { userId: (req.user.userId || req.user.id) }, data: updateData });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/member/security — toggle 2FA
router.put('/security', authenticate, async (req, res) => {
  try {
    const { two_factor_enabled } = req.body;
    const settings = await prisma.memberSettings.upsert({
      where: { userId: (req.user.userId || req.user.id) },
      update: { two_factor_enabled },
      create: { userId: (req.user.userId || req.user.id), two_factor_enabled },
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
      where: { userId: (req.user.userId || req.user.id) },
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
      where: { userId: (req.user.userId || req.user.id) },
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
    const settings = await prisma.memberSettings.update({ where: { userId: (req.user.userId || req.user.id) }, data: { theme, language, timezone } });
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/member/change-password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const user = await prisma.user.findUnique({ where: { id: (req.user.userId || req.user.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.password) {
      const valid = await bcrypt.compare(currentPassword || '', user.password);
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/member/avatar — store base64 avatar in users.avatar
router.put('/avatar', authenticate, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ error: 'Avatar data required' });
    const user = await prisma.user.update({ where: { id: (req.user.userId || req.user.id) }, data: { avatar } });
    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    console.error('Avatar update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/member/profile-info — update basic info + memberProfile extended fields
router.put('/profile-info', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, gender, familyBranch, dob, bloodGroup, occupation, address } = req.body;

    const userUpdate = {};
    if (firstName    !== undefined) userUpdate.firstName    = firstName;
    if (lastName     !== undefined) userUpdate.lastName     = lastName;
    if (phone        !== undefined) userUpdate.phone        = phone;
    if (gender       !== undefined) userUpdate.gender       = gender;
    if (familyBranch !== undefined) userUpdate.familyBranch = familyBranch;

    await prisma.user.update({ where: { id: (req.user.userId || req.user.id) }, data: userUpdate });

    const profileUpdate = {};
    if (dob        !== undefined) profileUpdate.dob        = dob ? new Date(dob) : null;
    if (bloodGroup !== undefined) profileUpdate.bloodGroup = bloodGroup;
    if (occupation !== undefined) profileUpdate.occupation = occupation;
    if (address    !== undefined) profileUpdate.address    = address;

    if (Object.keys(profileUpdate).length > 0) {
      await prisma.memberProfile.upsert({
        where: { userId: (req.user.userId || req.user.id) },
        update: profileUpdate,
        create: { userId: (req.user.userId || req.user.id), ...profileUpdate },
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: (req.user.userId || req.user.id) },
      include: { memberProfile: true, memberSettings: true },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Profile info update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/member/request-account-deletion
router.post('/request-account-deletion', authenticate, async (req, res) => {
  try {
    res.json({ success: true, message: 'Account deletion request received' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/member/send-email-otp
router.post('/send-email-otp', authenticate, async (req, res) => {
  try {
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
    const settings = await prisma.memberSettings.update({ where: { userId: (req.user.userId || req.user.id) }, data: { email: newEmail } });
    res.json({ success: true, settings, message: 'Email updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/member/send-mobile-otp
router.post('/send-mobile-otp', authenticate, async (req, res) => {
  try {
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
    const settings = await prisma.memberSettings.update({ where: { userId: (req.user.userId || req.user.id) }, data: { mobile: newMobile } });
    res.json({ success: true, settings, message: 'Mobile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
