import React, { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { Eye, EyeOff, CheckCircle2, GraduationCap, Lock } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { useToast } from "../../context/ToastContext"
import { getAuthState } from "../../lib/auth"

// --- Loader Component ---
const Loader = ({ className = "w-5 h-5" }: { className?: string }) => (
  <div className={`${className} border-[3px] border-white/10 border-t-purple-500 rounded-full animate-spin shadow-[0_0_10px_rgba(168,85,247,0.3)]`} />
);

// --- ProtectedRoute Component ---
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuth, role } = getAuthState()
  if (!isAuth) {
    return <Navigate to="/" replace />
  }
  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// --- LoginCard Component ---
interface LoginCardProps {
  onSuccess?: () => void
  defaultTab?: "login" | "signup"
}

export function LoginCard({ onSuccess, defaultTab = "login" }: LoginCardProps) {
  const [tab, setTab] = useState<"login" | "signup" | "forgot" | "verify_signup">(defaultTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirm, setConfirm] = useState("")
  const [otp, setOtp] = useState("")
  const [dob, setDob] = useState("")
  const [phone, setPhone] = useState("")
  const [forgotStep, setForgotStep] = useState<1 | 2>(1) // 1: Email, 2: OTP & New Password
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { login, signup, verifySignup, sendForgotPassword, resetPassword } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()



  const handleAuth = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (tab === "forgot") {
      handleForgot()
      return
    }

    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    if (tab === "verify_signup") {
      if (!otp) {
        setError("Please enter the OTP.")
        return
      }
      setLoading(true)
      const res = await verifySignup(email, otp, password)
      setLoading(false)
      if (res.success) {
        setTab("login")
        setOtp("")
        showToast("Account verified successfully! Please login.", "success")
      } else {
        setError(res.error || "Verification failed")
      }
      return
    }

    if (tab === "signup") {
      if (!name) {
        setError("Please enter your name.")
        return
      }
      if (password !== confirm) {
        setError("Passwords do not match.")
        return
      }
      setLoading(true)
      const res = await signup(name, email, password, dob, phone)
      setLoading(false)
      if (res.success) {
        setTab("verify_signup")
        setError(null)
      } else {
        setError(res.error || "Signup failed")
      }
    } else {
      const res = await login(email, password)
      if (res.success) {
        setLoading(true)
        setTimeout(() => {
          if (onSuccess) onSuccess()
          if (res.role === "admin") {
            navigate("/admin")
          } else {
            navigate("/user")
          }
        }, 5000)
      } else {
        setError(res.error || "Login failed")
      }
    }


  }

  const handleForgot = async () => {
    if (forgotStep === 1) {
      if (!email) {
        setError("Please enter your email.")
        return
      }
      setLoading(true)
      const res = await sendForgotPassword(email)
      setLoading(false)
      if (res.success) {
        setForgotStep(2)
        setError(null)
        showToast("OTP sent to your email!", "success")
      } else {
        setError(res.error || "Failed to send OTP")
      }
    } else {
      if (!otp || !password || !confirm) {
        setError("Please fill in all fields.")
        return
      }
      if (password !== confirm) {
        setError("Passwords do not match.")
        return
      }
      
      setLoading(true)
      const res = await resetPassword(email, otp, password)
      setLoading(false)
      if (res.success) {
        setTab("login")
        setForgotStep(1)
        setError(null)
        setOtp("")
        setPassword("")
        setConfirm("")
        showToast("Password reset successfully! Please login.", "success")
      } else {
        setError(res.error || "Failed to reset password")
      }
    }
  }

  return (
    <div className="login-card relative w-full max-w-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 z-10 mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shadow-xl">
            {loading ? (
              <Loader className="w-8 h-8 text-purple-400 animate-spin" />
            ) : tab === "forgot" ? (
              <Lock className="w-8 h-8 text-purple-400" />
            ) : (
              <GraduationCap className="w-8 h-8 text-purple-400" />
            )}
          </div>
        </div>
        <h2 className="text-2xl font-black text-white">
          {tab === "login" ? "Welcome Back!" : tab === "signup" ? "Join SkillBridge" : tab === "verify_signup" ? "Verify Email" : "Reset Password"}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {tab === "login"
            ? "Sign in to continue your learning journey"
            : tab === "signup"
              ? "Start swapping skills for free"
              : tab === "verify_signup"
                ? "Enter the 6-digit OTP sent to your email"
              : forgotStep === 1
                ? "Enter your email to receive an OTP"
                : "Enter OTP and your new password"}
        </p>
      </div>


      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-3">
        {tab === "forgot" ? (
          <>
            {forgotStep === 1 ? (
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                disabled={loading}
              />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  className="auth-input w-full px-4 py-3 rounded-xl text-sm text-center tracking-[0.2em] sm:tracking-[0.5em] font-bold"
                  disabled={loading}
                />
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="auth-input w-full px-4 py-3 rounded-xl text-sm pr-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-black/5 transition-all"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="auth-input w-full px-4 py-3 rounded-xl text-sm pr-12"
                    disabled={loading}
                  />
                  {confirm && password === confirm && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in duration-300">
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-white/5 transition-all"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="text-red-400 text-[10px] ml-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    Passwords do not match
                  </p>
                )}
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-white mt-5 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader className="animate-spin" />}
              {forgotStep === 1 ? "Send OTP" : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => { setTab("login"); setForgotStep(1); setError(null); }}
              className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors"
              disabled={loading}
            >
              Back to Login
            </button>
          </>
        ) : tab === "verify_signup" ? (
          <>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              className="auth-input w-full px-4 py-3 rounded-xl text-sm text-center tracking-[0.2em] sm:tracking-[0.5em] font-bold"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-white mt-5 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader className="animate-spin" />}
              Verify Account
            </button>
            <button
              type="button"
              onClick={() => { setTab("signup"); setError(null); }}
              className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors"
              disabled={loading}
            >
              Back to Sign Up
            </button>
          </>
        ) : (
          <>
            {tab === "signup" && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                disabled={loading}
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="auth-input w-full px-4 py-3 rounded-xl text-sm"
              disabled={loading}
            />
            {tab === "signup" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                  disabled={loading}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>
            )}
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="auth-input w-full px-4 py-3 rounded-xl text-sm pr-12"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-black/5 transition-all"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {tab === "signup" && (
              <>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="auth-input w-full px-4 py-3 rounded-xl text-sm pr-12"
                    disabled={loading}
                  />
                  {confirm && password === confirm && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in duration-300">
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-black/5 transition-all"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="text-red-400 text-[10px] ml-2 animate-in fade-in slide-in-from-top-1 duration-200 mt-1">
                    Passwords do not match
                  </p>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-white mt-5 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader className="animate-spin" />}
              {tab === "login" ? "Continue" : "Create Account"}
            </button>
          </>
        )}
      </form>

      {tab === "login" && (
        <div className="text-right mt-2">
          <button
            type="button"
            onClick={() => { setTab("forgot"); setError(null); }}
            className="text-purple-400 text-xs hover:text-purple-300"
          >
            Forgot password?
          </button>
        </div>
      )}

      {tab !== "forgot" && tab !== "verify_signup" && (
        <p className="text-center text-gray-500 text-xs mt-5">
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(null); }}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            {tab === "login" ? "Sign up free" : "Log in"}
          </button>
        </p>
      )}
    </div>
  )
}

// --- AuthDialog Component ---
interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "signup"
}

export function AuthDialog({ isOpen, onClose, defaultTab = "login" }: AuthDialogProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all z-20"
        >
          ✕
        </button>
        <LoginCard onSuccess={onClose} defaultTab={defaultTab} />
      </div>
    </div>
  )
}
