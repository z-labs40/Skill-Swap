import React, { useState } from "react"
import { Twitter, Linkedin, Instagram, Github, Edit3, Check } from "lucide-react"
import { useLandingContent } from "../../../hooks/useLandingContent"

interface FooterProps {
  isAdmin?: boolean;
}

export function Footer({ isAdmin }: FooterProps) {
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
    <footer className="relative bg-[#050510] border-t border-white/5 pt-16 pb-8 overflow-hidden">
      {/* Footer Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] -z-10" />

      {/* Top Gradient Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center mb-6">
              <img 
                src="/logo.png" 
                alt="SkillBridge Logo" 
                className="h-14 w-auto object-contain logo-blend" 
              />
            </div>
            
            <div className="relative group max-w-xs mb-6">
              {isAdmin && !editField && (
                <button 
                  onClick={() => startEdit('footerTagline', content.footerTagline)}
                  className="absolute -right-10 top-0 p-1.5 bg-purple-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white shadow-xl z-20"
                >
                  <Edit3 size={14} />
                </button>
              )}
              {editField === 'footerTagline' ? (
                <div className="flex items-start gap-2">
                  <textarea 
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 bg-white/5 border border-purple-500 rounded-xl p-3 text-sm text-gray-300 focus:outline-none"
                    rows={2}
                  />
                  <button onClick={saveEdit} className="p-3 bg-green-600 rounded-xl text-white"><Check size={18} /></button>
                </div>
              ) : (
                <p className="text-gray-500 text-[13px] leading-relaxed">
                  {content.footerTagline}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {[
                { icon: <Twitter size={16} />, label: "Twitter", url: "https://twitter.com" },
                { icon: <Linkedin size={16} />, label: "LinkedIn", url: "https://linkedin.com" },
                { icon: <Instagram size={16} />, label: "Instagram", url: "https://instagram.com" },
                { icon: <Github size={16} />, label: "GitHub", url: "https://github.com" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-purple-500/30 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="flex flex-col items-start md:items-center">
            <div>
              <h4 className="text-white font-bold mb-6 text-[10px] uppercase tracking-[0.2em]">Platform</h4>
              <ul className="space-y-3">
                {["Browse Skills", "How It Works", "Features", "Success Stories"].map((link) => (
                  <li key={link}>
                    <a href="/" className="text-gray-500 text-[13px] hover:text-white transition-all flex items-center group">
                      <span className="w-0 group-hover:w-3 h-px bg-purple-500 mr-0 group-hover:mr-2 transition-all" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col items-start md:items-end">
            <div>
              <h4 className="text-white font-bold mb-6 text-[10px] uppercase tracking-[0.2em]">Company</h4>
              <ul className="space-y-3">
                {["About Us", "Blog", "Careers", "Contact"].map((link) => (
                  <li key={link}>
                    <a href="/" className="text-gray-500 text-[13px] hover:text-white transition-all flex items-center group">
                      <span className="w-0 group-hover:w-3 h-px bg-purple-500 mr-0 group-hover:mr-2 transition-all" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-[10px] font-medium">
            © 2026 SkillBridge Inc. Built with ❤️ for learners.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((link) => (
              <a key={link} href="/" className="text-gray-600 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
