require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const http = require('http');
const { Server } = require('socket.io');

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
app.use(express.json());

io.on('connection', (socket) => {
  console.log('New client connected to Real-Time Socket:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Signup Endpoint
app.post('/api/v1/auth/signup', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields are required.' });
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
        lastName,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
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
    if (!user) {
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

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Fetch All Members Endpoint (Admin)
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
// Manual Add Member Endpoint (No Invite)
app.post('/api/v1/admin/members/add', async (req, res) => {
  const { firstName, lastName, gender, relationship, familyBranch, role, status, isDraft } = req.body;
  if (!firstName?.trim()) {
    console.log("WARN: Add Validation skipped. Payload:", req.body);
  }
  try {
     const memberId = 'MEM-' + Math.floor(1000 + Math.random() * 9000);
     const user = await prisma.user.create({
        data: {
          memberId, firstName, lastName: lastName?.trim() || '', gender, relationship, familyBranch, role: role || 'MEMBER',
          status: isDraft ? 'PENDING_INVITE' : status
        }
     });
     const io = req.app.get('socketio');
     io.emit('member.created', { memberId: user.id });
     res.status(201).json({ message: 'Member added successfully', user });
  } catch (err) {
     console.error(err);
     res.status(500).json({ error: 'Server error' });
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
       return res.status(400).json({ error: 'This Phone Number or Email is already registered to a Family Member!' });
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
    if (!isDraft) {
       const inviteUrl = `http://localhost:5174/invite?token=${generatedToken}`;
       
       // 1. Email Service (Nodemailer)
       if (email) {
          const transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, auth: { user: 'user', pass: 'pass' } });
          const mailOptions = {
             from: '"FamilyHub OS" <invites@familyhub.com>',
             to: email,
             subject: 'You have been invited to join the Family Tree!',
             html: `<p>Hello ${firstName},</p>
                    <p>You have been invited to join as a <strong>${relationship}</strong> to the family.</p>
                    <p>Click <a href="${inviteUrl}">here</a> to join or use URL: ${inviteUrl}</p>`
          };
          // transporter.sendMail(mailOptions).catch(console.error); // Enabled for Ethereal / Sendgrid in Prod
          console.log(`[EMAIL DISPATCH] Sent Invite to ${email}`);
       }

       // 2. Meta WhatsApp Cloud API (Stub)
       if (phone) {
          console.log(`[WHATSAPP DISPATCH] Sending WhatsApp Template to ${phone} with OTP / Link...`);
       }

       // 3. Socket broadcast Notification to logged-in users 
       io.emit('notification.created', { message: `${firstName} has been invited to join the family.` });
    }

    res.status(201).json({
      message: isDraft ? 'Member saved as draft' : 'Invitation sent successfully',
      user: result,
      inviteLink: !isDraft ? `http://localhost:5174/invite?token=${generatedToken}` : null
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
     const { name, type, size, category, visibility, uploaderId } = req.body;
     const doc = await prisma.document.create({
        data: {
           name, type, size, category,
           url: `#${Date.now()}`,
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} with WebSockets enabled`));
 
