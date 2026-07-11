import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
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
};

export const eventService = {
  getEvents: async () => ({ data: [] }),
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
};

export const financeService = {
  getAssets: async () => ({ data: [] }),
};

export const notificationService = {
  getNotifications: async () => ({ data: [] }),
};

export default api;
