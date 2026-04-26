import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Users, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { reportAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

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
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: ShoppingBag, color: 'indigo', change: '+12%' },
    { label: "Today's Revenue", value: `৳${(stats?.todayRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'emerald', change: '+8%' },
    { label: 'Active Orders', value: stats?.activeOrders || 0, icon: Clock, color: 'amber', change: '' },
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'sky', change: '+5%' },
    { label: 'Total Revenue', value: `৳${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'purple', change: '' },
    { label: 'Low Stock Items', value: stats?.lowStockCount || 0, icon: AlertTriangle, color: 'red', change: '' },
  ];

  const colorMap = { indigo: 'bg-indigo-100 text-indigo-600', emerald: 'bg-emerald-100 text-emerald-600', amber: 'bg-amber-100 text-amber-600', sky: 'bg-sky-100 text-sky-600', purple: 'bg-purple-100 text-purple-600', red: 'bg-red-100 text-red-600' };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}>
                <stat.icon size={18} />
              </div>
              {stat.change && <span className="text-xs text-emerald-500 font-medium">{stat.change}</span>}
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Weekly Sales</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats?.dailySales || []}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={2.5} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Selling Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Top Selling Items</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={(stats?.topItems || []).slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="_id" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="totalQty" fill="#4F46E5" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Status breakdown + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats?.statusBreakdown || []} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="count" nameKey="_id" label={({ _id, count }) => `${_id}: ${count}`}>
                {(stats?.statusBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Order</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentOrders || []).slice(0, 8).map((order) => (
                  <tr key={order._id} className="border-b border-gray-50">
                    <td className="py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200">{order.orderNo}</td>
                    <td className="py-2.5 text-sm text-gray-500 capitalize">{order.orderType?.replace('_', ' ')}</td>
                    <td className="py-2.5"><StatusBadge status={order.status} /></td>
                    <td className="py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 text-right">৳{order.total?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
