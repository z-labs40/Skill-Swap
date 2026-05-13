import React, { useState, useEffect } from "react"
import { Star, MessageSquare, ChevronLeft, ChevronRight, Edit3, Check } from "lucide-react"
import priyaSharmaAvatar from "../../../assets/avatars/priya_sharma.png"
import rahulVermaAvatar from "../../../assets/avatars/rahul_verma.png"
import sarahJohnsonAvatar from "../../../assets/avatars/sarah_johnson.png"
import { useLandingContent } from "../../../hooks/useLandingContent"

const testimonials = [
  {
    avatar: priyaSharmaAvatar,
    name: "Priya Sharma",
    role: "UI Designer → React Developer",
    rating: 5,
    text: "I taught Figma and learned React in return. Within 3 months, I landed a full-stack role. SkillBridge literally changed my career!",
    color: "#a855f7",
  },
  {
    avatar: rahulVermaAvatar,
    name: "Rahul Verma",
    role: "Python Dev → Spanish Speaker",
    rating: 5,
    text: "Met my swap partner Lucia through SkillBridge. She learned Python, I became conversational in Spanish. Best exchange ever!",
    color: "#06b6d4",
  },
  {
    avatar: sarahJohnsonAvatar,
    name: "Sarah Johnson",
    role: "Marketing → Video Editing",
    rating: 5,
    text: "The AI matching is insanely accurate. Found someone who needed marketing help and taught me video editing in 2 weeks!",
    color: "#f97316",
  },
]

interface TestimonialsProps {
  isAdmin?: boolean;
}

export function Testimonials({ isAdmin }: TestimonialsProps) {
  const { content, setContent, saveContent } = useLandingContent();
  const [activeIndex, setActiveIndex] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const responsiveOffset = isMobile ? 160 : 300;

  useEffect(() => {
    if (isHovered || editField) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, editField]);

  const startEdit = (field: string, value: string) => {
    setEditField(field);
    setTempValue(value);
  };

  const saveEdit = () => {
    const newContent = { ...content, [editField!]: tempValue };
    saveContent(newContent);
    setEditField(null);
  };

  const activeColor = testimonials[activeIndex]?.color || testimonials[0].color;

  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      {/* Dynamic Glass Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30 blur-[150px] transition-all duration-1000"
        style={{ backgroundColor: activeColor }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-40 blur-[80px] transition-all duration-1000"
        style={{ backgroundColor: activeColor }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="skill-badge mb-4 inline-block">
            <MessageSquare size={14} />
            Real Stories
          </span>

          <div className="relative group max-w-3xl mx-auto">
            {isAdmin && !editField && (
              <button
                onClick={() => startEdit('testimonialsTitle', content.testimonialsTitle)}
                className="absolute -left-12 top-0 p-2 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
              >
                <Edit3 size={16} />
              </button>
            )}
            {editField === 'testimonialsTitle' ? (
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
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                {content.testimonialsTitle.includes("50,000+ Learners") ? (
                  <>
                    {content.testimonialsTitle.split("50,000+ Learners")[0]}
                    <span className="gradient-text">50,000+ Learners</span>
                    {content.testimonialsTitle.split("50,000+ Learners")[1]}
                  </>
                ) : content.testimonialsTitle}
              </h2>
            )}
          </div>

          <div className="relative group max-w-2xl mx-auto">
            {isAdmin && !editField && (
              <button
                onClick={() => startEdit('testimonialsSubtitle', content.testimonialsSubtitle)}
                className="absolute -left-12 top-0 p-2 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
              >
                <Edit3 size={16} />
              </button>
            )}
            {editField === 'testimonialsSubtitle' ? (
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
                {content.testimonialsSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Carousel Container */}
        <div
          className="relative h-[450px] flex items-center justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Controls */}
          <div className="absolute top-auto bottom-[-60px] md:top-1/2 md:-translate-y-1/2 left-1/4 md:left-4 z-30">
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="p-3 sm:p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-purple-500/30 transition-all backdrop-blur-md"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
          <div className="absolute top-auto bottom-[-60px] md:top-1/2 md:-translate-y-1/2 right-1/4 md:right-4 z-30">
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
              className="p-3 sm:p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-purple-500/30 transition-all backdrop-blur-md"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="relative w-full h-full flex items-center justify-center">
            {testimonials.map((t, index) => {
              const isActive = index === activeIndex;
              const isPrev = index === (activeIndex - 1 + testimonials.length) % testimonials.length;
              const isNext = index === (activeIndex + 1) % testimonials.length;

              let offset = 0;
              let scale = 0.85;
              let opacity = 0;
              let zIndex = 0;
              let blur = "blur(0px)";
              if (isActive) {
                offset = 0;
                scale = 1.05;
                opacity = 1;
                zIndex = 20;
              } else if (isPrev) {
                offset = -responsiveOffset;
                scale = isMobile ? 0.75 : 0.85;
                opacity = isMobile ? 0.1 : 0.3;
                zIndex = 10;
                blur = isMobile ? "blur(8px)" : "blur(4px)";
              } else if (isNext) {
                offset = responsiveOffset;
                scale = isMobile ? 0.75 : 0.85;
                opacity = isMobile ? 0.1 : 0.3;
                zIndex = 10;
                blur = isMobile ? "blur(8px)" : "blur(4px)";
              }

              return (
                <div
                  key={t.name}
                  className="absolute transition-all duration-700 ease-out cursor-pointer"
                  style={{
                    transform: `translateX(${offset}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: zIndex,
                    width: 'min(90vw, 380px)',
                    filter: blur
                  }}
                  onClick={() => setActiveIndex(index)}
                >
                  <div
                    className={`rounded-[28px] p-6 sm:p-7 md:p-9 border transition-all duration-500 bg-white/[0.03] backdrop-blur-3xl shadow-2xl ${isActive ? 'border-white/20 shadow-white/5' : 'border-white/5 opacity-60'
                      }`}
                  >
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-white text-lg md:text-xl leading-relaxed mb-8 italic">"{t.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl border overflow-hidden transition-all duration-500" style={{ borderColor: isActive ? t.color : 'rgba(255,255,255,0.1)' }}>
                        <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-base">{t.name}</div>
                        <div className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">{t.role}</div>
                      </div>
                      <div className="ml-auto">
                        <span className="text-green-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-green-400/10 border border-green-400/20">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicators */}
        <div className="mt-20 md:mt-12 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/10 hover:bg-white/20'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
