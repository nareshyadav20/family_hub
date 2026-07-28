const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getOAuth2Client = () => {
  const redirectUri = process.env.NODE_ENV === 'production' 
    ? process.env.GOOGLE_REDIRECT_URI_PROD 
    : process.env.GOOGLE_REDIRECT_URI_DEV;

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
};

const getAuthUrl = (state) => {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state: state, // Encode JWT or userId+familyId here
  });
};

const exchangeCodeForTokens = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

const getUserEmail = async (accessToken) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data.email;
};

// Auto refresh token helper
const getAuthenticatedClient = async (connection) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: Number(connection.expiryDate)
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await prisma.googleCalendarConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date || connection.expiryDate,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
        }
      });
    }
  });

  return oauth2Client;
};

const createGoogleEvent = async (connection, eventDetails) => {
  const auth = await getAuthenticatedClient(connection);
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: eventDetails.title,
    description: eventDetails.description,
    location: eventDetails.location,
    start: {
      dateTime: eventDetails.startTime,
      timeZone: eventDetails.timeZone || 'UTC',
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: eventDetails.timeZone || 'UTC',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'email', minutes: 24 * 60 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });

  return response.data;
};

const updateGoogleEvent = async (connection, googleEventId, eventDetails) => {
  const auth = await getAuthenticatedClient(connection);
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: eventDetails.title,
    description: eventDetails.description,
    location: eventDetails.location,
    start: {
      dateTime: eventDetails.startTime,
      timeZone: eventDetails.timeZone || 'UTC',
    },
    end: {
      dateTime: eventDetails.endTime,
      timeZone: eventDetails.timeZone || 'UTC',
    },
  };

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: googleEventId,
    resource: event,
  });

  return response.data;
};

const deleteGoogleEvent = async (connection, googleEventId) => {
  const auth = await getAuthenticatedClient(connection);
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: googleEventId,
  });
};

module.exports = {
  getAuthUrl,
  exchangeCodeForTokens,
  getUserEmail,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent
};
