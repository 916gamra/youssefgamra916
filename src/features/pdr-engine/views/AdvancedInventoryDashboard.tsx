import React, { useState, useEffect } from 'react';
import { db } from '@/core/db';
import { AlertTriangle, AlertCircle, Package } from 'lucide-react';

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

  if (isLoading) {
    return <div className="text-center py-12 text-slate-400">Aggregating telemetry...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="mb-8 border-b border-white/5 pb-4">
        <h1 className="text-3xl font-semibold text-slate-100 tracking-tight mb-2">Inventory Surveillance</h1>
        <p className="text-slate-400 text-lg">Real-time stock anomaly detection and categorization.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-md">
          <p className="text-slate-400 text-sm font-medium mb-2">Tracked Items</p>
          <p className="text-4xl font-bold text-blue-400">{stats.totalItems}</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 shadow-md">
          <p className="text-amber-500/80 text-sm font-medium mb-2">Low Stock</p>
          <p className="text-4xl font-bold text-amber-500">{stats.lowStockItems}</p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 shadow-md">
          <p className="text-rose-500/80 text-sm font-medium mb-2">Depleted</p>
          <p className="text-4xl font-bold text-rose-500">{stats.outOfStockItems}</p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 shadow-md">
          <p className="text-red-500/80 text-sm font-medium mb-2">Negative Anomalies</p>
          <p className="text-4xl font-bold text-red-500">{stats.negativeStockItems}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" /> Catalog Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(stats.categories).map(([category, count]) => (
            <div key={category} className="bg-black/20 rounded-xl p-4 text-center border border-white/5">
              <p className="text-2xl font-bold text-slate-300">{count}</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{category}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" /> Action Required ({issues.length})
        </h3>

        {issues.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
            <p className="text-slate-400 font-medium">All stock parameters operating within normal thresholds.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl flex items-start gap-4 border ${
                  issue.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : issue.severity === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <AlertCircle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    issue.severity === 'critical'
                      ? 'text-red-500'
                      : issue.severity === 'error'
                      ? 'text-rose-500'
                      : 'text-amber-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">{issue.reference}</p>
                  <p className="text-sm font-medium mt-1 opacity-90 text-inherit">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
