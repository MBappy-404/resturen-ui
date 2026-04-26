const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-emerald-100 text-emerald-700',
  out_for_delivery: 'bg-cyan-100 text-cyan-700',
  served: 'bg-teal-100 text-teal-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-red-100 text-red-700',
  reserved: 'bg-blue-100 text-blue-700',
  cleaning: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  unpaid: 'bg-red-100 text-red-700',
  partial: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
  leave: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  seated: 'bg-indigo-100 text-indigo-700',
  no_show: 'bg-gray-100 text-gray-600',
  final: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  void: 'bg-red-100 text-red-700',
};

const StatusBadge = ({ status, className = '' }) => {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-600';
  const label = status ? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
