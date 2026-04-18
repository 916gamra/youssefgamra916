import React, { useState, useRef } from 'react';
import { HardDriveDownload, HardDriveUpload, Disc, ShieldCheck, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/shared/components/GlassCard';
import { toast } from 'sonner';
import { db } from '@/core/db';
import 'dexie-export-import';

export function DataCoreView() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Export Dexie DB to Blob
      const blob = await db.export({ prettyJson: true, progressCallback: ({totalRows, completedRows}) => {
         // optional progress indicator
      }});

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TITANIC_OS_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('System Backup Completed Successfully', {
        description: 'Store this file in a secure location.',
      });
      
    } catch (error) {
      console.error(error);
      toast.error('Backup Failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    if (window.confirm("WARNING: Importing a backup will overwrite existing local data. Existing records might be lost if they conflict. Are you sure you want to proceed?")) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      
      await db.transaction('rw', db.tables, async () => {
         // Clear all tables before import to ensure a clean slate based on the backup
         await Promise.all(db.tables.map(table => table.clear()));
         await db.import(file, {
            overwriteValues: true,
            clearTablesBeforeImport: true
         });
      });

      toast.success('System Restored Successfully', {
        description: 'The database has been updated with the imported backup.',
        icon: <ShieldCheck className="text-emerald-400" />
      });
      
      // Force reload to state flush
      setTimeout(() => window.location.reload(), 1500);
      
    } catch (error) {
      console.error(error);
      toast.error('Restoration Failed', {
         description: 'The backup file might be corrupted or incompatible with this version.'
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="pt-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-white tracking-tight mb-2 flex items-center gap-3">
          <Disc className="w-8 h-8 text-rose-400" /> Data Core & Neural Backup
        </h1>
        <p className="text-white/50 text-lg">Manage the Offline-First DNA. Secure local data or restore operations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backup Card */}
        <GlassCard className="p-8 border border-rose-500/20 bg-rose-500/5 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-rose-500/20 transition-all duration-700" />
          
          <div className="relative z-10 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6 shadow-inner">
               <HardDriveDownload className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Extract Snapshot</h2>
            <p className="text-white/50 leading-relaxed text-sm">
              Creates an encrypted, highly compressed serialized JSON snapshot of all PDRs, Users, Schedules, and local Master Data.
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="relative z-10 w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isExporting ? (
              <span className="animate-pulse">Extracting Data Core...</span>
            ) : (
              <>Download System Backup</>
            )}
          </button>
        </GlassCard>

        {/* Restore Card */}
        <GlassCard className="p-8 border border-amber-500/20 bg-amber-500/5 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
          
          <div className="relative z-10 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-inner">
               <HardDriveUpload className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Inject DNA</h2>
            <p className="text-amber-400/70 leading-relaxed text-sm">
              Restore the system from a previous snapshot. 
              <span className="block mt-2 text-white/40"><AlertTriangle className="w-4 h-4 inline-block mr-1 text-amber-400"/> Warning: Current local data will be fully overwritten.</span>
            </p>
          </div>

          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />

          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="relative z-10 w-full py-4 rounded-xl bg-black/40 border border-amber-500/30 hover:bg-amber-500/10 text-amber-400 font-bold uppercase tracking-widest text-sm transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isImporting ? (
              <span className="animate-pulse flex items-center gap-2"><Disc className="w-4 h-4 animate-spin"/> Rewriting Database...</span>
            ) : (
              <>Load DNA File</>
            )}
          </button>
        </GlassCard>

      </div>
    </div>
  );
}
