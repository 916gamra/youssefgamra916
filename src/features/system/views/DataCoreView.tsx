import React, { useState, useRef, useEffect } from 'react';
import { HardDriveDownload, HardDriveUpload, Disc, ShieldCheck, AlertTriangle, Terminal, RefreshCw, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { db, User } from '@/core/db';
import { motion, AnimatePresence } from 'motion/react';
import { useAuditTrail } from '../hooks/useAuditTrail';

export function DataCoreView({ user }: { user: User | null }) {
  const { logEvent } = useAuditTrail();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progressData, setProgressData] = useState<{ total: number, completed: number }>({ total: 0, completed: 0 });
  const [dbStats, setDbStats] = useState<{tables: number, rows: number}>({ tables: 0, rows: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch quick stats to show the user what they are backing up
  useEffect(() => {
    const fetchStats = async () => {
      let totalRows = 0;
      for (const table of db.tables) {
        totalRows += await table.count();
      }
      setDbStats({ tables: db.tables.length, rows: totalRows });
    };
    fetchStats();
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setProgressData({ total: dbStats.rows || 100, completed: 0 });
      
      const blob = await db.export({ 
        prettyJson: true, 
        progressCallback: ({ totalRows, completedRows }) => {
          setProgressData({ total: totalRows, completed: completedRows });
          return true; // continue
        }
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Industrial filename format
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `TITANIC_CORE_DUMP_${dateStr}.json`;
      
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      await logEvent({
        userId: user?.id || 'GUEST',
        userName: user?.name || 'Guest User',
        action: 'EXPORT',
        entityType: 'DATABASE',
        entityId: 'SYSTEM',
        details: 'Full system backup exported to JSON payload.',
        severity: 'INFO'
      });

      toast.success('Core Snapshot Extracted', {
        description: 'Store this payload in an air-gapped secure location.',
      });
      
    } catch (error) {
      console.error(error);
      toast.error('System Failure', { description: 'Could not extract core snapshot.' });
    } finally {
      setIsExporting(false);
      setProgressData({ total: 0, completed: 0 });
    }
  };

  const handleImportClick = () => {
    if (window.confirm("CRITICAL WARNING: You are about to initiate a Core DNA Injection. This will completely purge existing local records and overwrite the system state. Proceed?")) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setProgressData({ total: 100, completed: 0 }); // Placeholder until native import calculates
      
      const fileName = file.name;

      await db.transaction('rw', db.tables, async () => {
         await Promise.all(db.tables.map(table => table.clear()));
         await db.import(file, {
            overwriteValues: true,
            clearTablesBeforeImport: true,
            progressCallback: ({ totalRows, completedRows }) => {
              setProgressData({ total: totalRows, completed: completedRows });
              return true;
            }
         });
      });

      await logEvent({
        userId: user?.id || 'GUEST',
        userName: user?.name || 'Guest User',
        action: 'IMPORT',
        entityType: 'DATABASE',
        entityId: 'SYSTEM',
        details: `System state overwritten by imported file: ${fileName}`,
        severity: 'CRITICAL'
      });

      toast.success('DNA Injection Complete', {
        description: 'System state overwritten. Rebooting UI matrix.',
        icon: <ShieldCheck className="text-emerald-400" />
      });
      
      setTimeout(() => window.location.reload(), 2000);
      
    } catch (error) {
      console.error(error);
      toast.error('Injection Failed', {
         description: 'The DNA payload is corrupted, tampered with, or incompatible.'
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const progressPercentage = progressData.total > 0 ? Math.round((progressData.completed / progressData.total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 pt-4 px-6 md:px-0 bg-[#0a0a0f]">
      <header className="flex flex-col gap-2 relative">
        <div className="absolute -top-10 -left-10 w-96 h-96 bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
        <h1 className="text-4xl font-black italic text-white tracking-tighter mb-2 flex items-center gap-4 uppercase">
          <Disc className="w-10 h-10 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
          Neural Core Backup
        </h1>
        <p className="text-[#8b9bb4] uppercase tracking-[0.3em] text-[10px] font-bold flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
          Level 7 Data Persistence & Recovery Matrix
        </p>
      </header>

      {/* Stats Terminal */}
      <div className="titan-card p-0 overflow-hidden bg-black/40 relative border-white/10 group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Terminal className="w-48 h-48 text-rose-500" />
        </div>
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Matrix Status: Operational / Air-Gapped</span>
        </div>
        <div className="p-10 grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
           <div className="space-y-1">
              <div className="text-[10px] text-[#8b9bb4] uppercase tracking-widest font-black opacity-60">Tables</div>
              <div className="text-3xl font-black text-white italic">{dbStats.tables}</div>
           </div>
           <div className="space-y-1">
              <div className="text-[10px] text-[#8b9bb4] uppercase tracking-widest font-black opacity-60">Logic Nodes</div>
              <div className="text-3xl font-black text-rose-500 italic flex items-center gap-3">
                {dbStats.rows} <RefreshCw className="w-5 h-5 text-rose-500/40 animate-spin-slow" />
              </div>
           </div>
           <div className="space-y-1">
              <div className="text-[10px] text-[#8b9bb4] uppercase tracking-widest font-black opacity-60">Persistence</div>
              <div className="text-xs font-black text-emerald-400 uppercase tracking-tighter mt-1 bg-emerald-500/10 px-3 py-1 rounded w-fit border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                Local-Only DNA
              </div>
           </div>
           <div className="space-y-1">
              <div className="text-[10px] text-[#8b9bb4] uppercase tracking-widest font-black opacity-60">Encryption</div>
              <div className="text-xs font-black text-cyan-400 uppercase tracking-tighter mt-1 bg-cyan-500/10 px-3 py-1 rounded w-fit border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                AES-T7 (Ready)
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Backup Card */}
        <div className="titan-card p-10 border-rose-500/10 bg-rose-500/[0.01] hover:bg-rose-500/[0.03] relative overflow-hidden flex flex-col justify-between group h-[400px] transition-all duration-700">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/[0.05] rounded-full blur-[100px] pointer-events-none group-hover:bg-rose-500/10 transition-all duration-1000" />
          
          <div className="relative z-10 mb-8">
            <div className="w-20 h-20 rounded-[1.25rem] bg-rose-500/5 border border-rose-500/20 flex items-center justify-center mb-8 shadow-inner relative overflow-hidden group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
               {isExporting && <div className="absolute inset-0 bg-rose-500/20 animate-pulse" />}
               <HardDriveDownload className="w-10 h-10 text-rose-500 drop-shadow-[0_0_10px_#f43f5e] relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tighter italic uppercase">CORE EXTRACTION</h2>
            <p className="text-[#8b9bb4] leading-relaxed text-xs font-medium italic">
              Initiate a high-speed serialization protocol to capture the entire system state into a portable JSON artifact.
            </p>
          </div>

          <div className="relative z-10">
             <AnimatePresence>
               {isExporting && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
                    <div className="flex justify-between text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">
                       <span>Extraction Integrity</span>
                       <span className="font-mono">{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div 
                        className="h-full bg-rose-500 shadow-[0_0_15px_#f43f5e]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ ease: "linear", duration: 0.2 }}
                      />
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <button
                onClick={handleExport}
                disabled={isExporting || isImporting}
                className="w-full py-5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-black font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_30px_rgba(244,63,94,0.2)] hover:shadow-[0_0_40px_rgba(244,63,94,0.4)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4 relative overflow-hidden active:scale-95 group/btn"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                {isExporting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>SYNCHRONIZING...</span>
                  </>
                ) : (
                  <>
                    <FileJson className="w-5 h-5" />
                    <span>Download SNAPSHOT</span>
                  </>
                )}
             </button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="titan-card p-10 border-amber-500/10 bg-amber-500/[0.01] hover:bg-amber-500/[0.03] relative overflow-hidden flex flex-col justify-between group h-[400px] transition-all duration-700">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.05] rounded-full blur-[100px] pointer-events-none group-hover:bg-amber-500/10 transition-all duration-1000" />
          
          <div className="relative z-10 mb-8">
            <div className="w-20 h-20 rounded-[1.25rem] bg-amber-500/5 border border-amber-500/20 flex items-center justify-center mb-8 shadow-inner relative overflow-hidden group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
               {isImporting && <div className="absolute inset-0 bg-amber-500/20 animate-pulse" />}
               <HardDriveUpload className="w-10 h-10 text-amber-500 drop-shadow-[0_0_10px_#f59e0b] relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tighter italic uppercase">CORE INJECTION</h2>
            <p className="text-amber-500/60 leading-relaxed text-xs font-medium italic">
              Restore historical DNA. Warning: This protocol executes a comprehensive memory wipe before state reconstruction.
            </p>
          </div>

          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />

          <div className="relative z-10">
             <AnimatePresence>
               {isImporting && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
                    <div className="flex justify-between text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">
                       <span>Injection Flux</span>
                       <span className="font-mono">{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div 
                        className="h-full bg-amber-500 shadow-[0_0_15px_#f59e0b]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ ease: "linear", duration: 0.2 }}
                      />
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

            <button
              onClick={handleImportClick}
              disabled={isImporting || isExporting}
              className="w-full py-5 rounded-2xl bg-black/60 border border-amber-500/30 hover:bg-amber-500/10 text-amber-500 font-black uppercase tracking-[0.2em] text-xs transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4 relative overflow-hidden active:scale-95 group/bit"
            >
              <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover/bit:translate-x-[100%] transition-transform duration-700" />
              {isImporting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>REWRITING DNA...</span>
                </>
              ) : (
                <>
                  <HardDriveUpload className="w-5 h-5" />
                  <span>Upload PAYLOAD</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

