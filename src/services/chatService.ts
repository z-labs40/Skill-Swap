import api from '../lib/axios';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  type: 'text' | 'file' | 'voice' | 'call';
  file_url?: string;
  is_edited?: boolean;
  timestamp: string;
}

export const chatService = {
  getConversations: async (userId: string): Promise<any[]> => {
    const response = await api.get(`/chat/conversations/${userId}`);
    return response.data.data;
  },

  getMessages: async (userId: string, otherId: string): Promise<Message[]> => {
    const response = await api.get(`/chat/${userId}/${otherId}`);
    return response.data.data;
  },

  sendMessage: async (senderId: string, receiverId: string, message: string, type: string = 'text', fileUrl?: string) => {
    const response = await api.post('/chat/send', {
      senderId,
      receiverId,
      message,
      type,
      fileUrl
    });
    return response.data.data;
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/chat/message/${messageId}`);
    return response.data;
  },

  editMessage: async (messageId: string, newMessage: string) => {
    const response = await api.put(`/chat/message/${messageId}`, { newMessage });
    return response.data;
  },

  deleteConversation: async (userId: string, otherId: string) => {
    const response = await api.delete(`/chat/conversation/${userId}/${otherId}`);
    return response.data;
  }
};
