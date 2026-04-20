import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { AlertTriangle, CheckCircle, ArrowRightLeft, Wrench, ShieldCheck, FileWarning, Search, RefreshCw, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export function ReconciliationCenterView() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch anomalies via live query
  const anomalies = useLiveQuery(async () => {
    const allItems = await db.inventory.toArray();
    const blueprints = await db.pdrBlueprints.toArray();
    const bpMap = new Map(blueprints.map(bp => [bp.id, bp]));

    const detected: any[] = [];

    allItems.forEach(item => {
      const bp = bpMap.get(item.blueprintId);
      const minThreshold = bp?.minThreshold || 0;

      if (item.quantityCurrent < 0) {
        detected.push({
          id: item.id,
          blueprintId: item.blueprintId,
          reference: bp?.reference || 'UNKNOWN',
          type: 'NEGATIVE_STOCK',
          severity: 'CRITICAL',
          currentValue: item.quantityCurrent,
          description: 'Stock quantity falls below absolute zero.',
          recommendedAction: 'Reset to 0 and log an INVENTORY_ADJUSTMENT movement.'
        });
      } else if (item.quantityCurrent === 0) {
        detected.push({
          id: item.id,
          blueprintId: item.blueprintId,
          reference: bp?.reference || 'UNKNOWN',
          type: 'DEPLETED',
          severity: 'HIGH',
          currentValue: item.quantityCurrent,
          description: 'Stock is completely depleted.',
          recommendedAction: 'Initiate urgent Purchase Order or check unlogged receipts.'
        });
      } else if (item.quantityCurrent < minThreshold) {
        detected.push({
          id: item.id,
          blueprintId: item.blueprintId,
          reference: bp?.reference || 'UNKNOWN',
          type: 'LOW_STOCK',
          severity: 'MEDIUM',
          currentValue: item.quantityCurrent,
          threshold: minThreshold,
          description: `Stock is below the minimum threshold (${minThreshold}).`,
          recommendedAction: 'Plan standard procurement requisition.'
        });
      }
    });

    return detected.sort((a, b) => {
      const sMap = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
      return sMap[a.severity as keyof typeof sMap] - sMap[b.severity as keyof typeof sMap];
    });
  });

  const handleFixNegative = async (item: any) => {
    try {
      setIsProcessing(true);
      
      // 1. Reset Inventory Quantity to 0
      await db.inventory.update(item.id, {
        quantityCurrent: 0,
        updatedAt: new Date().toISOString()
      });

      // 2. Log an adjustment movement
      const adjustmentQty = Math.abs(item.currentValue);
      await db.movements.add({
        id: crypto.randomUUID(),
        stockId: item.blueprintId, // using blueprintId as stock reference representation here depending on schema
        type: 'ADJUST',
        quantity: adjustmentQty,
        performedBy: 'Auto-Reconciliation System',
        timestamp: new Date().toISOString(),
        notes: `System auto-reconciliation: Compensated negative deficit (${item.currentValue}) to 0.`
      });

      toast.success(`Anomaly Resolved: ${item.reference}`, {
        description: `Stock reset to 0. Logged adjustment of +${adjustmentQty}.`
      });
    } catch (error: any) {
      toast.error('Reconciliation Failed', { description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchFixNegatives = async () => {
    if (!anomalies) return;
    const negatives = anomalies.filter(a => a.type === 'NEGATIVE_STOCK');
    if (negatives.length === 0) return;

    try {
      setIsProcessing(true);
      let count = 0;
      
      await db.transaction('rw', db.inventory, db.movements, async () => {
        for (const item of negatives) {
          await db.inventory.update(item.id, {
            quantityCurrent: 0,
            updatedAt: new Date().toISOString()
          });

          const adjustmentQty = Math.abs(item.currentValue);
          await db.movements.add({
            id: crypto.randomUUID(),
            stockId: item.blueprintId,
            type: 'ADJUST',
            quantity: adjustmentQty,
            performedBy: 'Auto-Reconciliation System',
            timestamp: new Date().toISOString(),
            notes: `Batch auto-reconciliation: Compensated negative deficit (${item.currentValue}) to 0.`
          });
          count++;
        }
      });

      toast.success('Batch Reconciliation Complete', {
        description: `Successfully resolved ${count} critical negative stock anomalies.`
      });
    } catch (error: any) {
      toast.error('Batch Reconciliation Failed', { description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePO = (item: any) => {
    // In a real application, this would route to the Procurement tab with pre-filled context
    toast.info('Procurement Triggered', {
      description: `Drafting Purchase Order for ${item.reference}. Redirecting to Procurement module...`
    });
  };

  const filteredAnomalies = anomalies?.filter(a => 
    a.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700/50 pb-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-100 tracking-tight mb-2 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-500" /> Auto-Reconciliation Center
          </h1>
          <p className="text-slate-400 text-lg">Resolve data inconsistencies, negative stock, and supply deficits.</p>
        </div>
        
        {anomalies && anomalies.filter(a => a.type === 'NEGATIVE_STOCK').length > 0 && (
          <button 
            onClick={handleBatchFixNegatives}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
            Batch Fix All Negative Anomalies
          </button>
        )}
      </header>

      {/* Metrics & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <p className="text-sm font-medium text-slate-400 mb-1">Total Detected Anomalies</p>
          <p className="text-3xl font-bold text-slate-200">{anomalies?.length || 0}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
          <p className="text-sm font-medium text-red-400 mb-1">Critical (Negative)</p>
          <p className="text-3xl font-bold text-red-500">
            {anomalies?.filter(a => a.type === 'NEGATIVE_STOCK').length || 0}
          </p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5">
          <p className="text-sm font-medium text-rose-400 mb-1">High (Depleted)</p>
          <p className="text-3xl font-bold text-rose-500">
            {anomalies?.filter(a => a.type === 'DEPLETED').length || 0}
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
          <p className="text-sm font-medium text-amber-400 mb-1">Medium (Low Stock)</p>
          <p className="text-3xl font-bold text-amber-500">
            {anomalies?.filter(a => a.type === 'LOW_STOCK').length || 0}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Filter anomalies by Ref or Type..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 rounded-xl pl-12 pr-4 py-3 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies?.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-xl font-medium text-slate-200 mb-2">Systems Nominal</h3>
            <p className="text-slate-400">No anomalies or stock inconsistencies detected.</p>
          </div>
        ) : (
          filteredAnomalies?.map((anomaly) => (
            <div 
              key={anomaly.id} 
              className={`bg-slate-800/50 border rounded-xl p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between transition-colors ${
                anomaly.severity === 'CRITICAL' ? 'border-red-500/30 hover:border-red-500/50' :
                anomaly.severity === 'HIGH' ? 'border-rose-500/30 hover:border-rose-500/50' :
                'border-amber-500/30 hover:border-amber-500/50'
              }`}
            >
              <div className="flex gap-4 items-start md:items-center">
                <div className={`p-3 rounded-lg flex-shrink-0 ${
                  anomaly.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                  anomaly.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-500' :
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  {anomaly.severity === 'CRITICAL' && <FileWarning className="w-6 h-6" />}
                  {anomaly.severity === 'HIGH' && <AlertTriangle className="w-6 h-6" />}
                  {anomaly.severity === 'MEDIUM' && <ArrowRightLeft className="w-6 h-6" />}
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-slate-200 uppercase tracking-wide">{anomaly.reference}</h3>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      anomaly.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      anomaly.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {anomaly.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{anomaly.description} <span className="font-mono text-slate-300">[{anomaly.currentValue}]</span></p>
                  
                  <div className="bg-black/20 rounded-md p-3 border border-slate-700/50 text-sm">
                    <span className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px] font-bold">Recommended Resolution</span>
                    <span className="text-slate-300">{anomaly.recommendedAction}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-3 flex-shrink-0 ml-auto md:ml-0">
                {anomaly.severity === 'CRITICAL' ? (
                  <button
                    onClick={() => handleFixNegative(anomaly)}
                    disabled={isProcessing}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-slate-600 hover:border-slate-500"
                  >
                    <CheckCircle className="w-4 h-4" /> Resolve to 0
                  </button>
                ) : (
                  <button
                    onClick={() => handleGeneratePO(anomaly)}
                    disabled={isProcessing}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" /> Issue Requisition
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
