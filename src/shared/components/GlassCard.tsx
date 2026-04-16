import React from 'react';
import { cn } from '@/shared/utils';

export function GlassCard({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div 
      className={cn(
        "bg-[var(--glass-bg)] backdrop-blur-[12px] border border-[var(--glass-border)] rounded-2xl p-5 overflow-hidden relative",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
