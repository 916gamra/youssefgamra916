import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/shared/utils';

export interface PdrCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function PdrCard({
  children,
  onClick,
  className,
  ...props
}: PdrCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 cursor-pointer",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
        "transition-colors duration-300 hover:bg-white/10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
