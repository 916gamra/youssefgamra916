import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { useAuditTrail } from '../hooks/useAuditTrail';
import { 
  ShieldAlert, 
  Search, 
  Trash2, 
  Calendar, 
  User, 
  Activity, 
  Info, 
  AlertTriangle, 
  AlertOctagon,
  Download,
  Filter
} from 'lucide-react';
import { cn } from '@/shared/utils';

export function AuditTrailView() {
  const { logs, clearLogs } = useAuditTrail();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [logs, searchTerm, severityFilter]);

  const exportLogsAsCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity', 'Severity', 'Details'];
    const rows = filteredLogs.map(l => [
      new Date(l.timestamp).toLocaleString(),
      l.userName,
      l.action,
      l.entityType,
      l.severity,
      l.details.replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertOctagon className="w-4 h-4 text-rose-500" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="pt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-white tracking-tight mb-2 flex items-center gap-3">
             <ShieldAlert className="w-8 h-8 text-rose-400" /> System Audit Trail
           </h1>
           <p className="text-[#8b9bb4] text-lg">Real-time immutable log of all critical system operations.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
             onClick={exportLogsAsCSV}
             className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-[#8b9bb4] hover:text-white transition-all flex items-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
             onClick={clearLogs}
             className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 shadow-[inset_0_1px_rgba(255,255,255,0.05),_0_0_10px_rgba(244,63,94,0.1)] border border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-rose-400 transition-all flex items-center gap-2 active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> Purge Logs
          </button>
        </div>
      </header>

      {/* Stats Quick Look */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <GlassCard className="p-4 bg-white/[0.02]">
            <div className="text-[10px] text-[#8b9bb4] uppercase font-bold tracking-widest mb-1">Total Events</div>
            <div className="text-2xl font-mono text-white">{logs.length}</div>
         </GlassCard>
         <GlassCard className="p-4 bg-white/[0.02]">
            <div className="text-[10px] text-rose-400/80 uppercase font-bold tracking-widest mb-1">Critical Alerts</div>
            <div className="text-2xl font-mono text-rose-400">{logs.filter(l => l.severity === 'CRITICAL').length}</div>
         </GlassCard>
         <GlassCard className="p-4 bg-white/[0.02]">
            <div className="text-[10px] text-amber-400/80 uppercase font-bold tracking-widest mb-1">Warnings</div>
            <div className="text-2xl font-mono text-amber-400">{logs.filter(l => l.severity === 'WARNING').length}</div>
         </GlassCard>
         <GlassCard className="p-4 bg-white/[0.02]">
            <div className="text-[10px] text-cyan-400/80 uppercase font-bold tracking-widest mb-1">Info Streams</div>
            <div className="text-2xl font-mono text-cyan-400">{logs.filter(l => l.severity === 'INFO').length}</div>
         </GlassCard>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9bb4]" />
           <input 
             type="text" 
             placeholder="Search by user, action, or entity..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full titan-input pl-12"
           />
         </div>
         
         <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 w-full md:w-auto h-full items-center shadow-inner">
            {(['ALL', 'INFO', 'WARNING', 'CRITICAL'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  severityFilter === sev ? "bg-white/10 text-white shadow-sm" : "text-[#8b9bb4] hover:text-white/80"
                )}
              >
                {sev}
              </button>
            ))}
         </div>
      </div>

      <GlassCard className="overflow-hidden p-0 border-white/5">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/10">
                 <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b9bb4]">Timestamp</th>
                 <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b9bb4]">User</th>
                 <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b9bb4]">Operation</th>
                 <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b9bb4]">Target</th>
                 <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#8b9bb4]">Details</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/[0.02]">
               {filteredLogs.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-white/30 italic text-sm">No audit logs match your current telemetry filter.</td>
                 </tr>
               ) : (
                 filteredLogs.map(log => (
                   <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2 text-xs font-mono text-[#8b9bb4] group-hover:text-white/80">
                         <Calendar className="w-3 h-3 text-rose-400 opacity-50" />
                         {new Date(log.timestamp).toLocaleString()}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-[10px] font-bold text-rose-400 border border-rose-500/20 shadow-inner">
                            {log.userName.charAt(0)}
                         </div>
                         <span className="text-sm font-medium text-white/90 drop-shadow-md">{log.userName}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           {getSeverityIcon(log.severity)}
                           <span className="text-xs font-bold uppercase tracking-wider text-white/80 drop-shadow-md">{log.action}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-[#8b9bb4]">
                           <Activity className="w-3 h-3 opacity-50" />
                           <span className="font-mono text-white/70">{log.entityType}</span>
                           <span className="text-[10px] opacity-40">({log.entityId.substring(0,8)})</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="text-xs text-white/50 line-clamp-1 group-hover:line-clamp-none transition-all duration-300 max-w-md group-hover:text-white/90">
                           {log.details}
                        </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
      </GlassCard>
    </div>
  );
}
