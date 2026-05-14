import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { Info, Cpu, HardDrive } from 'lucide-react';

export function MachineRegistryView() {
  const machines = useLiveQuery(() => db.machines.toArray(), []);
  const blueprints = useLiveQuery(() => db.machineBlueprints.toArray(), []);
  const machineTasks = useLiveQuery(() => db.machineTasks.toArray(), []);

  const getMachineData = () => {
    if (!machines || !blueprints || !machineTasks) return [];

    return machines.map(m => {
      const blueprint = blueprints.find(b => b.id === m.blueprintId);
      const inheritedTasksCount = machineTasks.filter(mt => mt.machineId === m.id && mt.isInherited).length;
      
      return {
        ...m,
        blueprintName: blueprint ? blueprint.reference : 'Unknown Blueprint',
        tasksCount: inheritedTasksCount,
        lastMaintenance: 'No Data', // Needs real data in the future
      };
    });
  };

  const data = getMachineData();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] p-6 space-y-6 text-slate-200 custom-scrollbar overflow-y-auto">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight font-sans">
             Machine Registry
          </h1>
          <p className="text-slate-400 text-sm mt-2 rtl:text-right font-medium text-emerald-400/80" dir="rtl">
            تسجيل الآلات وتوريث المهام (Inheritance)
          </p>
        </div>
      </header>

      <div className="bg-[#12141c] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 font-bold text-slate-300">آخر صيانة</th>
                <th className="px-6 py-4 font-bold text-slate-300">المهام المورثة</th>
                <th className="px-6 py-4 font-bold text-slate-300">الحالة</th>
                <th className="px-6 py-4 font-bold text-slate-300">الطراز (Blueprint)</th>
                <th className="px-6 py-4 font-bold text-slate-300">كود الآلة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-slate-400 font-mono text-sm">{row.lastMaintenance}</td>
                  <td className="px-6 py-4 text-slate-300 font-medium">
                    {row.tasksCount} مهمة وقائية
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-3 py-1 rounded border text-xs font-bold tracking-widest uppercase ${
                        row.status === 'Active' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' : 
                        row.status === 'Standby' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                        'text-slate-400 border-slate-400/20 bg-slate-400/10'
                     }`}>
                       {row.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{row.blueprintName}</td>
                  <td className="px-6 py-4 font-bold text-emerald-400 tracking-wider">{row.referenceCode}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-12 text-center text-slate-500">
                      لا توجد آلات مسجلة. قم بتسجيل آلة أولاً من قائمة النظام.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="bg-[#0c1618] border border-cyan-500/20 rounded-xl p-4 flex gap-3 rtl:flex-row-reverse text-right items-center">
            <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            <p className="text-sm font-medium text-cyan-300" dir="rtl">
              بمجرد اختيار Blueprint (مثل Satinage Machine)، قام النظام آلياً بجلب المهام الوقائية المرتبطة به وتطبيقها على الآلة.
            </p>
        </div>
      </div>
    </div>
  );
}
