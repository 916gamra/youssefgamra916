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
      <header className="flex flex-col gap-2 mb-8 pt-4 border-b border-white/5 pb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3 uppercase">
          <FileSpreadsheet className="w-8 h-8 text-blue-500" /> Excel Management
        </h1>
        <p className="text-slate-400 text-lg font-medium opacity-80">
          Sync master data records via spreadsheet interface. Offline capable with automated validation.
        </p>
      </header>

      <ExcelManager portalId="PDR" />
    </motion.div>
  );
}
