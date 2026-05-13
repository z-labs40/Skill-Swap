import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../../../hooks/useAuth"

// --- Inline SVG Icons ---
const GraduationCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
    <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
  </svg>
)

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Testimonials", href: "#testimonials" },
]

interface NavbarProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export function Navbar({ onLoginClick, onSignupClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <>
      <nav className="navbar fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img 
              src="/logo.png" 
              alt="SkillBridge Logo" 
              className="h-16 w-auto object-contain logo-blend" 
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors hover:text-purple-400"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {auth.isAuth ? (
              <>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  Logout
                </button>
                <button
                  onClick={() => navigate('/explore')}
                  className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  Explore
                </button>
                <button
                  onClick={() => navigate(auth.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')}
                  className="gradient-btn px-5 py-2 text-sm font-semibold text-white rounded-xl"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={onSignupClick}
                  className="gradient-btn px-5 py-2 text-sm font-semibold text-white rounded-xl"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="mobile-menu fixed inset-y-0 right-0 z-50 w-72 pt-20 px-6 flex flex-col shadow-2xl"
            >
              <div className="flex flex-col space-y-6 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-gray-300 hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-6 border-t border-white/10 space-y-3">
                  {auth.isAuth ? (
                    <>
                      <button
                        onClick={() => { navigate('/explore'); setMobileOpen(false); }}
                        className="w-full py-3 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                      >
                        Explore
                      </button>
                      <button
                        onClick={() => { navigate(auth.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'); setMobileOpen(false); }}
                        className="w-full py-3 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 gradient-btn text-sm font-semibold text-white rounded-xl"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { onLoginClick(); setMobileOpen(false) }}
                        className="w-full py-3 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => { onSignupClick(); setMobileOpen(false) }}
                        className="w-full py-3 gradient-btn text-sm font-semibold text-white rounded-xl"
                      >
                        Sign Up Free
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" 
              onClick={() => setMobileOpen(false)} 
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
