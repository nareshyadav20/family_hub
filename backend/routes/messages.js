const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

router.use(authMiddleware);

// Get conversations list (latest message per user)
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const contacts = await prisma.user.findMany({
        where: { id: { not: userId } },
        select: { id: true, firstName: true, lastName: true, avatar: true }
    });
    
    const conversations = [];
    for (const contact of contacts) {
        const lastMsg = await prisma.message.findFirst({
            where: {
                OR: [
                    { senderId: userId, receiverId: contact.id },
                    { senderId: contact.id, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        
        conversations.push({
            id: contact.id,
            name: `${contact.firstName} ${contact.lastName}`.trim(),
            initials: contact.firstName.charAt(0) + (contact.lastName ? contact.lastName.charAt(0) : ''),
            avatar: contact.avatar,
            color: 'bg-indigo-500',
            lastMsg: lastMsg ? lastMsg.text : 'Click to start chatting',
            time: lastMsg ? lastMsg.createdAt : null,
            unread: 0,
            online: true 
        });
    }
    
    // Sort by latest message
    conversations.sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return new Date(b.time) - new Date(a.time);
    });
    
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a specific user
router.get('/:contactId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactId } = req.params;
    
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: contactId },
                { senderId: contactId, receiverId: userId }
            ]
        },
        orderBy: { createdAt: 'asc' }
    });
    
    res.json(messages.map(m => ({
        id: m.id,
        sender: m.senderId === userId ? 'me' : 'them',
        text: m.text,
        time: m.createdAt,
        mine: m.senderId === userId
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { receiverId, text } = req.body;
    
    const message = await prisma.message.create({
        data: {
            senderId: userId,
            receiverId,
            text
        }
    });

    const io = req.app.get('socketio');
    io.emit(`message.new.${receiverId}`, {
        id: message.id,
        sender: 'them',
        senderId: userId,
        text,
        time: message.createdAt,
        mine: false
    });
    
    res.json({
        id: message.id,
        sender: 'me',
        text: message.text,
        time: message.createdAt,
        mine: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
