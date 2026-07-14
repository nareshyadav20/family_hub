import axios from 'axios';

let rawEnv = import.meta.env.VITE_API_URL;
if (rawEnv) {
  if (rawEnv.endsWith('/')) rawEnv = rawEnv.slice(0, -1);
  if (rawEnv.endsWith('/api')) rawEnv += '/v1';
  else if (!rawEnv.endsWith('/v1')) rawEnv += '/api/v1';
}
const baseURL = rawEnv || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1' : 'https://family-hub-z48l.onrender.com/api/v1');

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  signup: async (data) => api.post('/auth/signup', data),
  login: async (credentials) => api.post('/auth/login', credentials),
};

export const memberService = {
  getMembers: async () => ({ data: [] }),
  addMember: async (data) => ({ data: {} }),
};

export const eventService = {
  getEvents: async () => ({ data: [] }),
  createEvent: async (data) => ({ data: {} }),
};

export const galleryService = {
  getAlbums: async () => ({ data: [] }),
  uploadMedia: async (data) => ({ data: {} }),
};

export const treeService = {
  getTreeData: async () => ({ data: [] }),
};

export const vaultService = {
  getDocuments: async () => ({ data: [] }),
  uploadDocument: async (data) => ({ data: {} }),
};

export const financeService = {
  getAssets: async () => ({ data: [] }),
};

export const propertyService = {
  getProperties: async () => ({ data: [] }),
};

export const notificationService = {
  getNotifications: async () => ({ data: [] }),
};

export const analyticsService = {
  getDashboardStats: async () => ({ data: {} }),
};

export default api;
