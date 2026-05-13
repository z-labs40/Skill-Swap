import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, X, Plus, User, GraduationCap, Search, Star, Send, CheckCircle2, ChevronLeft } from 'lucide-react';
import { userService } from '../../services/userService';
import { getAuthState } from '../../lib/auth';
import { SecureImage } from '../common/SecureImage';

export function MyProfile() {
  const currentUser = getAuthState();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>({
    name: "User",
    email: "",
    bio: "",
    skillsOffered: [],
    skillsSought: [],
    avatar: "👤"
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [newOffer, setNewOffer] = useState("");
  const [newSeek, setNewSeek] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser.id) return;
      try {
        const data = await userService.getProfile(currentUser.id!);
        const mapped = {
          name: data.name,
          email: data.email || currentUser.email || "",
          bio: data.bio || "",
          skillsOffered: data.offers || [],
          skillsSought: data.seeks || [],
          avatar: data.avatar_url || "👤"
        };
        setProfile(mapped);
        setTempProfile(mapped);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser.id]);

  const handleSave = async () => {
    if (!currentUser.id) return;
    try {
      let avatarUrl = tempProfile.avatar;

      // If a new file was selected, upload and encrypt it first
      if (selectedFile) {
        const uploadRes = await userService.uploadAvatar(selectedFile);
        avatarUrl = uploadRes.url;
      }

      const updated = await userService.updateProfile(currentUser.id!, {
        name: tempProfile.name,
        bio: tempProfile.bio,
        offers: tempProfile.skillsOffered,
        seeks: tempProfile.skillsSought,
        avatar_url: avatarUrl
      });
      
      const mapped = {
        name: updated.name,
        email: updated.email || tempProfile.email || "",
        bio: updated.bio || "",
        skillsOffered: updated.offers || [],
        skillsSought: updated.seeks || [],
        avatar: updated.avatar_url || "👤"
      };
      setProfile(mapped);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const addOffer = () => {
    if (newOffer.trim()) {
      setTempProfile({ ...tempProfile, skillsOffered: [...tempProfile.skillsOffered, newOffer.trim()] });
      setNewOffer("");
    }
  };

  const addSeek = () => {
    if (newSeek.trim()) {
      setTempProfile({ ...tempProfile, skillsSought: [...tempProfile.skillsSought, newSeek.trim()] });
      setNewSeek("");
    }
  };

  const removeOffer = (index: number) => {
    const updated = tempProfile.skillsOffered.filter((_: string, i: number) => i !== index);
    setTempProfile({ ...tempProfile, skillsOffered: updated });
  };

  const removeSeek = (index: number) => {
    const updated = tempProfile.skillsSought.filter((_: string, i: number) => i !== index);
    setTempProfile({ ...tempProfile, skillsSought: updated });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="min-h-screen hero-bg flex items-center justify-center text-white">Loading profile...</div>;

  return (
    <div className="min-h-screen hero-bg grid-overlay text-white pb-12">
      {/* Dashboard Navbar */}
      <nav className="navbar min-h-16 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-2 sm:py-0 sticky top-0 z-50 gap-2 sm:gap-0">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img 
            src="/logo.png" 
            alt="SkillBridge Logo" 
            className="h-10 sm:h-12 w-auto object-contain logo-blend"
          />
        </div>
        <div className="flex items-center gap-2 sm:space-x-3 overflow-x-auto w-full sm:w-auto justify-center sm:justify-end pb-2 sm:pb-0 px-2 sm:px-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 sm:px-5 py-2 text-[10px] sm:text-sm font-medium text-gray-300 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all whitespace-nowrap"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="px-3 sm:px-5 py-2 text-[10px] sm:text-sm font-medium text-gray-300 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all whitespace-nowrap"
          >
            Explore
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="px-3 sm:px-5 py-2 text-[10px] sm:text-sm font-medium text-gray-300 border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all whitespace-nowrap"
          >
            Messages
          </button>
        </div>
      </nav>

      {/* Banner */}
      <div className="h-40 sm:h-64 w-full bg-gradient-to-r from-purple-900/60 to-blue-900/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative -mt-20">
        <div className="stat-card p-6 sm:p-8 border border-white/10 shadow-2xl fade-in-1">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start text-center md:text-left">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-white/5 flex items-center justify-center text-6xl shadow-xl border-4 border-[#120B2E] shrink-0 overflow-hidden relative">
                {tempProfile.avatar.length > 4 ? (
                  <SecureImage 
                    url={isEditing ? tempProfile.avatar : profile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-purple-600/10 text-purple-400">
                    <User className="w-16 h-16" />
                  </div>
                )}
                
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-[10px] text-white font-bold uppercase">Change Photo</span>
                  </button>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              {isEditing && (
                <div className="mt-2 flex flex-col gap-2">
                  {tempProfile.avatar.length > 4 && (
                    <button 
                      onClick={() => setTempProfile({ ...tempProfile, avatar: "👤" })}
                      className="w-full py-1 text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider border border-red-500/20 rounded-lg bg-red-500/5 transition-all"
                    >
                      Remove Photo
                    </button>
                  )}
                  <input 
                    type="text" 
                    value={tempProfile.avatar.length > 30 ? "Photo Uploaded" : tempProfile.avatar} 
                    onChange={e => setTempProfile({...tempProfile, avatar: e.target.value})}
                    placeholder="or paste emoji"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-center focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 sm:gap-6 mb-6">
                <div className="flex-1 w-full">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={tempProfile.name} 
                      onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                      className="text-2xl sm:text-3xl font-black bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-purple-500/50 text-center sm:text-left"
                      placeholder="Your Name"
                    />
                  ) : (
                    <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
                  )}
                  {profile.email && (
                    <p className="text-purple-400 font-medium mt-1">{profile.email}</p>
                  )}
                  <p className="text-gray-400 font-medium mt-1">Skill Swapper & Enthusiast</p>
                </div>
                
                <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isEditing ? "bg-green-600 hover:bg-green-700 text-white" : "gradient-btn text-white"
                  }`}
                >
                  {isEditing ? (
                    <><Save className="w-5 h-5" /> Save Profile</>
                  ) : (
                    <><Camera className="w-5 h-5" /> Edit Profile</>
                  )}
                </button>
              </div>

              {/* Bio Section */}
              <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">About Me</h2>
                {isEditing ? (
                  <textarea 
                    value={tempProfile.bio} 
                    onChange={e => setTempProfile({...tempProfile, bio: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500/50 h-24"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-400 leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-white/10">
            {/* Skills Offered */}
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <GraduationCap className="w-4 h-4" />
                </span>
                Skills I Can Teach
              </h2>
              
              {isEditing && (
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={newOffer}
                    onChange={e => setNewOffer(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addOffer()}
                    placeholder="Add skill..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                  <button onClick={addOffer} className="px-4 py-2 bg-purple-600 rounded-xl text-sm font-bold">+</button>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {(isEditing ? tempProfile.skillsOffered : profile.skillsOffered).map((skill: string, i: number) => (
                  <div key={i} className="glass px-4 py-2 rounded-xl border border-purple-500/30 flex items-center gap-3">
                    <span className="text-sm font-semibold">{skill}</span>
                    {isEditing && (
                      <button onClick={() => removeOffer(i)} className="text-gray-500 hover:text-red-400">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Sought */}
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Search className="w-4 h-4" />
                </span>
                Skills I Want to Learn
              </h2>

              {isEditing && (
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    value={newSeek}
                    onChange={e => setNewSeek(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSeek()}
                    placeholder="Add skill..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                  />
                  <button onClick={addSeek} className="px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold">+</button>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {(isEditing ? tempProfile.skillsSought : profile.skillsSought).map((skill: string, i: number) => (
                  <div key={i} className="glass px-4 py-2 rounded-xl border border-blue-500/30 flex items-center gap-3">
                    <span className="text-sm font-semibold">{skill}</span>
                    {isEditing && (
                      <button onClick={() => removeSeek(i)} className="text-gray-500 hover:text-red-400">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
