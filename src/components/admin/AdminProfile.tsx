import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Camera,
  Edit3,
  LayoutDashboard,
  BadgeCheck,
  Calendar,
  Lock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Send,
  Eye,
  EyeOff,
  Shield,
  Key,
  Check,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

type ModalFlow = 'none' | 'password-reset' | 'email-change';
type ModalStep = 'enter-email' | 'enter-otp' | 'new-password' | 'new-email' | 'success';

export function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal State
  const [flow, setFlow] = useState<ModalFlow>('none');
  const [step, setStep] = useState<ModalStep>('enter-email');
  const [inputEmail, setInputEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    image: null as string | null,
    joined: '',
    lastPasswordUpdate: 'Recently'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await adminService.getAdminProfile();
        const formatDate = (dateStr: string) => {
          if (!dateStr) return 'N/A';
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        };

        const formatJoined = (dateStr: string) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          return d.getFullYear().toString(); // Only show the Year
        };

        setAdminData({
          name: data.name || 'SkillBridge Official',
          email: data.email,
          image: data.avatar_url || null,
          joined: formatJoined(data.dob || data.created_at || ''),
          lastPasswordUpdate: 'Recently'
        });
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
        // Fallback to local storage if API fails
        const saved = localStorage.getItem('sb_admin_profile');
        if (saved) setAdminData(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveData = async (data: any) => {
    setIsProcessing(true);
    try {
      const updated = await adminService.updateAdminProfile({
        email: data.email,
        name: data.name,
        avatar_url: data.image,
        dob: data.joined ? `${data.joined}-01-01` : undefined // Store year as a date string
      });
      
      setAdminData({
        ...data,
        name: updated.name,
        image: updated.avatar_url || data.image
      });
      
      localStorage.setItem('sb_admin_profile', JSON.stringify({
        ...data,
        name: updated.name,
        image: updated.avatar_url || data.image
      }));
      
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const startFlow = (type: ModalFlow) => {
    setFlow(type);
    setStep('enter-email');
    setInputEmail(adminData.email);
    setOtp(['', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSendOtp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('enter-otp');
    }, 1200);
  };

  const handleVerifyOtp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (flow === 'password-reset') setStep('new-password');
      else setStep('new-email');
    }, 1200);
  };

  const handleFinalize = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (flow === 'email-change') {
        const updated = { ...adminData, email: inputEmail };
        handleSaveData(updated);
      } else if (flow === 'password-reset') {
        const updated = { ...adminData, lastPasswordUpdate: 'Just now' };
        handleSaveData(updated);
      }
      setStep('success');
      setTimeout(() => {
        setFlow('none');
      }, 2000);
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse max-w-3xl mx-auto">
        <div className="h-[500px] w-full bg-white/5 rounded-[48px]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Main Profile Card */}
      <div className="bg-[#111122] border border-white/10 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-2xl relative group transition-all duration-500">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-600/20 to-transparent" />
        
        <div className="relative z-10 p-6 sm:p-10 flex flex-col items-center">
          
          {/* Top Actions Bar (Inside Card) */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex gap-2">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-gray-400 hover:text-white transition-all">
                   <X size={16} />
                </button>
                <button onClick={() => handleSaveData(adminData)} className="p-2 sm:p-3 bg-purple-600 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-purple-500/20">
                   <Check size={16} />
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="p-2 sm:p-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-gray-400 hover:text-white transition-all group/edit">
                <Edit3 size={16} className="group-hover/edit:rotate-12 transition-transform" />
              </button>
            )}
          </div>

          <div className="relative mb-8 mt-4">
            <div className="w-40 h-40 rounded-[48px] bg-gradient-to-tr from-purple-600 via-blue-500 to-purple-600 p-1 shadow-2xl">
              <div className="w-full h-full rounded-[44px] bg-[#0B061A] flex items-center justify-center overflow-hidden relative group/avatar">
                {adminData.image ? (
                  <img src={adminData.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={60} className="text-white/10" />
                )}
                <div 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={24} className="text-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Update</span>
                </div>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) {
                 const reader = new FileReader();
                 reader.onloadend = () => handleSaveData({ ...adminData, image: reader.result as string });
                 reader.readAsDataURL(file);
               }
            }} className="hidden" accept="image/*" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center text-white border-4 border-[#111122] shadow-lg">
              <BadgeCheck size={20} />
            </div>
          </div>

          <div className="w-full text-center space-y-6">
            {isEditing ? (
              <div className="max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between ml-4">
                    <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">Full Name</label>
                    <span className="text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 flex items-center gap-1">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                      SYSTEM PROTECTED
                    </span>
                  </div>
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-gray-400 flex items-center justify-between group">
                    <span>{adminData.name}</span>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block ml-4">Member Since (Year)</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={adminData.joined}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // Only numbers
                      setAdminData(prev => ({ ...prev, joined: val }));
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-purple-500 outline-none"
                    placeholder="YYYY (e.g. 2026)"
                  />
                </div>
                <div className="pt-4">
                   <button onClick={() => handleSaveData(adminData)} className="w-full py-4 bg-purple-600 rounded-[28px] text-white font-black shadow-lg shadow-purple-500/20">
                     Save Profile Changes
                   </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-2xl">{adminData.name}</h2>
                  <div className="flex items-center justify-center gap-2.5 text-purple-400 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em]">
                    <ShieldCheck size={14} className="animate-pulse" />
                    Root Administrator
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-10 max-w-xl mx-auto w-full">
                    <div className="p-5 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center gap-3 group/info hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover/info:scale-110 transition-transform">
                        <Mail size={18} />
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Administrative Email</p>
                        <span className="text-sm text-white font-bold tracking-tight">{adminData.email}</span>
                      </div>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center gap-3 group/info hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover/info:scale-110 transition-transform">
                        <Calendar size={18} />
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Member Since</p>
                        <span className="text-sm text-white font-bold tracking-tight">{adminData.joined}</span>
                      </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 py-6 border-y border-white/5 bg-white/[0.01]">
                   <div className="flex flex-col items-center gap-1 border-r border-white/5">
                      <Shield className="text-green-500 mb-1" size={18} />
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Account Status</p>
                      <p className="text-xs text-white font-bold">SECURED</p>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <Key className="text-purple-500 mb-1" size={18} />
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Password Last Set</p>
                      <p className="text-xs text-white font-bold">{adminData.lastPasswordUpdate}</p>
                   </div>
                </div>

                {/* Send Credentials Action */}
                <div className="pt-8 space-y-4 max-w-sm mx-auto">
                    <div className="relative group/input">
                      <div className="absolute -top-2 left-4 px-2 bg-[#111122] text-[10px] font-black text-purple-400 uppercase tracking-widest z-10 transition-colors group-focus-within/input:text-purple-300">
                        Receiver Email
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" size={16} />
                        <input 
                          type="email" 
                          value={inputEmail}
                          onChange={(e) => setInputEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-purple-500/50 focus:bg-white/10 outline-none text-sm transition-all shadow-inner"
                          placeholder="admin@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                      <button 
                        onClick={async () => {
                          setIsProcessing(true);
                          setError(null);
                          setSuccess(null);
                          try {
                            const res = await adminService.sendAdminCredentials(inputEmail);
                            setSuccess(res.message || 'Access Key sent successfully!');
                            setTimeout(() => setSuccess(null), 5000);
                          } catch (err: any) {
                            setError(err.response?.data?.message || 'Failed to send credentials');
                            setTimeout(() => setError(null), 5000);
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        disabled={!inputEmail || isProcessing}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:scale-[1.02] active:scale-95 transition-all text-white text-sm font-black shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} /> Send Access Key</>}
                      </button>
                      
                      {success && (
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold text-center animate-in fade-in slide-in-from-top-1">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 size={12} />
                            {success}
                          </div>
                        </div>
                      )}

                      {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center animate-in fade-in slide-in-from-top-1">
                          {error}
                        </div>
                      )}

                      <p className="text-[10px] text-gray-500 text-center font-medium leading-relaxed">
                        This will securely send the administrative <br/> login details to the specified contact.
                      </p>
                    </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECURITY MODAL */}
      {flow !== 'none' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/70">
          <div className="w-full max-w-md bg-[#111122] border border-white/10 rounded-[48px] p-10 shadow-3xl text-center relative overflow-hidden">
             
             {step === 'enter-email' && (
               <div className="animate-in fade-in zoom-in-95 duration-300">
                 {error ? (
                   <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <ShieldAlert size={32} className="text-red-400" />
                   </div>
                 ) : (
                   <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <Mail size={32} className="text-purple-400" />
                   </div>
                 )}
                 <h3 className="text-2xl font-black text-white mb-2">
                   {error ? 'Connection Failed' : 'Security Verification'}
                 </h3>
                 <p className="text-gray-500 text-sm mb-8">
                   {error || 'Enter your admin email to receive the code.'}
                 </p>
                 
                 {!error && (
                   <input 
                     type="email" 
                     value={inputEmail}
                     onChange={(e) => setInputEmail(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none text-center mb-4"
                     placeholder="admin@example.com"
                   />
                 )}

                 <button 
                   onClick={error ? () => { setFlow('none'); setError(null); } : handleSendOtp}
                   className={`w-full py-4 ${error ? 'bg-gray-800' : 'bg-purple-600'} rounded-[24px] text-white font-black shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3`}
                 >
                   {error ? 'Close & Retry' : (isProcessing ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send OTP</>)}
                 </button>
                 {!error && <button onClick={() => setFlow('none')} className="text-xs font-black text-gray-600 uppercase tracking-widest mt-4">Cancel</button>}
               </div>
             )}

             {step === 'enter-otp' && (
               <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShieldAlert size={32} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Verify Access</h3>
                <p className="text-gray-500 text-sm mb-8">Code sent to {inputEmail}</p>
                <div className="flex justify-center gap-4 mb-8">
                   {otp.map((digit, i) => (
                     <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)}
                       className="w-14 h-18 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-white focus:border-purple-500 outline-none"
                     />
                   ))}
                </div>
                <button 
                  onClick={handleVerifyOtp}
                  disabled={otp.some(d => !d) || isProcessing}
                  className="w-full py-4 bg-purple-600 rounded-[24px] text-white font-black shadow-xl shadow-purple-500/20"
                >
                  {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'Verify OTP'}
                </button>
               </div>
             )}

             {step === 'new-password' && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className="w-16 h-16 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">New Password</h3>
                  <p className="text-gray-500 text-sm mb-8">Choose a strong password for your account.</p>
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none"
                        placeholder="New Password"
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none"
                      placeholder="Confirm Password"
                    />
                    <button 
                      onClick={handleFinalize}
                      disabled={!newPassword || newPassword !== confirmPassword || isProcessing}
                      className="w-full py-4 bg-purple-600 rounded-[24px] text-white font-black"
                    >
                      {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'Update Password'}
                    </button>
                  </div>
                </div>
             )}

             {step === 'new-email' && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail size={32} className="text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">New Email Address</h3>
                  <p className="text-gray-500 text-sm mb-8">Enter your new administrative contact email.</p>
                  <div className="space-y-4">
                    <input 
                      type="email"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-purple-500 outline-none"
                      placeholder="new-admin@example.com"
                    />
                    <button 
                      onClick={handleFinalize}
                      disabled={!inputEmail || isProcessing}
                      className="w-full py-4 bg-blue-600 rounded-[24px] text-white font-black"
                    >
                      {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'Update Email'}
                    </button>
                  </div>
                </div>
             )}

             {step === 'success' && (
               <div className="py-10 flex flex-col items-center animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                     <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Done!</h3>
                  <p className="text-gray-500">Security details updated successfully.</p>
               </div>
             )}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-black text-gray-600 uppercase tracking-widest hover:text-purple-400 transition-all"
        >
          <LayoutDashboard size={14} /> Back to Control Dashboard
        </button>
      </div>
    </div>
  );
}
