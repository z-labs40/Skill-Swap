import api from '../lib/axios';

export const aiService = {
  getSmartReplies: async (lastMessages: any[], currentUserName: string, partnerName: string) => {
    const response = await api.post('/ai/smart-replies', { lastMessages, currentUserName, partnerName });
    return response.data.data;
  },

  getAiAssistance: async (message: string, history: any[]) => {
    const response = await api.post('/ai/chat', { message, history });
    return response.data.data;
  }
};
