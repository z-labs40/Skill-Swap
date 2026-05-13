import api from './axios';

// Content Service & Support utility — fetching from backend API

export async function getLandingContent(): Promise<any> {
  try {
    const response = await api.get('/landing');
    return response.data.data;
  } catch (err) {
    console.error('Failed to fetch landing content', err);
    return null;
  }
}

export async function updateLandingContent(content: any): Promise<void> {
  try {
    await api.put('/landing', content);
  } catch (err) {
    console.error('Failed to update landing content', err);
  }
}

export async function sendSupportMessage(email: string, message: string): Promise<void> {
  try {
    await api.post('/support', { userEmail: email, message });
  } catch (err) {
    console.error('Failed to send support message', err);
  }
}

export async function getSupportMessages(): Promise<any[] | null> {
  try {
    const response = await api.get('/support');
    return response.data.data;
  } catch (err) {
    console.error('Failed to fetch support messages', err);
    return null;
  }
}

export async function replyToMessage(id: string, replyText: string): Promise<void> {
  try {
    await api.patch(`/support/${id}/reply`, { reply: replyText });
  } catch (err) {
    console.error('Failed to reply to support message', err);
  }
}

