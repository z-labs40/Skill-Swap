import api from '../lib/axios';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  offers: string[];
  seeks: string[];
  rating: number;
  status: string;
  ringtone_url?: string;
}

export const userService = {
  getProfile: async (id: string): Promise<UserProfile> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  updateProfile: async (id: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data.data;
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getStats: async (id: string) => {
    const response = await api.get(`/users/${id}/stats`);
    return response.data.data;
  },

  getIncomingRequests: async (id: string) => {
    const response = await api.get(`/users/${id}/incoming`);
    return response.data.data || [];
  },

  getSentRequests: async (id: string) => {
    const response = await api.get(`/users/${id}/sent`);
    return response.data.data || [];
  },

  sendSwapRequest: async (senderId: string, receiverId: string, skill: string) => {
    const response = await api.post('/swap/request', { senderId, receiverId, skill });
    return response.data.data;
  },

  acceptSwapRequest: async (requestId: string) => {
    const response = await api.patch(`/swap/request/${requestId}/accept`);
    return response.data.data;
  }
};

