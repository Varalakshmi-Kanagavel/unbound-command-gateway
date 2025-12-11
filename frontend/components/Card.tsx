import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-surface border border-neon/20 rounded-lg p-6
        shadow-[0_0_20px_rgba(0,230,168,0.1)]
        hover:shadow-[0_0_30px_rgba(0,230,168,0.2)]
        transition-shadow duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

