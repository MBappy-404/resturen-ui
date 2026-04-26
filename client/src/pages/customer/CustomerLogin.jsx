import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import toast from 'react-hot-toast';

const CustomerLogin = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useCustomerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success('Account created!');
      } else {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3"><UtensilsCrossed size={24} className="text-white" /></div>
            <h1 className="text-2xl font-bold text-gray-800">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-sm text-gray-500 mt-1">{isRegister ? 'Join Foodie Paradise' : 'Sign in to your account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="relative"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-11" placeholder="Full Name" required /></div>
                <div className="relative"><Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-11" placeholder="Phone Number" /></div>
              </>
            )}
            <div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-11" placeholder="Email" required /></div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-11 pr-11" placeholder="Password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-4">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="text-indigo-600 font-medium hover:underline">{isRegister ? 'Sign In' : 'Register'}</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerLogin;
