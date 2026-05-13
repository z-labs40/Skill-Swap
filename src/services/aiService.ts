import api from '../lib/axios';

export const aiService = {
  getSmartReplies: async (lastMessages: any[], currentUserName: string, partnerName: string) => {
    const response = await api.post('/ai/smart-replies', { lastMessages, currentUserName, partnerName });
    return response.data.data;
  },

  getAiAssistance: async (topic: string, context: string) => {
    const response = await api.post('/ai/assistance', { topic, context });
    return response.data.data;
  }
};
