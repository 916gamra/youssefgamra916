import React from 'react';
import { ExcelManager } from '@/shared/components/ExcelManager';
import { FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';

export function ExcelHubView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto space-y-6 pb-12"
    >
      <header className="flex flex-col gap-2 mb-8 pt-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-cyan-400" /> Excel Hub
        </h1>
        <p className="text-[var(--text-dim)] text-lg">
          Import and export master data sets directly from Excel. Offline capable and automatically versioned.
        </p>
      </header>

      <ExcelManager portalId="PDR" />
    </motion.div>
  );
}
