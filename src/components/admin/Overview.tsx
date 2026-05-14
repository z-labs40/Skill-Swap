import React, { useState } from 'react';
import { Users, TrendingUp, CheckCircle2, MessageSquare, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminService } from '../../services/adminService';

const barData = [
  { name: 'Jan', swaps: 120 },
  { name: 'Feb', swaps: 210 },
  { name: 'Mar', swaps: 180 },
  { name: 'Apr', swaps: 300 },
  { name: 'May', swaps: 450 },
  { name: 'Jun', swaps: 420 },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];



export function Overview() {
  const [pieData, setPieData] = React.useState<any[]>([]);
  const [barData, setBarData] = React.useState<any[]>([]);
  const [globalStats, setGlobalStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, analytics] = await Promise.all([
          adminService.getUserStats(),
          adminService.getSkillAnalytics()
        ]);
        setGlobalStats(statsData);
        if (analytics && analytics.topOffered) {
          setPieData(analytics.topOffered.map((a: any) => ({ name: a.skill, value: a.count })));
          setBarData(analytics.monthlyActivity || []);
        }
      } catch (error) {
        console.error('Failed to fetch overview analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsItems = [
    { label: 'Total Users', value: globalStats?.total?.toLocaleString() || '0', change: '+12%', icon: Users, cardBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20' },
    { label: 'Active Users', value: globalStats?.active?.toLocaleString() || '0', change: '+18%', icon: TrendingUp, cardBg: 'bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-purple-500/20' },
    { label: 'Top Rated', value: globalStats?.topRated?.toLocaleString() || '0', change: '+2%', icon: CheckCircle2, cardBg: 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-teal-500/20' },
    { label: 'Open Support', value: globalStats?.appeals?.toLocaleString() || '0', change: '-5%', icon: MessageSquare, cardBg: 'bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-500/20' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 font-medium">Welcome back! Here's what's happening on SkillBridge today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {statsItems.map((stat) => (
          <div key={stat.label} className={`${stat.cardBg} rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-white bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-black backdrop-blur-sm uppercase tracking-wider">
                {stat.change} <ArrowUpRight size={12} />
              </div>
            </div>
            <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-white">{stat.value}</h3>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Monthly Skill Swaps</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="swaps" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Popular Skill Categories</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
