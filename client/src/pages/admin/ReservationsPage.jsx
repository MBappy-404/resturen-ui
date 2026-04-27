import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock, Users, Check, X } from 'lucide-react';
import { reservationAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', date: '', timeSlot: '', guestCount: '2', specialRequest: '' });

  const fetchReservations = useCallback(async () => {
    try { const { data } = await reservationAPI.getReservations(); setReservations(data.data); } catch { toast.error('Error'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await reservationAPI.create({ ...form, guestCount: Number(form.guestCount) });
      toast.success('Reservation created'); setShowModal(false); fetchReservations();
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id, status) => {
    try { await reservationAPI.updateStatus(id, { status }); toast.success('Updated'); fetchReservations(); } catch { toast.error('Error'); }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => { setForm({ customerName: '', customerPhone: '', customerEmail: '', date: '', timeSlot: '', guestCount: '2', specialRequest: '' }); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2"><Plus size={16} /> New Reservation</button>
      </div>

      {reservations.length === 0 ? <EmptyState icon={Calendar} title="No reservations" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reservations.map((r, idx) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div><h4 className="font-semibold">{r.customerName}</h4><p className="text-xs text-slate-500">{r.customerPhone}</p></div>
                <StatusBadge status={r.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div className="flex items-center gap-1.5 text-slate-500"><Calendar size={14} />{new Date(r.date).toLocaleDateString()}</div>
                <div className="flex items-center gap-1.5 text-slate-500"><Clock size={14} />{r.timeSlot}</div>
                <div className="flex items-center gap-1.5 text-slate-500"><Users size={14} />{r.guestCount} guests</div>
              </div>
              {r.specialRequest && <p className="text-xs text-slate-400 mb-3">{r.specialRequest}</p>}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(r._id, 'confirmed')} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium flex items-center justify-center gap-1"><Check size={12} /> Confirm</button>
                    <button onClick={() => updateStatus(r._id, 'rejected')} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium flex items-center justify-center gap-1"><X size={12} /> Reject</button>
                  </>
                )}
                {r.status === 'confirmed' && (
                  <button onClick={() => updateStatus(r._id, 'seated')} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium">Seated</button>
                )}
                {r.status === 'seated' && (
                  <button onClick={() => updateStatus(r._id, 'completed')} className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium">Complete</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Reservation" size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Phone *</label><input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="input-field" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Date *</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Time *</label><input type="time" value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} className="input-field" required /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Guests</label><input type="number" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value })} className="input-field" min="1" /></div>
          <div><label className="block text-sm font-medium mb-1">Notes</label><textarea value={form.specialRequest} onChange={(e) => setForm({ ...form, specialRequest: e.target.value })} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Create</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default ReservationsPage;
