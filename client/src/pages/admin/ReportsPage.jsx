import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, DollarSign, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { reportAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const ReportsPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [orderAnalytics, setOrderAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [salesRes, topRes, revRes, orderRes] = await Promise.all([
          reportAPI.getSalesReport({ period }),
          reportAPI.getTopItems({ limit: 10 }),
          reportAPI.getRevenueReport(),
          reportAPI.getOrderAnalytics()
        ]);
        setSalesData(salesRes.data.data || []);
        setTopItems(topRes.data.data || []);
        setRevenue(revRes.data.data);
        setOrderAnalytics(orderRes.data.data);
      } catch { toast.error('Error loading reports'); }
      finally { setLoading(false); }
    };
    fetchReports();
  }, [period]);

  if (loading) return <LoadingSpinner size="lg" text="Loading reports..." />;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {['today', 'week', 'month', 'year'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `৳${(revenue?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'emerald' },
          { label: 'Total Orders', value: revenue?.totalOrders || 0, icon: ShoppingBag, color: 'indigo' },
          { label: 'Avg Order Value', value: `৳${(revenue?.avgOrderValue || 0).toFixed(0)}`, icon: TrendingUp, color: 'sky' },
          { label: 'Top Category', value: topItems[0]?._id || '-', icon: Award, color: 'amber' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${`bg-${s.color}-100 text-${s.color}-600`}`}><s.icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} /><stop offset="95%" stopColor="#4F46E5" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Bar dataKey="totalQty" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Order Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={orderAnalytics?.byType || []} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="count" nameKey="_id" label={({ _id, count }) => `${_id}: ${count}`}>
                {(orderAnalytics?.byType || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
