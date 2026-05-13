import React, { useState, useEffect } from "react"
import { UserCircle, Target, Users, Rocket, Map, ChevronRight, Code2, Terminal, Music, PenTool, Globe, Camera, PenLine, Film, Brain, Smartphone, Utensils, Headphones, Edit3, Check } from "lucide-react"
import { useLandingContent } from "../../../hooks/useLandingContent"

const steps = [
  {
    number: "01",
    icon: <UserCircle size={32} />,
    title: "Create Your Profile",
    description: "Sign up in 30 seconds. Add your name, photo, and a short bio about your background.",
    color: "from-purple-600 to-purple-800",
    glow: "rgba(139,92,246,0.4)",
  },
  {
    number: "02",
    icon: <Target size={32} />,
    title: "Add Your Skills",
    description: "List what you can teach (e.g. React, Guitar) and what you want to learn (e.g. Spanish, Design).",
    color: "from-blue-600 to-blue-800",
    glow: "rgba(59,130,246,0.4)",
  },
  {
    number: "03",
    icon: <Users size={32} />,
    title: "Get Matched",
    description: "Our smart algorithm finds your perfect skill-swap partner within seconds.",
    color: "from-pink-600 to-pink-800",
    glow: "rgba(236,72,153,0.4)",
  },
  {
    number: "04",
    icon: <Rocket size={32} />,
    title: "Start Learning",
    description: "Chat, video call, and screen share. Learn together and track your mutual progress.",
    color: "from-orange-500 to-orange-700",
    glow: "rgba(249,115,22,0.4)",
  },
]

const skillsData = [
  { name: "React", icon: <Code2 size={18} /> },
  { name: "Python", icon: <Terminal size={18} /> },
  { name: "Guitar", icon: <Music size={18} /> },
  { name: "UI Design", icon: <PenTool size={18} /> },
  { name: "Spanish", icon: <Globe size={18} /> },
  { name: "Photography", icon: <Camera size={18} /> },
  { name: "Copywriting", icon: <PenLine size={18} /> },
  { name: "Video Editing", icon: <Film size={18} /> },
  { name: "Machine Learning", icon: <Brain size={18} /> },
  { name: "Piano", icon: <Headphones size={18} /> },
  { name: "Flutter", icon: <Smartphone size={18} /> },
  { name: "Cooking", icon: <Utensils size={18} /> },
]

interface HowItWorksProps {
  isAdmin?: boolean;
}

export function HowItWorks({ isAdmin }: HowItWorksProps) {
  const { content, setContent, saveContent } = useLandingContent();
  const [scrollPos, setScrollPos] = useState(0);
  const [editField, setEditField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrollPos(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <section id="how-it-works" className="relative py-24">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="skill-badge mb-4 inline-block">
            <Map size={14} />
            Simple Process
          </span>

          <div className="relative group max-w-3xl mx-auto">
            {isAdmin && !editField && (
              <button
                onClick={() => startEdit('howItWorksTitle', content.howItWorksTitle)}
                className="absolute -left-12 top-0 p-2 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
              >
                <Edit3 size={16} />
              </button>
            )}
            {editField === 'howItWorksTitle' ? (
              <div className="flex items-start gap-2 mb-4">
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="flex-1 bg-white/5 border border-purple-500 rounded-xl p-4 text-3xl md:text-4xl font-black text-white focus:outline-none"
                  rows={2}
                />
                <button onClick={saveEdit} className="p-4 bg-green-600 rounded-xl text-white"><Check size={24} /></button>
              </div>
            ) : (
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                {content.howItWorksTitle.includes("4 Easy Steps") ? (
                  <>
                    {content.howItWorksTitle.split("4 Easy Steps")[0]}
                    <span className="gradient-text">4 Easy Steps</span>
                    {content.howItWorksTitle.split("4 Easy Steps")[1]}
                  </>
                ) : content.howItWorksTitle}
              </h2>
            )}
          </div>

          <div className="relative group max-w-2xl mx-auto">
            {isAdmin && !editField && (
              <button
                onClick={() => startEdit('howItWorksSubtitle', content.howItWorksSubtitle)}
                className="absolute -left-12 top-0 p-2 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
              >
                <Edit3 size={16} />
              </button>
            )}
            {editField === 'howItWorksSubtitle' ? (
              <div className="flex items-start gap-2">
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="flex-1 bg-white/5 border border-purple-500 rounded-xl p-4 text-lg text-gray-400 focus:outline-none"
                  rows={2}
                />
                <button onClick={saveEdit} className="p-4 bg-green-600 rounded-xl text-white"><Check size={24} /></button>
              </div>
            ) : (
              <p className="text-gray-400 text-lg mx-auto">
                {content.howItWorksSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-purple-600/30 via-blue-500/30 to-orange-500/30 z-0">
            <div className="absolute top-1/2 -translate-y-1/2 flex items-center animate-travel-line -ml-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-white" />
              <ChevronRight size={20} className="text-white drop-shadow-[0_0_8px_#fff] -ml-2" />
            </div>
          </div>

          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`step-card rounded-3xl p-5 sm:p-6 relative group cursor-pointer transition-all duration-300 hover:!opacity-100 ${index === 3 ? 'animate-win-pop z-30' : 'animate-sequence-glow z-10'}`}
              style={index === 3 ? {} : { animationDelay: `-${6 - (index * 1.5)}s` }}
            >
              {index === 3 && (
                <div className="absolute -top-6 sm:-top-8 -right-4 sm:-right-6 bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 text-white font-black px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-[1.5rem] shadow-[0_15px_40px_rgba(239,68,68,0.6)] z-50 border-2 border-white/40 whitespace-nowrap pointer-events-none backdrop-blur-xl animate-win-pop-text scale-75 sm:scale-100">
                  <span className="text-xl sm:text-2xl drop-shadow-lg tracking-widest uppercase">Ready! 🚀</span>
                </div>
              )}
              <div className="absolute top-4 right-4 text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                {step.number}
              </div>
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-5 relative`}
                style={{ boxShadow: `0 8px 30px ${step.glow}` }}
              >
                {step.icon}
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:flex w-6 h-6 rounded-full border-2 border-purple-500/50 bg-black items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:border-purple-400 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.8)] z-20">
                  <div className={`w-2 h-2 rounded-full transition-colors duration-300 group-hover:bg-white ${index === 3 ? 'bg-orange-500' : 'bg-purple-500'}`} />
                </div>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              <div className="mt-4 inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 font-bold">{index + 1}</span>
                <span className="text-gray-500 text-xs">Step {step.number}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 sm:mt-64 text-center" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", width: "100vw" }}>
          <p className="gradient-text font-black text-xs sm:text-sm uppercase tracking-[0.2em] mb-8 sm:mb-16 px-4">Popular skills being swapped right now</p>
          <div className="overflow-hidden relative py-8 sm:py-16" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)" }}>
            <div className="flex gap-4 sm:gap-6" style={{ width: "max-content", transform: `translateX(calc(0% - ${scrollPos * 0.4}px))`, transition: "transform 0.1s linear" }}>
              {[...skillsData, ...skillsData, ...skillsData, ...skillsData, ...skillsData, ...skillsData].map((skill, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-[#111122]/80 backdrop-blur-sm border border-white/10 text-gray-300 cursor-pointer hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-white transition-colors duration-300 select-none" style={{ animation: `snake-wiggle 3.5s ease-in-out infinite`, animationDelay: `${(index % 12) * 0.2}s`, flexShrink: 0 }}>
                  <div className="text-purple-400">{skill.icon}</div>
                  <span className="font-bold tracking-wide whitespace-nowrap">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
