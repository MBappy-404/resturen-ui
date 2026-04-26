import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Save, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';
import { organizationAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const OrganizationPage = () => {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', address: '', phone: '', email: '', website: '', logo: '', taxRate: '0', serviceCharge: '0', currency: 'BDT', openingTime: '10:00', closingTime: '23:00' });

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const { data } = await organizationAPI.getOrganization();
        const o = data.data;
        setOrg(o);
        setForm({ name: o.name || '', description: o.description || '', address: o.address || '', phone: o.phone || '', email: o.email || '', website: o.website || '', logo: o.logo || '', taxRate: o.taxRate || 0, serviceCharge: o.settings?.serviceCharge || 0, currency: o.currency || 'BDT', openingTime: o.openingHours?.open || '10:00', closingTime: o.openingHours?.close || '23:00' });
      } catch { console.error('Error'); } finally { setLoading(false); }
    };
    fetchOrg();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await organizationAPI.updateOrganization({
        ...form, taxRate: Number(form.taxRate),
        settings: { serviceCharge: Number(form.serviceCharge) },
        openingHours: { open: form.openingTime, close: form.closingTime }
      });
      toast.success('Organization updated');
    } catch { toast.error('Error'); } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading..." />;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center"><Building2 size={24} className="text-indigo-600" /></div>
          <div><h2 className="text-xl font-bold text-slate-800 dark:text-white">Organization Settings</h2><p className="text-sm text-slate-500">Manage your restaurant information</p></div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Restaurant Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Logo URL</label><input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Website</label><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Currency</label><input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Tax Rate (%)</label><input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} className="input-field" step="0.1" /></div>
            <div><label className="block text-sm font-medium mb-1">Service Charge (%)</label><input type="number" value={form.serviceCharge} onChange={(e) => setForm({ ...form, serviceCharge: e.target.value })} className="input-field" step="0.1" /></div>
            <div><label className="block text-sm font-medium mb-1">Opening Time</label><input type="time" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Closing Time</label><input type="time" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" rows={2} /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} /></div>
          <div className="flex justify-end pt-4 border-t">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OrganizationPage;
