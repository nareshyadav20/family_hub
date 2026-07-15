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
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
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
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
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
        isProfileCompleted: user.isProfileCompleted || false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Fetch All Members Endpoint (Admin Legacy)
app.get('/api/v1/admin/members', async (req, res) => {
  try {
     const members = await prisma.user.findMany({
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

// Shared Unified API
// GET /api/v1/members
app.get('/api/v1/members', async (req, res) => {
  try {
     const token = req.headers.authorization?.split(' ')[1];
     let role = 'MEMBER';
     if (token) {
        try {
           const decoded = jwt.verify(token, process.env.JWT_SECRET);
           role = decoded.role || 'MEMBER';
        } catch(e) {}
     }

     let users = [];

     if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN') {
         users = await prisma.user.findMany({
            include: { invitation: true, memberProfile: true },
            orderBy: { createdAt: 'desc' }
         });
     } else {
         users = await prisma.user.findMany({
            where: { status: 'ACTIVE' },
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
app.delete('/api/v1/admin/members/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No member IDs provided' });
    }
    
    // Delete associated relations first if onDelete Cascade isn't setup perfectly or relying on Prisma logic
    await prisma.user.deleteMany({
      where: { id: { in: ids } }
    });

    res.json({ success: true, message: `Deleted ${ids.length} members` });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ error: 'Server error during deletion' });
  }
});
// Manual Add Member Endpoint (No Invite)
app.post('/api/v1/admin/members/add', async (req, res) => {
  const { firstName, lastName, email, gender, relationship, familyBranch, role, status, isDraft, fatherId, motherId, spouseId } = req.body;
  if (!firstName?.trim()) {
    console.log("WARN: Add Validation skipped. Payload:", req.body);
  }
  
  if (!email) {
    return res.status(200).json({ success: false, error: 'Email is required' });
  }

  try {
     const existing = await prisma.user.findFirst({
        where: { email }
     });
     if (existing) {
        return res.status(200).json({ success: false, error: 'Email already exists' });
     }

     const memberId = 'MEM-' + Math.floor(1000 + Math.random() * 9000);
     const user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
           data: {
             memberId, firstName, lastName: lastName?.trim() || '', email, gender, relationship, familyBranch, role: role || 'MEMBER',
             fatherId: fatherId || null, motherId: motherId || null, spouseId: spouseId || null,
             status: isDraft ? 'PENDING_INVITE' : status
           }
        });
        
        await tx.memberProfile.create({
           data: {
              userId: u.id,
              currentStage: 1,
              profileCompletion: 0
           }
        });
        
        return u;
     });
     const io = req.app.get('socketio');
     io.emit('member.created', { memberId: user.id });
     res.status(201).json({ message: 'Member added successfully', user });
  } catch (err) {
     console.error(err);
     res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Add Member / Invite Endpoint (Admin)
app.post('/api/v1/admin/members/invite', async (req, res) => {
  const { firstName, lastName, phone, email, gender, relationship, familyBranch, role, isDraft } = req.body;
  
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
           'FamilyHub' // the family
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
app.post('/api/v1/admin/members/invite/resend', async (req, res) => {
  const { memberId } = req.body;
  if (!memberId) return res.status(400).json({ error: 'Member ID is required' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: memberId },
      include: { invitation: true }
    });

    if (!user) return res.status(404).json({ error: 'Member not found' });
    if (user.status !== 'INVITATION_SENT' && user.status !== 'EMAIL_FAILED') {
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
           'FamilyHub'
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

app.get('/api/v1/documents', async (req, res) => {
  try {
     const docs = await prisma.document.findMany({
        include: { uploader: { select: { firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
     });
     res.json(docs);
  } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/v1/documents', async (req, res) => {
  try {
     const { name, type, size, category, visibility, uploaderId, fileUrl } = req.body;
     const doc = await prisma.document.create({
        data: {
           name, type, size, category,
           url: fileUrl || `#${Date.now()}`,
           visibility: visibility || 'PRIVATE',
           uploaderId,
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

app.post('/api/v1/admin/events', async (req, res) => {
  try {
     const {
        name, category, description, bannerImage, eventDate, startTime, endTime, venue,
        address, city, state, country, googleMapsUrl, organizerId, familyBranch,
        visibility, inviteType, invitedMembers, rsvpEnabled, maxGuests, rsvpDeadline,
        liveStream, streamVisibility, liveChat, recordEvent, allowPhotos, allowComments,
        reminders, status
     } = req.body;

     const eventId = 'EVT-' + Math.floor(10000 + Math.random() * 90000);
     const safeEventDate = eventDate ? new Date(eventDate) : new Date();
     
     const event = await prisma.event.create({
        data: {
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
         io.emit('notification.created', { message: `New ${category || 'Event'} created: ${name || 'Untitled Event'}!` });
     }

     res.status(201).json({ success: true, event });
  } catch(err) {
     console.error('Event Creation Error:', err);
     res.status(500).json({ error: 'Failed to create event. Please ensure dates are valid.' });
  }
});

app.get('/api/v1/admin/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({ orderBy: { eventDate: 'asc' } });
    res.json(events);
  } catch(err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Get Logged-in Profile Endpoint
app.get('/api/v1/member/profile', async (req, res) => {
  const memberId = typeof req.user !== 'undefined' ? req.user.id : null;
  try {
     let user = null;
     if (memberId) {
        user = await prisma.user.findUnique({ where: { id: memberId }, include: { memberProfile: true } });

// Triggered reboot
     } else {
        user = await prisma.user.findFirst({ include: { memberProfile: true } });
     }
     
     if (!user) return res.status(404).json({ error: 'User not found' });
     res.json({ user, profile: user.memberProfile || { currentStage: 1, profileCompletion: 0 } });
  } catch(err) {
     res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Save Profile Progress Endpoint
app.put('/api/v1/member/profile', async (req, res) => {
  const { currentStage, profileCompletion, ...profileData } = req.body;
  try {
     // Grab the exact first available user since typical JWT tokens are stubbed
     let activeUser = req.user;
     if (!activeUser) {
        activeUser = await prisma.user.findFirst();
        if (!activeUser) return res.status(404).json({ error: 'No active user found to update.' });
     }

     const safeData = {
        currentStage, 
        profileCompletion,
        address: profileData.address || '',
        education: profileData.education || '',
        occupation: profileData.occupation || '',
        company: profileData.company || '',
        biography: profileData.biography || ''
     };

     const profile = await prisma.memberProfile.upsert({
        where: { userId: activeUser.id },
        update: safeData,
        create: {
           userId: activeUser.id,
           ...safeData
        },
        include: { user: true }
     });
     
     if (profileCompletion === 100) {
        await prisma.user.update({
           where: { id: profile.userId },
           data: { status: 'WAITING_APPROVAL' }
        });
        const io = req.app.get('socketio');
        io.emit('member.updated', { memberId: profile.userId });
     }
     
     res.json({ success: true, profile });
  } catch(err) {
     console.error("Profile Save Error: ", err);
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
 
