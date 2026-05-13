import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Zap, ArrowUpRight, Target, Award, Star, Download } from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  AreaChart, 
  Area 
} from 'recharts';
import { useSwappers } from '../../hooks/useSwappers';
import { adminService, SkillAnalyticsData } from '../../services/adminService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const categoryMap: Record<string, string> = {
  'Python': 'Coding', 'ReactJS': 'Coding', 'Node.js': 'Coding', 'Web Dev': 'Coding', 'Cybersecurity': 'Coding', 'Network Admin': 'Coding', 'React Development': 'Coding', 'JavaScript': 'Coding',
  'UI/UX Design': 'Design', 'Figma': 'Design', 'Photoshop': 'Design', 'Illustrator': 'Design', 'Logo Design': 'Design',
  'Spanish Language': 'Language', 'French': 'Language', 'English': 'Language',
  'Guitar': 'Music', 'Bass Guitar': 'Music', 'Music Theory': 'Music',
  'Digital Marketing': 'Business', 'SEO': 'Business', 'Excel': 'Business', 'Financial Modeling': 'Business', 'Public Speaking': 'Business'
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export function SkillAnalytics() {
  const { swappers: MOCK_SWAPPERS, loading: hooksLoading } = useSwappers();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<SkillAnalyticsData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [apiLoading, setApiLoading] = React.useState(true);
  const { showToast } = useToast();
  const reportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminService.getSkillAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch skill analytics:', error);
      } finally {
        setApiLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const { supplyDemandData, balanceData, topExperts, globalGrowth, successRate, trendingSkills } = useMemo(() => {
    // If we have API data, use it
    if (analyticsData && analyticsData.topOffered) {
      const sdData = analyticsData.topOffered.map((item: any) => ({
        skill: item.skill,
        supply: item.count,
        demand: Math.floor(item.count * 1.3) // Estimate demand based on supply for now
      }));

      const bData = Object.entries(analyticsData.categories || {}).map(([cat, count]) => ({
        subject: cat, A: count as number, B: Math.floor((count as number) * 0.8), fullMark: 10
      }));

      return {
        supplyDemandData: sdData,
        balanceData: bData,
        topExperts: analyticsData.topExperts || [],
        globalGrowth: analyticsData.totalUsers || 0,
        successRate: analyticsData.successRate || "0",
        trendingSkills: analyticsData.trendingSkills || []
      };
    }

    // Only fallback if API totally fails (should be empty though)
    return { supplyDemandData: [], balanceData: [], topExperts: [], globalGrowth: 0, successRate: "0", trendingSkills: [] };
  }, [analyticsData]);

  const handleExport = async () => {
    console.log("🚀 Generating Professional Data PDF Report...");
    setIsExporting(true);
    setExportProgress(10);
    
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      setExportProgress(20);

      // Title & Header
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("Skill Intelligence Platform Report", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${timestamp}`, 14, 30);
      doc.line(14, 35, 196, 35); // Horizontal line

      setExportProgress(40);

      // Section 1: Executive Summary
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("1. Executive Summary", 14, 45);
      
      const summaryData = [
        ["Metric", "Value"],
        ["Total Members", MOCK_SWAPPERS.length.toString()],
        ["Estimated Skill Potential", `${globalGrowth.toFixed(1)}k`],
        ["Platform Success Rate", "96.8%"],
        ["Top Demand Skill", "Python"]
      ];

      autoTable(doc, {
        startY: 50,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }
      });

      setExportProgress(60);

      // Section 2: Market Equilibrium
      const finalY1 = (doc as any).lastAutoTable.finalY || 80;
      doc.setFontSize(14);
      doc.text("2. Market Equilibrium (Supply vs Demand)", 14, finalY1 + 15);
      
      const marketData = supplyDemandData.map((d: any) => [d.skill, d.supply, d.demand]);
      autoTable(doc, {
        startY: finalY1 + 20,
        head: [['Skill Name', 'Supply (Talent)', 'Demand (Interest)']],
        body: marketData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });

      setExportProgress(80);

      // Section 3: Top Skill Experts
      const finalY2 = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(14);
      doc.text("3. Top Ranked Experts", 14, finalY2 + 15);
      
      const expertData = topExperts.map((e: any) => [e.name, e.rating, e.topSkill]);
      autoTable(doc, {
        startY: finalY2 + 20,
        head: [['Expert Name', 'Rating', 'Primary Skill']],
        body: expertData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] }
      });

      setExportProgress(95);
      
      const fileName = `SkillBridge_Data_Report_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      console.log(`✅ Professional PDF Saved as ${fileName}`);
      
      setExportProgress(100);
      setTimeout(() => setIsExporting(false), 500);
    } catch (error) {
      console.error("❌ PDF Generation failed:", error);
      setIsExporting(false);
      showToast("PDF generation failed. Please check the console.", "error");
    }
  };



  if (apiLoading) {
    return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  }

  return (
    <motion.div
      ref={reportRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-[#050505]"
    >
      {/* Header */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative pl-5">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-purple-600 rounded-full" />
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Skill Intelligence</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1 font-medium">Platform-wide insights from {MOCK_SWAPPERS.length} members.</p>
        </div>
        {/* Export button only — Live View removed */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`export-button-to-hide px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-gray-300 text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2 shrink-0 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Download size={16} /> {isExporting ? 'Exporting...' : 'Export PDF Report'}
        </button>
      </motion.div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Skill Potential Card - full width on sm, spans 2 on lg */}
        <motion.div variants={cardVariants} className="sm:col-span-2 bg-[#12121a] border border-white/5 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] group-hover:bg-purple-600/20 transition-all duration-700" />
          <div className="flex justify-between items-start mb-6 sm:mb-10">
            <div className="p-3 sm:p-4 rounded-2xl bg-purple-500/10 text-purple-400">
              <Zap size={24} />
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-black text-sm flex items-center gap-1 justify-end">
                <TrendingUp size={14} /> +24%
              </span>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Global Growth</p>
            </div>
          </div>
          <h3 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-2">{globalGrowth}</h3>
          <p className="text-gray-400 text-base sm:text-lg font-medium">Total Active Members</p>
          <div className="mt-6 h-[80px] w-full">
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={supplyDemandData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="supply" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" isAnimationActive={!isExporting} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-[#12121a] border border-white/5 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between group">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 w-fit mb-4">
            <Target size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Top Demand</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {supplyDemandData[0]?.skill || "Loading..."} <br/>
              <span className="text-blue-500 text-base sm:text-lg font-medium">Most Requested</span>
            </h3>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-sm text-gray-400">
            Real-time Interest
            <div className="w-full h-1.5 bg-white/5 rounded-full mt-2">
              <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-blue-500 rounded-full" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-[#12121a] border border-white/5 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between group">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 w-fit mb-4">
            <Award size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Trust Score</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {successRate}% <br/>
              <span className="text-orange-500 text-base sm:text-lg font-medium">Success Rate</span>
            </h3>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Verified Knowledge Swaps
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <motion.div variants={cardVariants} className="bg-[#12121a] border border-white/5 rounded-[2rem] p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-6 sm:mb-10">Market Equilibrium</h2>
          <div className="h-[260px] sm:h-[350px] w-full">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={supplyDemandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="skill" stroke="#ffffff30" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis stroke="#ffffff30" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <RechartsTooltip cursor={{ fill: '#ffffff03' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff10', borderRadius: '16px' }} />
                <Bar dataKey="supply" name="Supply" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={14} isAnimationActive={!isExporting} />
                <Bar dataKey="demand" name="Demand" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={14} isAnimationActive={!isExporting} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-[#12121a] border border-white/5 rounded-[2rem] p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-6 sm:mb-10">Ecosystem Balance</h2>
          <div className="h-[260px] sm:h-[350px] w-full">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={balanceData}>
                <PolarGrid stroke="#ffffff08" />
                {/* @ts-ignore */}
                <PolarAngleAxis dataKey="subject" stroke="#ffffff40" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#ffffff40' }} />
                <Radar name="Supply" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} isAnimationActive={!isExporting} />
                <Radar name="Demand" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} isAnimationActive={!isExporting} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <motion.div variants={cardVariants} className="bg-[#12121a] border border-white/5 rounded-[2rem] p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-6">Trending Skills</h2>
          <div className="space-y-3">
            {trendingSkills.map((skill, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + (i * 0.1) }}
                className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${skill.color}`} />
                  <div>
                    <h4 className="font-bold text-white text-sm">{skill.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{skill.status}</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-black text-sm">{skill.growth}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-[#12121a] border border-white/5 rounded-[2rem] p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-6">Top Skill Experts</h2>
          <div className="space-y-5">
            {topExperts.length > 0 ? (
              topExperts.map((expert: any, i: number) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + (i * 0.1) }}
                  className="flex items-center gap-4 group"
                >
                  <div 
                    onClick={() => navigate(`/profile/${expert.id}`)}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-purple-400 font-black text-lg cursor-pointer hover:scale-105 transition-all shadow-lg shadow-purple-500/5"
                  >
                    {expert.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${expert.id}`)}>
                    <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors truncate">{expert.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] text-gray-400 font-bold">{expert.rating}</span>
                      <span className="text-[8px] text-gray-600 ml-1 uppercase tracking-widest truncate">{expert.topSkill}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/profile/${expert.id}`)} className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-all shrink-0"><ArrowUpRight size={16} /></button>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No expert data available yet.</p>
            )}
          </div>
        </motion.div>

        {/* Live Status panel — kept but Live View button removed */}
        <motion.div variants={cardVariants} className="bg-[#12121a] border border-white/5 rounded-[2rem] p-6 sm:p-8 sm:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Live Status
          </h2>
          <div className="space-y-5">
            {MOCK_SWAPPERS.filter(s => s.isOnline).slice(0, 3).map((swap, i) => (
              <motion.div
                key={swap.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + (i * 0.1) }}
                className="relative pl-5 border-l border-white/10"
              >
                <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-green-500" />
                <p className="text-xs font-black text-green-400 uppercase tracking-widest">{swap.name} is Online</p>
                <p className="text-sm text-gray-300 font-medium truncate">Ready to teach {swap.offers[0]}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Export Progress Modal */}
      <AnimatePresence>
        {isExporting && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#12121a] border border-white/10 rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl relative z-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                <Download className="text-purple-400 animate-bounce" size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Generating Report</h3>
              <p className="text-gray-500 text-sm mb-8">Analyzing market equilibrium and expert data...</p>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                <motion.div initial={{ width: 0 }} animate={{ width: `${exportProgress}%` }} className="h-full bg-gradient-to-r from-purple-600 to-blue-500" />
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-purple-400">{exportProgress}% Complete</span>
                <span className="text-gray-500">{exportProgress < 100 ? 'Processing...' : 'Finalizing PDF'}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
