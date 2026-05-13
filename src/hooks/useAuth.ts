import { useState, useCallback, useEffect } from "react"
import { getAuthState, loginUser, signupUser, verifySignupOtp, logoutUser, AuthState, sendForgotPasswordOtp, verifyForgotPasswordOtp } from "../lib/auth"

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(getAuthState)

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password)
    if (result.success) {
      setAuth(getAuthState())
    }
    return result
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string, dob: string, phone: string) => {
    const result = await signupUser(name, email, password, dob, phone)
    return result
  }, [])

  const verifySignup = useCallback(async (email: string, otp: string, password?: string) => {
    const result = await verifySignupOtp(email, otp, password)
    return result
  }, [])

  const sendForgotPassword = useCallback(async (email: string) => {
    return await sendForgotPasswordOtp(email)
  }, [])

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    return await verifyForgotPasswordOtp(email, otp, newPassword)
  }, [])

  const logout = useCallback(() => {
    logoutUser()
    setAuth(getAuthState())
    window.dispatchEvent(new Event('storage'))
  }, [])

  useEffect(() => {
    const syncAuth = () => setAuth(getAuthState());
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  return { auth, login, signup, verifySignup, sendForgotPassword, resetPassword, logout }
}


