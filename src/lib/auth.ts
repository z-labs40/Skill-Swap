import api from './axios';

export interface AuthState {
  isAuth: boolean;
  role: string | null;
  email: string | null;
  id: string | null;
  name: string | null;
}

export async function signupUser(name: string, email: string, password: string, dob: string, phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/auth/register', { name, email, password, dob, phone });
    if (response.data.success) {
      // Just returns success, meaning OTP was sent
      return { success: true };
    }
    return { success: false, error: 'Registration failed' };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || error.message || 'Registration failed' };
  }
}

export async function verifySignupOtp(email: string, otp: string, password?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/auth/register/verify-otp', { email, otp, password });
    if (response.data.success) {
      return { success: true };
    }
    return { success: false, error: 'Verification failed' };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.response?.data?.error || error.message || 'Verification failed' };
  }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem("isAuth", "true");
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("userEmail", response.data.user.email);
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("userName", response.data.user.name);
      localStorage.setItem("token", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
      return { success: true, role: response.data.role };
    }
    return { success: false, error: 'Login failed' };
  } catch (error: any) {
    return { success: false, error: error.error || error.message || 'Login failed' };
  }
}

export async function sendForgotPasswordOtp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/auth/forgot-password/send-otp', { email });
    return { success: response.data.success };
  } catch (error: any) {
    return { success: false, error: error.error || error.message || 'Failed to send OTP' };
  }
}

export async function verifyForgotPasswordOtp(email: string, otp: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/auth/forgot-password/verify-otp', { email, otp, newPassword });
    return { success: response.data.success };
  } catch (error: any) {
    return { success: false, error: error.error || error.message || 'Failed to verify OTP' };
  }
}

export function logoutUser(): void {

  localStorage.removeItem("isAuth");
  localStorage.removeItem("role");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

export function getAuthState(): AuthState {
  return {
    isAuth: localStorage.getItem("isAuth") === "true",
    role: localStorage.getItem("role"),
    email: localStorage.getItem("userEmail"),
    id: localStorage.getItem("userId"),
    name: localStorage.getItem("userName"),
  }
}


