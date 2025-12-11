import { motion } from 'framer-motion';

interface BadgeProps {
  status: 'executed' | 'rejected' | 'pending' | 'success' | 'error';
  children: React.ReactNode;
}

export default function Badge({ status, children }: BadgeProps) {
  const statusStyles = {
    executed: 'bg-success/20 text-success border-success/30',
    rejected: 'bg-error/20 text-error border-error/30',
    pending: 'bg-ice/20 text-ice border-ice/30',
    success: 'bg-success/20 text-success border-success/30',
    error: 'bg-error/20 text-error border-error/30',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border ${statusStyles[status]}
      `}
    >
      {children}
    </motion.span>
  );
}

