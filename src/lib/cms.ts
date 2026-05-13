import { fetchApi } from './api';
import { LandingContent, SupportMessage } from '../types';

// CMS & Support utility — fetching from backend API

export async function getLandingContent(): Promise<any> {
  try {
    const data = await fetchApi('/landing');
    return data.data;
  } catch (err) {
    console.error('Failed to fetch landing content', err);
    return null;
  }
}

export async function updateLandingContent(content: any): Promise<void> {
  try {
    await fetchApi('/landing', {
      method: 'PUT',
      body: JSON.stringify(content)
    });
  } catch (err) {
    console.error('Failed to update landing content', err);
  }
}

export async function sendSupportMessage(email: string, message: string): Promise<void> {
  try {
    await fetchApi('/support', {
      method: 'POST',
      body: JSON.stringify({ userEmail: email, message })
    });
  } catch (err) {
    console.error('Failed to send support message', err);
  }
}

export async function getSupportMessages(): Promise<any[]> {
  try {
    const data = await fetchApi('/support');
    return data.data;
  } catch (err) {
    console.error('Failed to fetch support messages', err);
    return [];
  }
}

export async function replyToMessage(id: string, replyText: string): Promise<void> {
  try {
    await fetchApi(`/support/${id}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ reply: replyText })
    });
  } catch (err) {
    console.error('Failed to reply to support message', err);
  }
}
