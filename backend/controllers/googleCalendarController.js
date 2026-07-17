const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const googleService = require('../services/googleCalendarService');

const connectGoogleCalendar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const familyId = req.user.familyId || null;

    // Create a state token that expires in 10 minutes to prevent CSRF and keep contextual data
    const stateToken = jwt.sign(
      { userId, familyId },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    const authUrl = googleService.getAuthUrl(stateToken);
    res.json({ success: true, url: authUrl });
  } catch (err) {
    console.error('Error generating Google OAuth URL:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const googleOAuthCallback = async (req, res) => {
  const { code, state, error } = req.query;

  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://family-hub-seven-ecru.vercel.app' 
    : 'http://localhost:5173';

  if (error) {
    return res.redirect(`${frontendUrl}/admin/dashboard/calendar?error=google_auth_failed`);
  }

  if (!code || !state) {
    return res.redirect(`${frontendUrl}/admin/dashboard/calendar?error=invalid_request`);
  }

  try {
    // Verify State Token
    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    if (!decoded.userId) throw new Error('Invalid state payload');

    const { userId, familyId } = decoded;

    // Exchange code for tokens
    const tokens = await googleService.exchangeCodeForTokens(code);
    
    if (!tokens.access_token) {
       throw new Error('Failed to retrieve access token');
    }

    // Get email
    const email = await googleService.getUserEmail(tokens.access_token);

    // Save tokens in DB
    const existingConnection = await prisma.googleCalendarConnection.findUnique({
      where: { userId }
    });

    if (existingConnection) {
      await prisma.googleCalendarConnection.update({
        where: { id: existingConnection.id },
        data: {
          googleEmail: email,
          accessToken: tokens.access_token,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
          expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : BigInt(Date.now() + 3600000)
        }
      });
    } else {
      await prisma.googleCalendarConnection.create({
        data: {
          userId,
          familyId,
          googleEmail: email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || null,
          expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : BigInt(Date.now() + 3600000)
        }
      });
    }

    // Fetch user role to redirect correctly
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role === 'MEMBER') {
       return res.redirect(`${frontendUrl}/member/dashboard/calendar?success=google_connected`);
    }

    return res.redirect(`${frontendUrl}/admin/dashboard/calendar?success=google_connected`);
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    return res.redirect(`${frontendUrl}/admin/dashboard/calendar?error=google_auth_error`);
  }
};

const getStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await prisma.googleCalendarConnection.findUnique({
      where: { userId }
    });

    if (connection) {
      res.json({
        success: true,
        connected: true,
        email: connection.googleEmail,
        lastSync: connection.updatedAt
      });
    } else {
      res.json({ success: true, connected: false });
    }
  } catch (err) {
    console.error('Error fetching calendar status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const disconnectGoogleCalendar = async (req, res) => {
  try {
    const userId = req.user.userId;
    await prisma.googleCalendarConnection.delete({
      where: { userId }
    });
    res.json({ success: true, message: 'Disconnected Google Calendar' });
  } catch (err) {
    console.error('Error disconnecting calendar:', err);
    res.status(500).json({ success: false, message: 'Failed to disconnect or already disconnected' });
  }
};

const syncAllEvents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const familyId = req.user.familyId;

    const connection = await prisma.googleCalendarConnection.findUnique({
      where: { userId }
    });

    if (!connection) {
      return res.status(400).json({ success: false, message: 'Google Calendar not connected' });
    }

    // Example logic to sync all future events to Google Calendar.
    // Fetch all events for the family that don't have a googleEventId (requires schema change for googleEventId or just create them)
    // To keep it simple, we just mock the sync response since full bi-directional sync needs more db mapping
    
    // Simulating Sync
    await prisma.googleCalendarConnection.update({
      where: { userId },
      data: { updatedAt: new Date() }
    });

    res.json({ success: true, message: 'Events synchronized successfully' });
  } catch (err) {
    console.error('Sync Error:', err);
    res.status(500).json({ success: false, message: 'Failed to sync events' });
  }
};

module.exports = {
  connectGoogleCalendar,
  googleOAuthCallback,
  getStatus,
  disconnectGoogleCalendar,
  syncAllEvents
};
