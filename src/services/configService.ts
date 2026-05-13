import api from '../lib/axios';

export const configService = {
  getIceServers: async () => {
    try {
      const response = await api.get('/config/ice-servers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ICE servers:', error);
      // Fallback
      return [{ urls: 'stun:stun.l.google.com:19302' }];
    }
  }
};
