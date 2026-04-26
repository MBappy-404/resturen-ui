import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

const EmptyState = ({ icon: Icon = Package, title = 'No Data', description = '', action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 text-center max-w-sm mb-4">{description}</p>}
      {action && action}
    </motion.div>
  );
};

export default EmptyState;
