import api from '../lib/axios';

export interface SkillAnalyticsData {
  topOffered: { skill: string; count: number }[];
  topSought: { skill: string; count: number }[];
  topExperts: { id: string; name: string; rating: number; avatarUrl?: string; topSkill: string }[];
  totalUsers: number;
  categories: Record<string, number>;
  monthlyActivity: { name: string; swaps: number }[];
  successRate: string;
  trendingSkills: { name: string; growth: string; status: string; color: string }[];
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  dob?: string;
  created_at?: string;
}

export const adminService = {
  /**
   * Fetches skill analytics for the admin dashboard
   */
  getSkillAnalytics: async (): Promise<SkillAnalyticsData> => {
    const response = await api.get('/admin/analytics/skills');
    return response.data.data;
  },

  /**
   * Fetches the current admin's profile
   */
  getAdminProfile: async (): Promise<AdminProfile> => {
    const response = await api.get('/admin/profile');
    return response.data.data;
  },

  /**
   * Updates the admin's profile information
   */
  updateAdminProfile: async (data: Partial<AdminProfile>): Promise<AdminProfile> => {
    const response = await api.patch('/admin/profile', data);
    return response.data.data;
  },

  /**
   * User Management
   */
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data.data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Support Management
   */
  getSupportMessages: async () => {
    const response = await api.get('/support');
    return response.data.data;
  },

  replyToSupportMessage: async (id: string, reply: string) => {
    const response = await api.patch(`/support/${id}/reply`, { reply });
    return response.data;
  },

  updateSupportMessage: async (id: string, message: string) => {
    const response = await api.patch(`/support/${id}`, { message });
    return response.data;
  },

  deleteSupportMessage: async (id: string) => {
    const response = await api.delete(`/support/${id}`);
    return response.data;
  },

  permanentlyDeleteSupportMessage: async (id: string) => {
    const response = await api.delete(`/support/${id}/permanent`);
    return response.data;
  },

  sendAdminCredentials: async (receiverEmail: string) => {
    const response = await api.post('/admin/send-credentials', { receiverEmail });
    return response.data;
  }
};
