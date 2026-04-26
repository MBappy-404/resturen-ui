import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Users, AlertTriangle, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, ChefHat, Utensils } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { reportAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name === 'total' ? `৳${p.value?.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await reportAPI.getDashboard();
        setStats(data.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  const statCards = [
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: ShoppingBag, gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600', cardClass: 'stat-card-indigo', change: '+12%', up: true },
    { label: "Today's Revenue", value: `৳${(stats?.todayRevenue || 0).toLocaleString()}`, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600', cardClass: 'stat-card-emerald', change: '+8%', up: true },
    { label: 'Active Orders', value: stats?.activeOrders || 0, icon: Clock, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600', cardClass: 'stat-card-amber', change: '', up: true },
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, gradient: 'from-sky-500 to-sky-600', bg: 'bg-sky-50', text: 'text-sky-600', cardClass: 'stat-card-sky', change: '+5%', up: true },
    { label: 'Total Revenue', value: `৳${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-600', cardClass: 'stat-card-violet', change: '', up: true },
    { label: 'Low Stock Items', value: stats?.lowStockCount || 0, icon: AlertTriangle, gradient: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-600', cardClass: 'stat-card-rose', change: '', up: false },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ChefHat size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome back!</h2>
              <p className="text-indigo-100 text-sm">Here&apos;s what&apos;s happening with your restaurant today.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className={`stat-card ${stat.cardClass} group cursor-default`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} ${stat.text} transition-transform group-hover:scale-110`}>
                <stat.icon size={20} strokeWidth={2} />
              </div>
              {stat.change && (
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Revenue Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Weekly sales performance</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg font-semibold">
              <TrendingUp size={14} />
              Trending
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats?.dailySales || []}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorSales)" dot={false} activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Selling Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Top Selling Items</h3>
              <p className="text-xs text-slate-500 mt-0.5">Most ordered dishes</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg font-semibold">
              <Utensils size={14} />
              Top 6
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={(stats?.topItems || []).slice(0, 6)} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="_id" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={120} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalQty" radius={[0, 8, 8, 0]} barSize={22}>
                {(stats?.topItems || []).slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row: Status Pie + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Order Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution overview</p>
          </div>
          {(stats?.statusBreakdown || []).length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={stats?.statusBreakdown || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={50}
                    dataKey="count"
                    nameKey="_id"
                    stroke="none"
                    paddingAngle={3}
                  >
                    {(stats?.statusBreakdown || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {(stats?.statusBreakdown || []).map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400 capitalize">{s._id}</span>
                    <span className="font-bold text-slate-800 dark:text-white">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-slate-400">
              <ShoppingBag size={36} className="mb-2 opacity-40" />
              <p className="text-sm">No orders yet</p>
            </div>
          )}
        </motion.div>

        {/* Recent Orders Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest customer orders</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-6">
            <table className="premium-table w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="pl-6">Order</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-right pr-6">Total</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentOrders || []).length > 0 ? (
                  (stats?.recentOrders || []).slice(0, 8).map((order) => (
                    <tr key={order._id}>
                      <td className="pl-6 font-semibold text-slate-800 dark:text-slate-200">{order.orderNo}</td>
                      <td className="capitalize text-slate-500">{order.orderType?.replace('_', ' ')}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="text-right pr-6 font-bold text-slate-800 dark:text-slate-200">৳{order.total?.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400">
                      <ShoppingBag size={28} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No recent orders</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
