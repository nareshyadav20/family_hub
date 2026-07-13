require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
  if (!firstName || !lastName || !gender || !relationship || !familyBranch) {
     return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
     const memberId = 'MEM-' + Math.floor(1000 + Math.random() * 9000);
     const user = await prisma.user.create({
        data: {
          memberId, firstName, lastName, gender, relationship, familyBranch, role: role || 'MEMBER',
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
  
  if (!firstName || !lastName || !phone) {
    return res.status(400).json({ error: 'First Name, Last Name, and Phone are required.' });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email: email || 'NONE' }] }
    });
    if (existing) return res.status(400).json({ error: 'User with this phone/email already exists.' });

    const memberId = 'FH-' + Math.floor(1000 + Math.random() * 9000);
    const generatedToken = require('crypto').randomBytes(32).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          memberId, firstName, lastName, phone, email, gender, relationship, familyBranch,
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

    res.json({ valid: true, user: { firstName: invite.user.firstName, phone: invite.user.phone }});
  } catch(error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} with WebSockets enabled`));
