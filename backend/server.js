require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const http = require('http');
const { Server } = require('socket.io');
const { sendInvitationEmail } = require('./services/emailService');
const crypto = require('crypto');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set('socketio', io); // Keep accessible globally

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const memberSettingsRouter = require('./routes/memberSettings');
const dashboardRouter = require('./routes/dashboard');
const announcementsRouter = require('./routes/announcements');
const pollsRouter = require('./routes/polls');
const notificationsRouter = require('./routes/notifications');
const groupsRouter = require('./routes/groups');
const messagesRouter = require('./routes/messages');
const galleryRouter = require('./routes/gallery');
const familyHistoryRouter = require('./routes/familyHistory');
const memberDashboardRouter = require('./routes/memberDashboard');
const websiteRouter = require('./routes/website');
const superadminRouter = require('./routes/superadmin');
const googleCalendarRouter = require('./routes/googleCalendar');

app.use('/api', memberSettingsRouter);
app.use('/api/v1/admin/dashboard', dashboardRouter);
app.use('/api/v1/admin/announcements', announcementsRouter);
app.use('/api/v1/member/announcements', announcementsRouter);
app.use('/api/v1/admin/polls', pollsRouter);
app.use('/api/v1/member/polls', pollsRouter);
app.use('/api/v1/polls', pollsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/groups', groupsRouter);
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/gallery', galleryRouter);
app.use('/api/v1/family-history', familyHistoryRouter);
app.use('/api/v1/member/dashboard', memberDashboardRouter);
app.use('/api/v1/website', websiteRouter);
app.use('/api/v1/superadmin', superadminRouter);
app.use('/api/google', googleCalendarRouter);

app.get('/api/test-instant-email', async (req, res) => {
  try {
    const { sendInstantEmail } = require('./services/emailService');
    const to = req.query.email || process.env.MAIL_FROM_EMAIL || 'support@familyhub.com';
    const messageId = await sendInstantEmail(
      to,
      'Test Instant Email from FamilyHub',
      '<p>This email was dispatched instantly by the backend successfully!</p>'
    );
    res.json({
      success: true,
      status: 'SMTP Connected',
      message: 'Email Sent',
      messageId: messageId,
      recipient: to,
      subject: 'Test Instant Email from FamilyHub'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

io.on('connection', (socket) => {
  console.log('New client connected to Real-Time Socket:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Signup Endpoint
app.post('/api/v1/auth/signup', async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;
  
  if (!email || !password || !firstName) {
    return res.status(400).json({ error: 'Email, First Name, and Password are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }

    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already exists.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'MEMBER';

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || '',
        email,
        phone: phone || null,
        password: hashedPassword,
        role: userRole,
        status: 'ACTIVE'
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, familyId: user.familyId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role, familyId: user.familyId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        memberId: user.memberId || 'FH-0000',
        familyId: user.familyId || 'FAM-0000',
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        mobile: user.phone || user.mobile,
        role: user.role,
        status: user.status || 'ACTIVE',
        profileCompletion: user.profileCompletion || 25,
        currentProfileStep: user.currentProfileStep || 'Basic Information',
        isProfileCompleted: user.isProfileCompleted || false
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, familyId: user.familyId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role, familyId: user.familyId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        memberId: user.memberId || 'FH-0000',
        familyId: user.familyId || 'FAM-0000',
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        mobile: user.phone || user.mobile,
        role: user.role,
        status: user.status || 'ACTIVE',
        profileCompletion: user.profileCompletion || 25,
        currentProfileStep: user.currentProfileStep || 'Basic Information',
        isProfileCompleted: user.isProfileCompleted || false,
        mustChangePassword: user.mustChangePassword || false,
        isTemporaryPassword: user.isTemporaryPassword || false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change Password Endpoint (First Login Flow)
app.post('/api/v1/auth/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        isTemporaryPassword: false
      }
    });
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch All Members Endpoint (Admin Legacy)
app.get('/api/v1/admin/members', authenticateToken, async (req, res) => {
  try {
     const familyId = req.user.familyId;
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

     const members = await prisma.user.findMany({
        where: { familyId },
        include: {
           invitation: true,
           memberProfile: true
        },
        orderBy: { createdAt: 'desc' }
     });
     res.status(200).json(members);
  } catch (err) {
     console.error('Fetch members error:', err);
     res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Authentication Middleware (Universal)
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Shared Unified API
// GET /api/v1/members
app.get('/api/v1/members', authenticateToken, async (req, res) => {
  try {
     const role = req.user.role;
     const familyId = req.user.familyId;
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

     let users = [];

     if (role === 'SUPER_ADMIN') {
         users = await prisma.user.findMany({
            include: { invitation: true, memberProfile: true },
            orderBy: { createdAt: 'desc' }
         });
     } else if (role === 'ADMIN' || role === 'FAMILY_ADMIN') {
         users = await prisma.user.findMany({
            where: { familyId },
            include: { invitation: true, memberProfile: true },
            orderBy: { createdAt: 'desc' }
         });
     } else {
         users = await prisma.user.findMany({
            where: { familyId, status: 'ACTIVE' },
            select: { id: true, memberId: true, firstName: true, lastName: true, email: true, phone: true, role: true, joinedDate: true, avatar: true },
            orderBy: { firstName: 'asc' }
         });
     }
     res.json(users);
  } catch (error) {
     res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Shared Unified API for Profile
// GET /api/v1/profile
app.get('/api/v1/profile', async (req, res) => {
  try {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ error: 'Unauthorized' });
     const decoded = jwt.verify(token, process.env.JWT_SECRET);

     const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { memberProfile: true }
     });
     if (!user) return res.status(404).json({ error: 'User not found' });
     
     res.json({
        id: user.id,
        memberId: user.memberId || 'FH-0000',
        familyId: user.familyId || 'FAM-0000',
        name: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.phone || user.mobile,
        role: user.role,
        status: user.status || 'ACTIVE',
        profileCompletion: user.profileCompletion || 25,
        currentProfileStep: user.currentProfileStep || 'Basic Information',
        isProfileCompleted: user.isProfileCompleted || false,
        avatar: user.avatar,
        profile: user.memberProfile
     });
  } catch (error) {
     res.status(500).json({ error: 'Profile fetch failed' });
  }
});

// Bulk Delete Members Endpoint (Admin)
app.delete('/api/v1/admin/members/bulk', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.familyId;
    if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No member IDs provided' });
    }
    
    // Delete associated relations first if onDelete Cascade isn't setup perfectly or relying on Prisma logic
    await prisma.user.deleteMany({
      where: { id: { in: ids }, familyId }
    });

    res.json({ success: true, message: `Deleted ${ids.length} members` });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ error: 'Server error during deletion' });
  }
});
// Manual Add Member Endpoint (No Invite)
app.post('/api/v1/admin/members/add', authenticateToken, async (req, res) => {
  const familyId = req.user.familyId;
  if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

  const { firstName, lastName, email, gender, relationship, familyBranch, role, status, isDraft, fatherId, motherId, spouseId, password } = req.body;
  if (!firstName?.trim()) {
    console.log("WARN: Add Validation skipped. Payload:", req.body);
  }
  
  if (!email || !password) {
    return res.status(200).json({ success: false, error: 'Email and Password are required' });
  }

  try {
     const existing = await prisma.user.findFirst({
        where: { email }
     });
     if (existing) {
        return res.status(200).json({ success: false, error: 'Email already exists' });
     }

     const hashedPassword = await bcrypt.hash(password, 10);
     const memberId = 'MEM-' + Math.floor(1000 + Math.random() * 9000);
     const user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
           data: {
             memberId, firstName, lastName: lastName?.trim() || '', email, gender, relationship, familyBranch, role: role || 'MEMBER',
             fatherId: fatherId || null, motherId: motherId || null, spouseId: spouseId || null,
             familyId: familyId,
             status: isDraft ? 'PENDING_INVITE' : (status || 'ACTIVE'),
             password: hashedPassword,
             mustChangePassword: true,
             isTemporaryPassword: true,
             profileCompletion: 25
           }
        });
        
        await tx.memberProfile.create({
           data: {
              userId: u.id,
              currentStage: 1,
              profileCompletion: 25
           }
        });
        
        return u;
     });
     
     // Send Real-Time Credentials Email
     const { sendMemberCredentialsEmail } = require('./services/emailService');
     
     if (!isDraft && email) {
        try {
           const memberName = firstName + (lastName?.trim() ? ' ' + lastName.trim() : '');
           const emailResult = await sendMemberCredentialsEmail(memberName, email, password);
           
           if (!emailResult.success) {
               await prisma.user.update({
                 where: { id: user.id },
                 data: { status: 'EMAIL_FAILED' }
               });
           }
        } catch (emailErr) {
           console.error('Failed to send add member credentials:', emailErr);
           await prisma.user.update({
             where: { id: user.id },
             data: { status: 'EMAIL_FAILED' }
           });
        }
     }

     const io = req.app.get('socketio');
     io.emit('member.created', { memberId: user.id });
     res.status(201).json({ message: 'Member added successfully', user });
  } catch (err) {
     console.error(err);
     res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Add Member / Invite Endpoint (Admin)
app.post('/api/v1/admin/members/invite', authenticateToken, async (req, res) => {
  const { firstName, lastName, phone, email, gender, relationship, familyBranch, role, isDraft } = req.body;
  const familyId = req.user.familyId;
  
  if (!familyId) return res.status(401).json({ error: 'Family ID missing from user session' });

  if (!firstName?.trim() || !phone?.trim()) {
    console.log("WARN: Validation skipped. Payload:", req.body);
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email: email || 'NONE' }] }
    });
    if (existing) {
       return res.status(200).json({ success: false, error: 'This Phone Number or Email is already registered to a Family Member!' });
    }

    const memberId = 'FH-' + Math.floor(1000 + Math.random() * 9000);
    const generatedToken = require('crypto').randomBytes(32).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          familyId,
          memberId, firstName, lastName: lastName?.trim() || '', phone, email: email || null,
          gender, relationship, familyBranch,
          role: role || 'MEMBER',
          status: isDraft ? 'PENDING_INVITE' : 'INVITATION_SENT'
        }
      });
      if (!isDraft) {
         await tx.invitation.create({
           data: {
             userId: user.id,
             token: generatedToken,
             otp,
             expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
           }
         });
      }
      return user;
    });

    const io = req.app.get('socketio');
    io.emit('member.invited', { memberId: result.id, isDraft });
    
    // Notification & Real-Time Events Engine
    if (isDraft) {
      return res.status(201).json({
        message: 'Member saved as draft',
        user: result
      });
    }

    let emailStatus = 'INVITATION_SENT';
    let emailResult = { success: true };
    
    // 1. Email Service (Brevo)
    if (email) {
       emailResult = await sendInvitationEmail(
           { email, firstName: firstName, lastName: lastName?.trim() || '' },
           'Admin', // the inviter
           'FamilyHub', // the family
           generatedToken
       );
       if (!emailResult.success) {
           emailStatus = 'EMAIL_FAILED';
       }
    }

    if (emailStatus === 'EMAIL_FAILED') {
        await prisma.user.update({
            where: { id: result.id },
            data: { 
              status: 'EMAIL_FAILED',
              brevoErrorCode: emailResult.errorCode || 'UNKNOWN_ERROR',
              brevoErrorMessage: emailResult.error || 'Unknown email failure',
              lastEmailAttempt: new Date()
            }
        });
        
        return res.status(200).json({
           success: false,
           emailSent: false,
           status: 'EMAIL_FAILED',
           error: emailResult.error || 'Brevo Configuration Missing or Sender Error'
        });
    }

    // Success Status
    await prisma.user.update({
        where: { id: result.id },
        data: { 
          lastEmailAttempt: new Date(),
          brevoErrorCode: null,
          brevoErrorMessage: null
        }
    });

    if (phone) {
       console.log(`[WHATSAPP DISPATCH] Sending WhatsApp Template to ${phone} with OTP / Link...`);
    }

    io.emit('notification.created', { message: `${firstName} has been invited to join the family.` });

    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    res.status(201).json({
       success: true,
       emailSent: true,
       status: 'INVITATION_SENT',
       message: 'Invitation sent successfully',
       user: result,
       inviteLink: `${appUrl}/invite?token=${generatedToken}`
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Resend Invitation Endpoint
app.post('/api/v1/admin/members/invite/resend', authenticateToken, async (req, res) => {
  const { memberId } = req.body;
  const familyId = req.user.familyId;
  if (!memberId) return res.status(400).json({ error: 'Member ID is required' });
  if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: memberId, familyId },
      include: { invitation: true }
    });

    if (!user) return res.status(404).json({ error: 'Member not found' });
    if (user.status !== 'INVITATION_SENT' && user.status !== 'EMAIL_FAILED' && user.status !== 'PENDING_INVITE') {
      return res.status(400).json({ error: 'Cannot resend invitation for this status' });
    }

    let token = user.invitation?.token;
    if (!token) {
        token = crypto.randomBytes(32).toString('hex');
        await prisma.invitation.create({
            data: {
                userId: user.id,
                token,
                otp: Math.floor(100000 + Math.random() * 900000).toString(),
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
            }
        });
    }

    let emailStatus = 'INVITATION_SENT';
    let emailResult = { success: true };
    if (user.email) {
       emailResult = await sendInvitationEmail(
           { email: user.email, firstName: user.firstName, lastName: user.lastName },
           'Admin',
           'FamilyHub',
           token,
           true
       );
       if (!emailResult.success) {
           emailStatus = 'EMAIL_FAILED';
       }
    }

    if (emailStatus === 'EMAIL_FAILED') {
        const failedUser = await prisma.user.update({
            where: { id: user.id },
            data: { 
              status: 'EMAIL_FAILED',
              brevoErrorCode: emailResult.errorCode || 'UNKNOWN_ERROR',
              brevoErrorMessage: emailResult.error || 'Unknown email issue',
              lastEmailAttempt: new Date()
            }
        });
        const io = req.app.get('socketio');
        io.emit('member.updated', { memberId: user.id });
        return res.status(200).json({ success: false, emailSent: false, status: 'EMAIL_FAILED', error: emailResult.error || 'Unknown email issue', user: failedUser });
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { 
          status: 'INVITATION_SENT',
          brevoErrorCode: null,
          brevoErrorMessage: null,
          lastEmailAttempt: new Date()
        }
    });

    const io = req.app.get('socketio');
    io.emit('member.updated', { memberId: user.id });

    res.json({ success: true, emailSent: true, status: 'INVITATION_SENT', message: 'Invitation resent successfully', user: updatedUser });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Token Endpoint
app.get('/api/v1/auth/invite/verify-token', async (req, res) => {
  const { token } = req.query;
  try {
    const invite = await prisma.invitation.findUnique({
      where: { token }, include: { user: true }
    });
    if (!invite) return res.status(404).json({ error: 'Invalid invite link' });
    if (new Date() > invite.expiresAt) return res.status(400).json({ error: 'Invite link expired' });

    res.json({ valid: true, user: { id: invite.user.id, firstName: invite.user.firstName, lastName: invite.user.lastName, phone: invite.user.phone }});
  } catch(error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept Invitation & Complete Profile Endpoint
app.post('/api/v1/auth/invite/accept', async (req, res) => {
  const { token, password, otp, ...profileData } = req.body;
  try {
    const invite = await prisma.invitation.findUnique({ where: { token }, include: { user: true } });
    if (!invite || new Date() > invite.expiresAt) return res.status(400).json({ error: 'Invalid or expired invite' });
    
    // In production verify strict OTP match, currently bypassing stub for flow demo
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.$transaction(async (tx) => {
       await tx.user.update({
         where: { id: invite.userId },
         data: { password: hashedPassword, status: 'ACTIVE' }
       });
       await tx.memberProfile.create({
         data: {
            userId: invite.userId,
            address: profileData.address || '',
            biography: profileData.biography || '',
            dob: profileData.dob ? new Date(profileData.dob) : null,
            bloodGroup: profileData.bloodGroup || null,
            currentStage: 2,
            profileCompletion: 25
         }
       });
       await tx.invitation.delete({ where: { id: invite.id } }); // consume token
    });

    const io = req.app.get('socketio');
    io.emit('member.accepted', { memberId: invite.userId });
    io.emit('member.updated', { memberId: invite.userId });
    io.emit('notification.created', { message: `${invite.user.firstName} accepted the invitation.` });
    io.emit('notification.created', { message: `${invite.user.firstName} joined the family.` });

    res.json({ success: true, message: 'Profile completed successfully' });
  } catch(err) {
    console.error('Accept error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// DOCUMENTS API (Shared)
// ==========================================

app.get('/api/v1/documents', authenticateToken, async (req, res) => {
  try {
     const familyId = req.user.familyId;
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });
     const docs = await prisma.document.findMany({
        where: { familyId },
        include: { uploader: { select: { firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
     });
     res.json(docs);
  } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/v1/documents', authenticateToken, async (req, res) => {
  try {
     const familyId = req.user.familyId;
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });
     const { name, type, size, category, visibility, uploaderId, fileUrl } = req.body;
     const doc = await prisma.document.create({
        data: {
           name, type, size, category,
           url: fileUrl || `#${Date.now()}`,
           visibility: visibility || 'PRIVATE',
           uploaderId,
           familyId,
           status: 'PENDING'
        },
        include: { uploader: { select: { firstName: true, lastName: true } } }
     });
     
     const io = req.app.get('socketio');
     io.emit('document.uploaded', { message: `New Document "${name}" uploaded and pending verification.` });
     io.emit('notification.created', { message: `New Document "${name}" uploaded and pending verification.` });
     
     res.status(201).json(doc);
  } catch(err) { 
     console.error('Document Upload Error:', err);
     res.status(500).json({ error: 'Failed to upload document.' }); 
  }
});

app.put('/api/v1/documents/:id/status', async (req, res) => {
  try {
     const { status, visibility } = req.body;
     const updateData = {};
     if (status) updateData.status = status;
     if (visibility) updateData.visibility = visibility;

     const doc = await prisma.document.update({
        where: { id: req.params.id },
        data: updateData
     });
     
     const io = req.app.get('socketio');
     if (status === 'VERIFIED') {
        io.emit('document.verified', { documentId: doc.id, message: `Your document ${doc.name} was verified!` });
        io.emit('notification.created', { message: `Document ${doc.name} was successfully verified.` });
     }
     
     res.json(doc);
  } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

// ==========================================
// EVENTS API (Admin)
// ==========================================

app.post('/api/v1/admin/events', authenticateToken, async (req, res) => {
  try {
     const {
        name, category, description, bannerImage, eventDate, startTime, endTime, venue,
        address, city, state, country, googleMapsUrl, organizerId, familyBranch,
        visibility, inviteType, invitedMembers, rsvpEnabled, maxGuests, rsvpDeadline,
        liveStream, streamVisibility, liveChat, recordEvent, allowPhotos, allowComments,
        reminders, status, streamingPlatform, streamId, streamLink
     } = req.body;
     const familyId = req.user.familyId;
     if (!familyId) return res.status(401).json({ error: 'Family ID missing' });

     const eventId = 'EVT-' + Math.floor(10000 + Math.random() * 90000);
     const safeEventDate = eventDate ? new Date(eventDate) : new Date();
     
     const event = await prisma.event.create({
        data: {
           familyId,
           eventId, 
           name: name || 'Untitled Event', 
           category: category || 'Other', 
           description: description || '', 
           bannerImage,
           eventDate: safeEventDate,
           startTime: startTime || '12:00', 
           endTime: endTime || null, 
           venue: venue || 'TBD', 
           address: address || '', 
           city: city || '', 
           state: state || '', 
           country: country || '', 
           googleMapsUrl: googleMapsUrl || null,
           organizerId: organizerId || 'Admin', 
           familyBranch: familyBranch || 'General', 
           visibility: visibility || 'Private', 
           inviteType: inviteType || 'All Members', 
           invitedMembers,
           rsvpEnabled: !!rsvpEnabled, 
           maxGuests: maxGuests ? parseInt(maxGuests) : null,
           rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
           liveStream: !!liveStream, 
           streamVisibility: streamVisibility || null, 
           streamingPlatform: streamingPlatform || 'Jitsi Meet',
           streamId: streamId || null,
           streamLink: streamLink || null,
           liveChat: !!liveChat, 
           recordEvent: !!recordEvent, 
           allowPhotos: !!allowPhotos, 
           allowComments: !!allowComments,
           reminders, 
           status: status || 'Draft', 
           createdBy: 'Admin'
        }
     });

     if (status === 'Publish') {
         const io = req.app.get('socketio');
         io.emit('event.created', { eventId, message: `New Event Scheduled: ${name || 'Untitled Event'}` });
         
         const newNotif = await prisma.notification.create({
            data: {
               familyId,
               title: 'New Event Scheduled',
               message: `${name || 'Untitled Event'} has been scheduled.`,
               type: 'event',
               targetType: 'All'
            }
         });
         io.emit('notification.created', newNotif);

         // Auto-sync to Google Calendar
         try {
           const connection = await prisma.googleCalendarConnection.findUnique({ where: { userId: req.user.userId } });
           if (connection) {
             const gService = require('./services/googleCalendarService');
             
             // Format times for Google Calendar. Use arbitrary defaults if missing.
             let startDateTime = safeEventDate.toISOString().split('T')[0] + 'T' + (startTime || '12:00') + ':00Z';
             let endDateTime = safeEventDate.toISOString().split('T')[0] + 'T' + (endTime || '13:00') + ':00Z';
             
             await gService.createGoogleEvent(connection, {
               title: name || 'Untitled Event',
               description: description || '',
               location: address || venue || '',
               startTime: startDateTime,
               endTime: endDateTime
             });
             console.log(`Successfully auto-synced event to Google Calendar for user ${req.user.userId}`);
           }
         } catch (syncErr) {
           console.error('Warning: Auto-sync to Google Calendar failed', syncErr);
         }
     }

     res.status(201).json({ success: true, event });
  } catch(err) {
     console.error('Event Creation Error:', err);
     res.status(500).json({ error: 'Failed to create event. ' + err.message });
  }
});

app.get('/api/v1/admin/events', authenticateToken, async (req, res) => {
  try {
    const familyId = req.user.familyId;
    if (!familyId) return res.json([]);
    const events = await prisma.event.findMany({ where: { familyId }, orderBy: { eventDate: 'asc' } });
    res.json(events);
  } catch(err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/v1/admin/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await prisma.event.findFirst({ where: { id: req.params.id, familyId: req.user.familyId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Dynamic Role-Based Live Stream Resolver
app.get('/api/v1/events/live/:streamId', async (req, res) => {
  try {
    const streamId = req.params.streamId;
    const event = await prisma.event.findUnique({ where: { streamId } });
    
    if (!event || !event.liveStream) {
       return res.status(404).json({ error: 'Stream disconnected or invalid.' });
    }

    if (event.visibility === 'Public') {
       return res.json(event);
    }

    // Otherwise requires Family access
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
       return res.status(401).json({ error: 'Unauthorized. Please log in to view this stream.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
       if (err) return res.status(403).json({ error: 'Invalid permissions.' });
       if (user.familyId !== event.familyId) {
          return res.status(403).json({ error: 'Forbidden. Stream isolated to a different family ring.' });
       }
       res.json(event);
    });
  } catch(err) {
    res.status(500).json({ error: 'Failed to resolve stream.' });
  }
});

app.delete('/api/v1/admin/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await prisma.event.findFirst({ where: { id: req.params.id, familyId: req.user.familyId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Event deleted' });
  } catch(err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get Logged-in Profile Endpoint
app.get('/api/v1/member/profile', authenticateToken, async (req, res) => {
  try {
     const userId = req.user.userId || req.user.id;
     if (!userId) return res.status(401).json({ error: 'User ID missing in token' });
     const user = await prisma.user.findUnique({ where: { id: userId }, include: { memberProfile: true } });
     if (!user) return res.status(404).json({ error: 'User not found' });
     res.json({ user, profile: user.memberProfile || { currentStage: 1, profileCompletion: 0 } });
  } catch(err) {
     console.error("GET /api/v1/member/profile error:", err);
     res.status(500).json({ error: 'Server error fetching profile', details: err.message });
  }
});

// Save Profile Progress Endpoint
app.put('/api/v1/member/profile', authenticateToken, async (req, res) => {
  const { currentStage, profileCompletion, ...profileData } = req.body;
  try {
     const activeUser = req.user;
     if (!activeUser) return res.status(401).json({ error: 'Unauthorized' });

     const userId = activeUser.userId || activeUser.id;
     if (!userId) return res.status(401).json({ error: 'User ID missing in token' });

     const safeData = {
        currentStage, 
        profileCompletion,
        address: profileData.address || '',
        dob: profileData.dob ? new Date(profileData.dob) : null,
        bloodGroup: profileData.bloodGroup || null,
        education: profileData.college ? `${profileData.education || ''} at ${profileData.college}` : (profileData.education || ''),
        occupation: profileData.occupation || '',
        company: profileData.company || '',
        biography: profileData.skills ? `${profileData.biography || ''}\n\nSkills: ${profileData.skills}` : (profileData.biography || '')
     };

     const profile = await prisma.memberProfile.upsert({
        where: { userId: userId },
        update: safeData,
        create: {
           userId: userId,
           ...safeData
        },
        include: { user: true }
     });
     
     // Update the User model fields as well so the frontend knows it's complete
     await prisma.user.update({
        where: { id: profile.userId },
        data: { 
           ...(profileData.phone && profileData.phone.trim() !== '' ? { phone: profileData.phone.trim() } : {}),
           profileCompletion: profileCompletion,
           currentProfileStep: profileCompletion === 100 ? 'Completed' : `Stage ${currentStage}`,
           isProfileCompleted: profileCompletion === 100,
           ...(profileCompletion === 100 && { status: 'ACTIVE' })
        }
     });

     if (profileCompletion === 100) {
        const io = req.app.get('socketio');
        if (io) io.emit('member.updated', { memberId: profile.userId });
     }
     
     res.json({ success: true, profile });
  } catch(err) {
     if (err.code === 'P2002' && err.meta && err.meta.target && err.meta.target.includes('phone')) {
        return res.status(400).json({ error: 'Phone number is already in use by another account.' });
     }
     console.error("Profile Save Error: ", err);
     const fs = require('fs');
     fs.writeFileSync('profile_save_error.log', err.toString() + '\n' + (err.stack || ''));
     res.status(500).json({ error: 'Server error updating profile' });
  }
});

app.get('/api/test/brevo', async (req, res) => {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey || typeof brevoApiKey !== 'string' || brevoApiKey.length < 20) {
      return res.status(401).json({ success: false, message: 'Invalid Brevo API key.' });
    }

    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      let parsedError = {};
      try { parsedError = JSON.parse(errorData); } catch (e) {}
      return res.status(response.status).json({
        success: false,
        error: parsedError.message || errorData,
        errorCode: parsedError.code || 'UNKNOWN'
      });
    }

    const data = await response.json();
    res.json({ success: true, account: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} with WebSockets enabled`));
 
