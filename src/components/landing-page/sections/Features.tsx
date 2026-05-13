import React, { useState, useEffect } from "react"
import { Cpu, MessageCircle, Video, BarChart3, Sparkles, X, Edit3, Check } from "lucide-react"
import { useLandingContent } from "../../../hooks/useLandingContent"

const features = [
  {
    icon: <Cpu size={24} />,
    title: "Smart Skill Matching",
    description: "Our dynamic algorithm instantly finds the perfect skill-swap partner based on your needs and expertise.",
    fullDescription: (
      <div className="space-y-6 sm:space-y-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-red-400 mb-2 sm:mb-3 flex items-center gap-2">
            The Problem We Solve
          </h4>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">Finding a reliable learning partner is exhausting. Learners waste hours browsing forums, dealing with mismatched skill levels, timezone conflicts, and unreliable partners who ghost after the first session. The traditional search process is broken.</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-green-400 mb-2 sm:mb-3 flex items-center gap-2">
            The SkillBridge Solution
          </h4>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">Our advanced matching algorithm eliminates the guesswork. It instantly cross-references the specific skills you want to learn with the skills you can teach, pairing you with the perfect mentor or peer. By factoring in complementary skill sets and availability, we ensure every match is highly productive.</p>
        </div>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">Whether you need a quick 15-minute code review or a month-long mentorship in digital marketing, our platform ensures you connect with committed individuals, saving you countless hours and accelerating your personal growth.</p>
      </div>
    ),
    gradient: "from-yellow-500 to-orange-500",
    glow: "rgba(234,179,8,0.2)",
    tag: "Algorithm Driven",
    image: "/images/Smart-skill.png",
  },
  {
    icon: <MessageCircle size={24} />,
    title: "Real-time Chat",
    description: "Communicate instantly through our secure, end-to-end encrypted messaging system.",
    fullDescription: (
      <div className="space-y-6 sm:space-y-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-red-400 mb-2 sm:mb-3 flex items-center gap-2">
            The Problem We Solve
          </h4>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">Educational communication is often scattered across generic platforms like Discord, WhatsApp, or emails. This leads to lost resources, fragmented conversations, and a lack of focus when trying to keep track of shared code snippets or study materials.</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-green-400 mb-2 sm:mb-3 flex items-center gap-2">
            The SkillBridge Solution
          </h4>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">We built an encrypted chat system specifically for education. Keep your learning separate from your personal chats. Share code snippets with syntax highlighting, send files securely, and use voice notes to explain complex concepts seamlessly.</p>
        </div>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">Security and privacy are our top priorities. Every message and file transfer is secured with state-of-the-art end-to-end encryption. It's more than just a chat—it's your centralized, distraction-free hub for collaborative learning.</p>
      </div>
    ),
    gradient: "from-purple-500 to-indigo-500",
    glow: "rgba(139,92,246,0.2)",
    tag: "Encrypted",
    image: "/images/real-chat.png",
  },
  {
    icon: <Video size={24} />,
    title: "Video & Screen Share",
    description: "Crystal-clear video calls with screen sharing for hands-on, effective learning sessions.",
    fullDescription: (
      <div className="space-y-6 sm:space-y-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-red-400 mb-2 sm:mb-3 flex items-center gap-2">
            The Problem We Solve
          </h4>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">Using generic enterprise video tools for 1-on-1 peer learning is frustrating. They lack education-specific features, often suffer from high latency during screen shares, and make it difficult to collaborate on code or designs in real-time.</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-green-400 mb-2 sm:mb-3 flex items-center gap-2">
            The SkillBridge Solution
          </h4>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">Experience lag-free, high-definition video calls optimized for low-bandwidth environments. Our built-in collaborative whiteboards and ultra-low latency screen sharing make it feel like you are sitting right next to your learning partner.</p>
        </div>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">Visual communication bridges the gap in remote education. Show exactly where you are stuck in your code, or demonstrate a complex design technique live. You can even record sessions to review them later, ensuring no valuable knowledge is ever lost.</p>
      </div>
    ),
    gradient: "from-pink-500 to-rose-500",
    glow: "rgba(236,72,153,0.2)",
    tag: "HD Video",
    image: "/images/Screenshare.png",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Progress Tracking",
    description: "Track your growth with badges, skill levels, and detailed session analytics.",
    fullDescription: (
      <div className="space-y-6 sm:space-y-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-red-400 mb-2 sm:mb-3 flex items-center gap-2">
            The Problem We Solve
          </h4>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed">Without a structured way to track progress, learners quickly lose motivation. It's difficult to prove to employers or peers what you've actually learned or taught, leaving your hard work unverified and invisible.</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 sm:p-6">
          <h4 className="text-lg sm:text-xl font-bold text-green-400 mb-2 sm:mb-3 flex items-center gap-2">
            The SkillBridge Solution
          </h4>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">Visualize your learning journey with our comprehensive analytics dashboard. Track hours spent learning and teaching, monitor your skill progression over time, and let the platform hold you accountable to your personal milestones.</p>
        </div>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">Turn your dedication into tangible credentials. As you accumulate successful skill swaps, you unlock verified badges that you can directly showcase on your professional portfolio, elevating your status within our global community.</p>
      </div>
    ),
    gradient: "from-blue-500 to-cyan-500",
    glow: "rgba(59,130,246,0.2)",
    tag: "Analytics",
    image: "/images/tracking.png",
  },
]

interface FeaturesProps {
  isAdmin?: boolean;
}

export function Features({ isAdmin }: FeaturesProps) {
  const { content, setContent, saveContent } = useLandingContent();
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const handleFeatureClick = (feature: typeof features[0]) => {
    setSelectedFeature(feature);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedFeature(null);
      setIsClosing(false);
    }, 1000);
  };

  const startEdit = (field: string, value: string) => {
    setEditField(field);
    setTempValue(value);
  };

  const saveEdit = () => {
    const newContent = { ...content, [editField!]: tempValue };
    saveContent(newContent);
    setEditField(null);
  };

  useEffect(() => {
    if (selectedFeature) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedFeature]);

  return (
    <section id="features" className="relative py-24 bg-black/20">
      <div className="section-divider mb-16" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="skill-badge mb-4 inline-block">
            <Sparkles size={14} className="text-yellow-400" />
            Why Choose SkillBridge
          </span>

          <div className="relative group max-w-3xl mx-auto">
            {isAdmin && !editField && (
              <button
                onClick={() => startEdit('featuresTitle', content.featuresTitle)}
                className="absolute -left-12 top-0 p-2 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
              >
                <Edit3 size={16} />
              </button>
            )}
            {editField === 'featuresTitle' ? (
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
                {content.featuresTitle.includes("Level Up") ? (
                  <>
                    {content.featuresTitle.split("Level Up")[0]}
                    <span className="gradient-text">Level Up</span>
                    {content.featuresTitle.split("Level Up")[1]}
                  </>
                ) : content.featuresTitle}
              </h2>
            )}
          </div>

          <div className="relative group max-w-2xl mx-auto">
            {isAdmin && !editField && (
              <button
                onClick={() => startEdit('featuresSubtitle', content.featuresSubtitle)}
                className="absolute -left-12 top-0 p-2 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
              >
                <Edit3 size={16} />
              </button>
            )}
            {editField === 'featuresSubtitle' ? (
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
                {content.featuresSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="feature-card rounded-3xl p-6 group hover:border-white/20 transition-all flex flex-col h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}
                style={{ boxShadow: `0 8px 30px ${feature.glow}` }}
              >
                {feature.icon}
              </div>

              <span className="text-xs px-2 py-1 rounded-full font-medium mb-3 inline-block"
                style={{
                  background: feature.glow,
                  border: `1px solid ${feature.glow}`,
                  color: 'rgba(255,255,255,0.7)'
                }}>
                {feature.tag}
              </span>

              <h3 className="text-white font-bold text-lg mb-2 group-hover:gradient-text transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {feature.description}
              </p>

              <button
                onClick={() => handleFeatureClick(feature)}
                className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors cursor-pointer w-full text-left group/btn"
              >
                Explore Full Details <span className="group-hover:translate-x-1 group-hover/btn:translate-x-2 transition-transform">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider mt-16" />

      {/* Modal ... (omitted for brevity but kept in actual code) */}
      {selectedFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={handleClose} />
          <div className="relative w-[96vw] max-w-[1600px] h-[94vh] bg-[#0a0a1a] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10 animate-in fade-in zoom-in-95 duration-300">
            {isClosing ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a1a] animate-in fade-in duration-300">
                <div className="w-12 h-12 border-4 border-white/5 border-t-green-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-sm font-medium tracking-widest uppercase animate-pulse">Finalizing...</p>
              </div>
            ) : isLoading ? (
              <div className="flex w-full h-full">
                <div className="md:w-1/2 h-64 md:h-full bg-[#11111a] animate-pulse" />
                <div className="md:w-1/2 h-full p-8 md:p-12 lg:p-16 space-y-8">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl animate-pulse" />
                  <div className="w-3/4 h-12 bg-white/10 rounded animate-pulse" />
                  <div className="space-y-4">
                    <div className="w-full h-6 bg-white/5 rounded animate-pulse" />
                    <div className="w-full h-6 bg-white/5 rounded animate-pulse" />
                    <div className="w-1/2 h-6 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="md:w-1/2 h-56 sm:h-72 md:h-full relative bg-black flex items-center justify-center shrink-0">
                  <img src={selectedFeature.image} alt={selectedFeature.title} className="max-w-full max-h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a1a] hidden md:block" />
                </div>
                <div className="md:w-1/2 h-full p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-start relative overflow-y-auto">
                  <button onClick={handleClose} className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white z-50"><X size={20} /></button>
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 self-start rounded-[1.25rem] sm:rounded-[1.5rem] bg-gradient-to-br ${selectedFeature.gradient} flex items-center justify-center text-white mb-6 sm:mb-8 border border-white/20`} style={{ boxShadow: `0 10px 40px ${selectedFeature.glow}` }}>
                    <div className="scale-[1.2] sm:scale-[1.5] drop-shadow-md">{selectedFeature.icon}</div>
                  </div>
                  <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 sm:mb-8 leading-tight">{selectedFeature.title}</h3>
                  <div className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose text-justify font-light tracking-wide mb-10 whitespace-pre-wrap break-words">{selectedFeature.fullDescription}</div>
                  <div className="mt-auto pt-8 border-t border-white/10">
                    <button onClick={handleClose} className="gradient-btn px-8 py-4 rounded-xl font-bold text-white w-full sm:w-auto">Close & Continue</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
