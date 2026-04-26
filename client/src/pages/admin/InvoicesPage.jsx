import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Eye, XCircle, Download } from 'lucide-react';
import { invoiceAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const printRef = useRef();

  const fetchInvoices = useCallback(async () => {
    try { const { data } = await invoiceAPI.getInvoices(); setInvoices(data.data); } catch { toast.error('Error'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const viewInvoice = async (id) => {
    try { const { data } = await invoiceAPI.getInvoice(id); setSelectedInvoice(data.data); setShowPrint(true); } catch { toast.error('Error'); }
  };

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '', 'width=400,height=600');
    win.document.write('<html><head><title>Invoice</title><style>body{font-family:monospace;padding:20px;font-size:12px}table{width:100%;border-collapse:collapse}td,th{padding:4px;text-align:left}th{border-bottom:1px dashed #000}.total{font-size:16px;font-weight:bold;border-top:2px solid #000}.center{text-align:center}hr{border:none;border-top:1px dashed #000}</style></head><body>');
    win.document.write(content.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading invoices..." />;

  return (
    <div className="space-y-6">
      {invoices.length === 0 ? <EmptyState icon={FileText} title="No invoices yet" description="Invoices are generated from completed orders" /> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Invoice No</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Order</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Total</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <motion.tr key={inv._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="border-b border-gray-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-sm text-indigo-600">{inv.invoiceNo}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{inv.order?.orderNo || '-'}</td>
                  <td className="py-3 px-4 text-sm">{inv.customerInfo?.name || '-'}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-right">৳{(inv.grandTotal || inv.total)?.toLocaleString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={inv.status} /></td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => viewInvoice(inv._id)} className="p-1.5 rounded-lg hover:bg-slate-100"><Eye size={14} className="text-blue-500" /></button>
                    <button onClick={() => viewInvoice(inv._id)} className="p-1.5 rounded-lg hover:bg-slate-100"><Printer size={14} className="text-slate-500" /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Print Preview Modal */}
      <Modal isOpen={showPrint} onClose={() => setShowPrint(false)} title="Invoice Preview" size="md">
        {selectedInvoice && (
          <div>
            <div ref={printRef} className="bg-white p-6 text-sm">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">{selectedInvoice.organization?.name || 'Restaurant'}</h2>
                <p className="text-slate-500 text-xs">{selectedInvoice.organization?.address}</p>
                <p className="text-slate-500 text-xs">{selectedInvoice.organization?.phone}</p>
                <hr className="my-2 border-dashed" />
                <p className="font-bold">INVOICE</p>
                <p className="text-xs">#{selectedInvoice.invoiceNo}</p>
                <p className="text-xs text-slate-500">{new Date(selectedInvoice.createdAt).toLocaleString()}</p>
              </div>
              {selectedInvoice.customerInfo?.name && <p className="text-xs mb-2">Customer: {selectedInvoice.customerInfo.name} | {selectedInvoice.customerInfo.phone}</p>}
              <hr className="my-2 border-dashed" />
              <table className="w-full text-xs"><thead><tr><th className="text-left">Item</th><th className="text-center">Qty</th><th className="text-right">Price</th><th className="text-right">Total</th></tr></thead>
                <tbody>
                  {selectedInvoice.items?.map((item, i) => (
                    <tr key={i}><td>{item.name}</td><td className="text-center">{item.quantity}</td><td className="text-right">৳{item.unitPrice}</td><td className="text-right">৳{item.subtotal}</td></tr>
                  ))}
                </tbody>
              </table>
              <hr className="my-2 border-dashed" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Subtotal</span><span>৳{selectedInvoice.subtotal}</span></div>
                {selectedInvoice.tax > 0 && <div className="flex justify-between"><span>Tax</span><span>৳{selectedInvoice.tax?.toFixed(0)}</span></div>}
                {selectedInvoice.serviceCharge > 0 && <div className="flex justify-between"><span>Service</span><span>৳{selectedInvoice.serviceCharge?.toFixed(0)}</span></div>}
                {selectedInvoice.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{selectedInvoice.discount}</span></div>}
                <div className="flex justify-between font-bold text-base pt-1 border-t border-dashed"><span>Total</span><span>৳{(selectedInvoice.grandTotal || selectedInvoice.total)?.toLocaleString()}</span></div>
                {selectedInvoice.paymentMethod && <div className="flex justify-between"><span>Payment</span><span className="capitalize">{selectedInvoice.paymentMethod}</span></div>}
              </div>
              <hr className="my-2 border-dashed" />
              <p className="text-center text-xs text-slate-400">Thank you for dining with us!</p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={handlePrint} className="btn-primary flex items-center gap-2"><Printer size={16} /> Print</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesPage;
