import React, { useState, useEffect } from "react"
import {
  Sparkles,
  Rocket,
  Users,
  GraduationCap,
  Star,
  Gift,
  Play,
  ArrowRight,
  ArrowLeft,
  Zap,
  PartyPopper,
  Edit3,
  Check
} from "lucide-react"
import arjunAvatar from "../../../assets/avatars/arjun.png"
import priyaAvatar from "../../../assets/avatars/priya.png"
import { useLandingContent } from "../../../hooks/useLandingContent"

const ProgressNumber = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-2">
        <span className="text-gray-400 font-medium uppercase tracking-tight">Session Progress</span>
        <span className="text-purple-400 font-bold">{count}%</span>
      </div>
      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px] relative">
        <div
          className="h-full rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all duration-75 ease-linear"
          style={{ width: `${count}%`, background: 'linear-gradient(90deg,#7c3aed,#3b82f6)' }}
        >
          <div className="absolute inset-0 shimmer-effect opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

interface HeroProps {
  onGetStarted: () => void
  isAdmin?: boolean
}

export function Hero({ onGetStarted, isAdmin }: HeroProps) {
  const { content, setContent, saveContent } = useLandingContent();
  const [editField, setEditField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const startEdit = (field: string, value: string) => {
    setEditField(field);
    setTempValue(value);
  };

  const saveEdit = () => {
    const newContent = { ...content, [editField!]: tempValue };
    saveContent(newContent);
    setEditField(null);
  };

  return (
    <section id="home" className="hero-bg grid-overlay relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl orb-1" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl orb-2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl orb-3 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="relative">
            {/* Badge */}
            <div className="fade-in-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <span className="skill-badge whitespace-nowrap">
                <Sparkles size={14} className="text-yellow-400" />
                The #1 Skill Swap Platform
              </span>
              <span className="skill-badge whitespace-nowrap" style={{ background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                <Rocket size={14} />
                50K+ Members
              </span>
            </div>

            {/* Heading */}
            <div className="relative group">
              {isAdmin && !editField && (
                <button
                  onClick={() => startEdit('heroTitle', content.heroTitle)}
                  className="absolute -left-12 top-0 p-2 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
                >
                  <Edit3 size={16} />
                </button>
              )}
              {editField === 'heroTitle' ? (
                <div className="flex items-start gap-2 mb-6">
                  <textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 bg-white/5 border border-purple-500 rounded-xl p-4 text-3xl md:text-4xl font-black text-white focus:outline-none"
                    rows={2}
                  />
                  <button onClick={saveEdit} className="p-4 bg-green-600 rounded-xl text-white"><Check size={24} /></button>
                </div>
              ) : (
                <h1 className="fade-in-2 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight">
                  {content?.heroTitle?.includes("Skills.") ? (
                    <>
                      {content.heroTitle.split("Skills.")[0]}
                      <span className="gradient-text">Skills.</span>
                      {content.heroTitle.split("Skills.")[1]}
                    </>
                  ) : (content?.heroTitle || "Exchange Skills. Learn Anything.")}
                </h1>
              )}
            </div>

            {/* Subtext */}
            <div className="relative group">
              {isAdmin && !editField && (
                <button
                  onClick={() => startEdit('heroSubtitle', content.heroSubtitle)}
                  className="absolute -left-12 top-0 p-2 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
                >
                  <Edit3 size={16} />
                </button>
              )}
              {editField === 'heroSubtitle' ? (
                <div className="flex items-start gap-2 mb-10">
                  <textarea
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 bg-white/5 border border-purple-500 rounded-xl p-4 text-lg text-gray-300 focus:outline-none"
                    rows={3}
                  />
                  <button onClick={saveEdit} className="p-4 bg-green-600 rounded-xl text-white"><Check size={24} /></button>
                </div>
              ) : (
                <p className="fade-in-3 text-lg text-gray-400 leading-relaxed mb-10 max-w-lg">
                  {content.heroSubtitle}
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="fade-in-4 flex flex-wrap gap-4 relative group">
              {isAdmin && !editField && (
                <button
                  onClick={() => startEdit('heroCta', content.heroCta)}
                  className="absolute -left-12 top-2 p-2 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
                >
                  <Edit3 size={16} />
                </button>
              )}
              {editField === 'heroCta' ? (
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="bg-white/5 border border-purple-500 rounded-xl px-4 py-3 text-white focus:outline-none"
                  />
                  <button onClick={saveEdit} className="p-3 bg-green-600 rounded-xl text-white"><Check size={20} /></button>
                </div>
              ) : (
                <button
                  onClick={onGetStarted}
                  className="gradient-btn px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-white text-base sm:text-lg flex items-center gap-2 group shrink-0"
                >
                  {content.heroCta}
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </button>
              )}
              <a
                href="#features"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-gray-300 text-base sm:text-lg border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 shrink-0"
              >
                <Play size={16} className="fill-current" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Trust Bar */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 fade-in-4">
              <div className="flex -space-x-3">
                {[arjunAvatar, priyaAvatar, arjunAvatar, priyaAvatar].map((src, i) => (
                  <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-purple-900 overflow-hidden bg-gray-800">
                    <img src={src} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-purple-900 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
                  +50k
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-white font-semibold text-sm">Joined by 50,000+ learners</div>
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-gray-400 text-[10px] ml-1">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Visual Card */}
          <div className="hidden lg:block relative">
            {/* Main skill swap illustration */}
            <div className="login-card rounded-[32px] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-2xl rounded-full" />

              <div className="text-center mb-10">
                <h3 className="text-xl font-bold text-white mb-1">Live Skill Swap Session</h3>
                <p className="text-gray-400 text-sm font-medium">React Developer <span className="text-purple-400">↔</span> UI Designer</p>
              </div>

              {/* Two users */}
              <div className="flex items-center justify-between mb-10 relative">

                <div className="text-center relative z-10">
                  <div className="w-20 h-20 rounded-2xl border-2 border-purple-500/30 p-1 bg-white/5 mb-3">
                    <img src={arjunAvatar} alt="Arjun K." className="w-full h-full object-cover rounded-xl shadow-2xl" />
                  </div>
                  <div className="text-white font-bold text-sm">Arjun K.</div>
                  <div className="skill-badge mt-2 bg-purple-500/10 border-purple-500/20 text-purple-400">React Dev</div>
                </div>

                <div className="flex-1 px-4 relative z-10 flex flex-col justify-center gap-10 h-24 min-w-[200px]">
                  <div className="relative w-full h-4">
                    <div className="animate-swap-right flex flex-col items-center absolute top-1/2 -translate-y-1/2">
                      <span className="text-[9px] font-black text-purple-400 mb-1 uppercase tracking-tighter bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">React</span>
                      <ArrowRight size={16} className="text-purple-400" />
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        Skill<span className="gradient-text">Bridge</span>
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full h-4">
                    <div className="animate-swap-left flex flex-col items-center absolute top-1/2 -translate-y-1/2">
                      <ArrowLeft size={16} className="text-pink-400" />
                      <span className="text-[9px] font-black text-pink-400 mt-1 uppercase tracking-tighter bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">UI Design</span>
                    </div>
                  </div>
                </div>

                <div className="text-center relative z-10">
                  <div className="w-20 h-20 rounded-2xl border-2 border-pink-500/30 p-1 bg-white/5 mb-3">
                    <img src={priyaAvatar} alt="Priya M." className="w-full h-full object-cover rounded-xl shadow-2xl" />
                  </div>
                  <div className="text-white font-bold text-sm">Priya M.</div>
                  <div className="skill-badge mt-2 bg-pink-500/10 border-pink-500/20 text-pink-400">UI Design</div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-3 mb-8">
                <ProgressNumber />
              </div>

              {/* Live stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { val: "2h 15m", label: "Session Time", color: "text-purple-400" },
                  { val: "4.9★", label: "Rating", color: "text-yellow-400" },
                  { val: "12", label: "Sessions Done", color: "text-blue-400" },
                ].map((stat) => (
                  <div key={stat.label} className="stat-card p-4 text-center border-white/5 bg-white/[0.02]">
                    <div className={`font-bold text-base ${stat.color}`}>{stat.val}</div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wide mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Live indicator */}
              <div className="flex items-center justify-center gap-2 mt-8 py-2 px-4 rounded-full bg-green-500/5 border border-green-500/10 w-fit mx-auto">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">Live session in progress</span>
              </div>
            </div>

            {/* Floating mini cards */}
            <div className="absolute -top-6 -right-6 glass rounded-2xl p-4 flex items-center gap-3 animate-bounce-slow">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <PartyPopper size={20} />
              </div>
              <div>
                <div className="text-white text-xs font-bold">Match Found!</div>
                <div className="text-gray-400 text-[10px]">Python <span className="text-purple-400">↔</span> Spanish</div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Zap size={20} className="fill-yellow-400" />
              </div>
              <div>
                <div className="text-white text-xs font-bold">120 online now</div>
                <div className="text-gray-400 text-[10px]">Ready to swap skills</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "50K+", label: "Active Users", icon: <Users className="text-purple-400" /> },
            { value: "200+", label: "Skills Available", icon: <GraduationCap className="text-blue-400" /> },
            { value: "4.9★", label: "Average Rating", icon: <Star className="text-yellow-400 fill-yellow-400" /> },
            { value: "100%", label: "Free to Use", icon: <Gift className="text-pink-400" /> },
          ].map((stat, i) => (
            <div key={stat.label} className="stat-card p-6 text-center rounded-[24px] border-white/5 hover:bg-white/[0.03]">
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className="text-3xl font-black gradient-text mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
