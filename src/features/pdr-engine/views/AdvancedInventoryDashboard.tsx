import React, { useState, useEffect } from 'react';
import { db } from '@/core/db';
import { AlertTriangle, AlertCircle, Package, Database, ShieldAlert, BarChart3, Search, Zap } from 'lucide-react';
import { GlassCard } from '@/shared/components/GlassCard';
import { cn } from '@/shared/utils';

export function AdvancedInventoryDashboard() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    negativeStockItems: 0,
    categories: {} as Record<string, number>
  });

  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const allItems = await db.inventory.toArray();
      const allBlueprints = await db.pdrBlueprints.toArray();

      const blueprintMap = new Map(allBlueprints.map(bp => [bp.id, bp]));

      const calculatedStats = {
        totalItems: allItems.length,
        lowStockItems: 0,
        outOfStockItems: 0,
        negativeStockItems: 0,
        categories: {} as Record<string, number>
      };

      const issuesList: any[] = [];

      allItems.forEach(item => {
        const bp = blueprintMap.get(item.blueprintId);
        const minThreshold = bp?.minThreshold || 0;
        const category = bp?.templateId || 'Uncategorized';
        
        calculatedStats.categories[category] = (calculatedStats.categories[category] || 0) + 1;

        if (item.quantityCurrent < 0) {
          calculatedStats.negativeStockItems++;
          issuesList.push({
            type: 'negative_stock',
            severity: 'critical',
            reference: bp?.reference || item.blueprintId,
            value: item.quantityCurrent,
            message: `Negative stock detected: ${item.quantityCurrent}`
          });
        } else if (item.quantityCurrent === 0) {
          calculatedStats.outOfStockItems++;
          issuesList.push({
            type: 'out_of_stock',
            severity: 'error',
            reference: bp?.reference || item.blueprintId,
            message: `Stock level depleted (0)`
          });
        } else if (item.quantityCurrent <= minThreshold) {
          calculatedStats.lowStockItems++;
          issuesList.push({
            type: 'low_stock',
            severity: 'warning',
            reference: bp?.reference || item.blueprintId,
            value: item.quantityCurrent,
            minThreshold: minThreshold,
            message: `Low stock warning (${item.quantityCurrent}/${minThreshold})`
          });
        }
      });

      setStats(calculatedStats);
      setIssues(issuesList.sort((a, b) => {
        const severityOrder = { critical: 0, error: 1, warning: 2 };
        return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
      }));
    } catch (error) {
      console.error('Failed to load advanced dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => 
    issue.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-slate-500">
        <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Syncing Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12 px-4 lg:px-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
            <ShieldAlert className="w-8 h-8 text-cyan-500" /> Inventory Surveillance
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80 font-sans">Real-time stock anomaly detection and categorization.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          <StatCompact icon={<Database className="w-4 h-4 text-cyan-500" />} label="Tracked" value={stats.totalItems.toString()} />
          <StatCompact icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} label="Low" value={stats.lowStockItems.toString()} />
          <StatCompact icon={<AlertCircle className="w-4 h-4 text-rose-500" />} label="Empty" value={stats.outOfStockItems.toString()} />
          <StatCompact icon={<ShieldAlert className="w-4 h-4 text-red-500" />} label="Critical" value={stats.negativeStockItems.toString()} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl h-full">
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Anomalies</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System-wide resource inconsistencies</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Scan logs..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="titan-input pl-11 w-64 shadow-none"
                  />
                </div>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredIssues.length === 0 ? (
                <div className="py-32 text-center opacity-20">
                  <ShieldAlert className="w-20 h-20 mx-auto mb-4 text-white" />
                  <p className="text-lg font-bold uppercase tracking-widest text-white">No active anomalies detected</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {filteredIssues.map((issue, idx) => (
                    <div key={idx} className="group p-6 hover:bg-white/[0.02] transition-colors flex items-start gap-5">
                      <div className={cn(
                        "p-3 rounded-xl border shrink-0",
                        issue.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        issue.severity === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      )}>
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate">{issue.reference}</h4>
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border",
                            issue.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            issue.severity === 'error' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          )}>
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-400 leading-relaxed">{issue.message}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-widest mb-1">Status</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">UNRESOLVED</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-2xl rounded-3xl">
            <div className="p-6 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-cyan-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Resource Distribution</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(stats.categories).map(([category, count]) => (
                <div key={category} className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{category}</span>
                    <span className="text-xs font-bold text-slate-300">Catalog Group</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-light text-white font-mono">{count}</span>
                    <div className="w-1.5 h-6 rounded-full bg-cyan-500/20 group-hover:bg-cyan-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-8 border-white/5 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <Zap className="w-10 h-10 text-cyan-400 mb-6 opacity-50 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">Automated Optimization</h3>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">System is running background reconciliation protocols to stabilize inventory drift.</p>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engine Secure</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-500/10 blur-[60px] rounded-full" />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function StatCompact({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-base font-bold text-white -mt-0.5">{value}</span>
      </div>
    </div>
  );
}
