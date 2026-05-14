import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Machine, Technician, Sector, TaskExecution, PreventiveTask, MachineBlueprint } from '@/core/db';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, LayoutGrid, List as ListIcon, Search, AlertTriangle, ChevronRight, X, User, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay, startOfWeek, endOfWeek, differenceInDays } from 'date-fns';
import { GlassCard } from '@/shared/components/GlassCard';

type ViewMode = 'CALENDAR' | 'GRID' | 'LIST';

export function PreventiveRadarView() {
  const [viewMode, setViewMode] = useState<ViewMode>('CALENDAR');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // DB Data
  const machines = useLiveQuery(() => db.machines.toArray(), []) || [];
  const technicians = useLiveQuery(() => db.technicians.toArray(), []) || [];
  const sectors = useLiveQuery(() => db.sectors.toArray(), []) || [];
  const machineTasks = useLiveQuery(() => db.machineTasks.toArray(), []) || [];
  const executions = useLiveQuery(() => db.taskExecutions.toArray(), []) || [];
  const preventiveTasks = useLiveQuery(() => db.preventiveTasks.toArray(), []) || [];
  const blueprints = useLiveQuery(() => db.machineBlueprints.toArray(), []) || [];
  const inventory = useLiveQuery(() => db.inventory.toArray(), []) || [];
  const pdrBlueprints = useLiveQuery(() => db.pdrBlueprints.toArray(), []) || [];
  const partMappings = useLiveQuery(() => db.machinePartMappings.toArray(), []) || [];

  // Modals state
  const [closingExecutionId, setClosingExecutionId] = useState<string | null>(null);
  const [closingDuration, setClosingDuration] = useState(15);
  const [closingNotes, setClosingNotes] = useState('');
  
  const [printingMachineId, setPrintingMachineId] = useState<string | null>(null);

  // Monthly logic 
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  const daysInMonth = useMemo(() => {
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthStart, monthEnd]);

  // Aggregate Data
  const enrichedMachines = useMemo(() => {
    return machines.map(m => {
      const tech = technicians.find(t => t.id === m.technicianId);
      const sector = sectors.find(s => s.id === m.sectorId);
      const mTasks = machineTasks.filter(mt => mt.machineId === m.id && mt.isEnabled);
      const blueprint = blueprints.find(b => b.id === m.blueprintId);
      
      // 30-Day Rule Logic
      const machineExecs = executions.filter(ex => ex.machineId === m.id && ex.status === 'COMPLETED');
      let daysSinceLast = 0;
      if (machineExecs.length > 0) {
         const lastDate = Math.max(...machineExecs.map(e => new Date(e.executedAt || e.scheduledDate).getTime()));
         daysSinceLast = differenceInDays(currentDate, new Date(lastDate));
      } else {
         // If never executed, we could use creation date or just flag it if tasks exist.
         // We'll treat it as 999 days to trigger the alarm if tasks are present.
         daysSinceLast = mTasks.length > 0 ? 999 : 0;
      }

      const scheduledThisMonth = executions.filter(ex => 
        ex.machineId === m.id && 
        isSameMonth(new Date(ex.scheduledDate), currentDate)
      );

      // Awareness Logic
      let awarenessLevel: 'RED' | 'GOLD' | 'CYAN' | 'GREEN' = 'GREEN';
      let awarenessMessage = '';

      if (!m.technicianId || !m.sectorId || !m.blueprintId) {
        awarenessLevel = 'RED';
        awarenessMessage = 'MISSING PILLARS (TECH/SECTOR/BP)';
      } else if (mTasks.length > 0 && daysSinceLast >= 30) {
        awarenessLevel = 'RED';
        awarenessMessage = `CRITICAL: ${daysSinceLast === 999 ? 'NEVER COMPLETED' : `${daysSinceLast} DAYS OVERDUE`}`;
      } else if (mTasks.length > 0 && daysSinceLast >= 25) {
        awarenessLevel = 'GOLD';
        awarenessMessage = `WARNING: approaching limit (${daysSinceLast} days)`;
      } else if (mTasks.length === 0) {
        awarenessLevel = 'CYAN';
        awarenessMessage = 'NO PREVENTIVE TASKS ASSIGNED';
      }

      return {
        ...m,
        technician: tech,
        sector: sector,
        taskCount: mTasks.length,
        awarenessLevel,
        awarenessMessage,
        scheduledExecutions: scheduledThisMonth,
        blueprintName: blueprint ? blueprint.reference : 'Unlinked',
      };
    }).filter(m => {
      const matchSearch = m.referenceCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTech = selectedTech === 'ALL' || m.technicianId === selectedTech;
      const matchSector = selectedSector === 'ALL' || m.sectorId === selectedSector;
      return matchSearch && matchTech && matchSector;
    });
  }, [machines, technicians, sectors, machineTasks, executions, currentDate, searchTerm, selectedTech, selectedSector, blueprints]);

  // Calendar Day Click
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleCompleteTask = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!closingExecutionId) return;

     await db.taskExecutions.update(closingExecutionId, {
        status: 'COMPLETED',
        executedAt: new Date().toISOString(),
        durationMinutes: closingDuration,
        notes: closingNotes
     });

     setClosingExecutionId(null);
     setClosingNotes('');
     setClosingDuration(15);
  };

  const handlePrintWorkOrder = (machineId: string) => {
      setPrintingMachineId(machineId);
      setTimeout(() => {
          window.print();
          // We don't hide it immediately so print registers it, print dialog is blocking.
          // In some browsers timeout runs after print dialog closes.
          setPrintingMachineId(null);
      }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] p-6 text-slate-200 relative overflow-hidden custom-scrollbar">
      {/* Control Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight font-sans">
            Sovereign Command Center
          </h1>
          <p className="text-emerald-400/80 text-sm mt-2 font-medium tracking-wide">
            Preventive Radar & System Awareness
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/[0.02] p-2 rounded-2xl border border-white/5 shadow-2xl">
          <div className="flex items-center bg-black/40 rounded-xl px-4 py-2 border border-white/5 focus-within:border-emerald-500/30 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-3" />
            <input 
              type="text"
              placeholder="Search Machine..."
              className="bg-transparent border-none outline-none text-sm text-white w-40 placeholder-slate-500 font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="h-6 w-px bg-white/10 mx-1" />
          
          <select 
            value={selectedSector} onChange={e => setSelectedSector(e.target.value)}
            className="bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 appearance-none min-w-[120px]"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select 
            value={selectedTech} onChange={e => setSelectedTech(e.target.value)}
            className="bg-black/40 border border-white/5 rounded-xl py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 appearance-none min-w-[120px]"
          >
            <option value="ALL">All Technicians</option>
            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <div className="h-6 w-px bg-white/10 mx-1" />

          <div className="flex bg-black/40 rounded-xl border border-white/5 p-1">
            <button onClick={() => setViewMode('CALENDAR')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'CALENDAR' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white'}`}>
              <CalendarIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('GRID')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'GRID' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'LIST' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white'}`}>
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {viewMode === 'CALENDAR' && (
            <motion.div key="CALENDAR" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col bg-[#12141c] rounded-3xl border border-white/5 p-6 custom-scrollbar overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-white tracking-wider">{format(currentDate, 'MMMM yyyy')}</h2>
                 <div className="flex gap-2">
                   <button onClick={prevMonth} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-xs font-bold text-slate-300">Prev</button>
                   <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-xs font-bold text-emerald-400">Today</button>
                   <button onClick={nextMonth} className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-xs font-bold text-slate-300">Next</button>
                 </div>
               </div>
               
               <div className="grid grid-cols-7 gap-4 mb-4">
                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                   <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{d}</div>
                 ))}
               </div>

               <div className="grid grid-cols-7 gap-4 flex-1">
                 {daysInMonth.map((day, idx) => {
                   const isCurrentMonth = isSameMonth(day, currentDate);
                   const isSelected = selectedDay && isSameDay(day, selectedDay);
                   const isTodayDate = isToday(day);
                   
                   // Find machines that have executions scheduled on this day
                   const machinesForDay = enrichedMachines.filter(m => 
                      m.scheduledExecutions.some(ex => isSameDay(new Date(ex.scheduledDate), day))
                   );

                   const overload = machinesForDay.length > 2; // Arbitrary logic: > 2 machines = overload
                   
                   return (
                     <div 
                       key={day.toISOString()}
                       onClick={() => handleDayClick(day)}
                       className={`
                         relative flex flex-col p-3 rounded-2xl border transition-all cursor-pointer min-h-[100px]
                         ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                         ${isSelected ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}
                       `}
                     >
                        <span className={`text-sm font-bold ${isTodayDate ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {format(day, 'd')}
                        </span>
                        
                        {machinesForDay.length > 0 && (
                          <div className="mt-auto flex flex-col gap-1">
                             <div className={`h-1.5 w-full rounded-full ${overload ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`} />
                             <span className="text-[10px] font-mono text-slate-400 text-center">{machinesForDay.length} Mchs</span>
                          </div>
                        )}
                        {overload && (
                           <div className="absolute top-3 right-3 text-amber-400">
                             <AlertTriangle className="w-4 h-4" />
                           </div>
                        )}
                     </div>
                   );
                 })}
               </div>
            </motion.div>
          )}

          {viewMode === 'GRID' && (
             <motion.div key="GRID" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full custom-scrollbar overflow-y-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {enrichedMachines.map(m => (
                    <GlassCard key={m.id} className={`p-6 border-l-4 flex flex-col ${
                      m.awarenessLevel === 'RED' ? 'border-l-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 
                      m.awarenessLevel === 'GOLD' ? 'border-l-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' :
                      m.awarenessLevel === 'CYAN' ? 'border-l-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]' :
                      'border-l-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-widest">{m.referenceCode}</h3>
                          <p className="text-xs text-slate-400 mt-1">{m.blueprintName}</p>
                        </div>
                        {m.awarenessLevel !== 'GREEN' && (
                          <div className={`flex items-center gap-1 text-[10px] font-bold tracking-widest px-2 py-1 rounded ${
                            m.awarenessLevel === 'RED' ? 'text-red-400 bg-red-400/10' :
                            m.awarenessLevel === 'GOLD' ? 'text-amber-400 bg-amber-400/10' :
                            'text-cyan-400 bg-cyan-400/10'
                          }`}>
                             <AlertTriangle className="w-3 h-3" /> {m.awarenessMessage}
                          </div>
                        )}
                      </div>
                      <div className="mt-auto grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                          <User className="w-4 h-4 text-emerald-400/50" /> {m.technician?.name || 'Unassigned'}
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 text-xs">
                          <MapPin className="w-4 h-4 text-emerald-400/50" /> {m.sector?.name || 'No Sector'}
                        </div>
                      </div>
                    </GlassCard>
                 ))}
                 {enrichedMachines.length === 0 && (
                   <div className="col-span-full py-20 text-center text-slate-500">
                     No machines match your criteria.
                   </div>
                 )}
               </div>
             </motion.div>
          )}

          {viewMode === 'LIST' && (
            <motion.div key="LIST" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full bg-[#12141c] rounded-3xl border border-white/5 overflow-hidden flex flex-col">
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-left" dir="ltr">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Status</th>
                      <th className="px-6 py-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Machine Info</th>
                      <th className="px-6 py-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Technician</th>
                      <th className="px-6 py-4 font-bold text-slate-400 text-xs tracking-wider uppercase">Sector</th>
                      <th className="px-6 py-4 font-bold text-slate-400 text-xs tracking-wider uppercase">PM Tasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {enrichedMachines.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                           <span className={`w-3 h-3 rounded-full inline-block ${
                              row.awarenessLevel === 'RED' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 
                              row.awarenessLevel === 'GOLD' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' :
                              row.awarenessLevel === 'CYAN' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]' :
                              'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                           }`} title={row.awarenessMessage} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white tracking-widest">{row.referenceCode}</div>
                          <div className="text-xs text-slate-500 mt-1">{row.blueprintName}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-medium text-sm">{row.technician?.name || '-'}</td>
                        <td className="px-6 py-4 text-slate-300 font-medium text-sm">{row.sector?.name || '-'}</td>
                        <td className="px-6 py-4 font-mono text-emerald-400 text-sm">
                           {row.taskCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Drawer for Selected Day (Teleportation Portal) */}
      <AnimatePresence>
        {selectedDay && viewMode === 'CALENDAR' && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedDay(null)}
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-[#0a0a0f] border-l border-emerald-500/20 z-50 flex flex-col shadow-2xl"
              dir="rtl"
            >
               <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#12141c]">
                 <div className="flex flex-col gap-1">
                   <h2 className="text-2xl font-bold text-white tracking-tight">{format(selectedDay, 'dd MMMM yyyy')}</h2>
                   <p className="text-xs text-emerald-400 font-bold tracking-widest font-mono">SCHEDULED MACHINES</p>
                 </div>
                 <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                   <X className="w-6 h-6" />
                 </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                 {(() => {
                    const dailyMachines = enrichedMachines.filter(m => m.scheduledExecutions.some(ex => isSameDay(new Date(ex.scheduledDate), selectedDay)));
                    if (dailyMachines.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center gap-4">
                          <CalendarIcon className="w-12 h-12 opacity-20" />
                          لا توجد آلات مبرمجة في هذا اليوم
                        </div>
                      );
                    }
                    return dailyMachines.map(m => {
                      const dailyExecs = m.scheduledExecutions.filter(ex => isSameDay(new Date(ex.scheduledDate), selectedDay));
                      return (
                        <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group">
                          <div className="flex justify-between items-start mb-4 text-left" dir="ltr">
                            <div>
                               <h3 className="text-lg font-bold text-white tracking-wider">{m.referenceCode}</h3>
                               <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{m.technician?.name || 'Unassigned'}</p>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          </div>
                          
                          <div className="space-y-3 mt-4 border-t border-white/5 pt-4 text-left" dir="ltr">
                             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tasks to perform:</h4>
                             {dailyExecs.map(ex => {
                               const taskDef = preventiveTasks.find(t => t.id === ex.taskId);
                               
                               // Check Stock Awareness
                               let stockStatus = null;
                               if (taskDef?.targetTemplateId) {
                                 const mappedBpIds = partMappings.filter(pm => pm.machineId === m.id).map(pm => pm.blueprintId);
                                 const mappedBpForTask = pdrBlueprints.find(bp => mappedBpIds.includes(bp.id) && bp.templateId === taskDef.targetTemplateId);
                                 if (mappedBpForTask) {
                                     const stock = inventory.find(inv => inv.blueprintId === mappedBpForTask.id);
                                     stockStatus = { available: (stock?.quantityCurrent || 0) > 0, location: stock?.locationDetails || 'Unknown Bin' };
                                 }
                               }

                               return (
                                 <div key={ex.id} className="bg-black/40 rounded-lg p-3 text-xs border border-white/5 flex flex-col gap-2">
                                   <div className="flex items-center justify-between">
                                      <span className="text-slate-300 font-medium">{taskDef?.title || 'Unknown Task'}</span>
                                      {ex.status === 'PENDING' ? (
                                         <button onClick={() => setClosingExecutionId(ex.id)} className="text-[10px] px-2 py-1 rounded font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors">
                                            Close Task
                                         </button>
                                      ) : (
                                         <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-400/10 text-emerald-400">
                                            {ex.status}
                                         </span>
                                      )}
                                   </div>
                                   {stockStatus && (
                                      <div className={`text-[10px] font-mono tracking-widest ${stockStatus.available ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                                        {stockStatus.available ? `✓ IN STOCK (Loc: ${stockStatus.location})` : '✗ OUT OF STOCK (Order required)'}
                                      </div>
                                   )}
                                 </div>
                               );
                             })}
                          </div>

                          <div className="flex gap-2 mt-6">
                            <button onClick={() => handlePrintWorkOrder(m.id)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-white/10 flex justify-center items-center gap-2">
                               Print Task Card
                            </button>
                            <button 
                              onClick={() => {
                                 const { openTab } = require('@/app/store').useTabStore.getState();
                                 openTab({ id: `machine-detail:${m.id}`, portalId: 'FACTORY', title: `Asset: ${m.referenceCode}`, component: `machine-detail:${m.id}` });
                              }}
                              className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] flex justify-center items-center gap-2"
                            >
                               القفز لملف الآلة <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    });
                 })()}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Task Closing Modal */}
      <AnimatePresence>
        {closingExecutionId && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
             onClick={() => setClosingExecutionId(null)}
          >
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
               onClick={e => e.stopPropagation()}
               className="bg-[#12141c] border border-emerald-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
               dir="rtl"
             >
                <div className="h-1 bg-emerald-500 w-full" />
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">إغلاق المهمة الوقائية</h2>
                  <p className="text-sm text-slate-400 mb-8">يرجى تسجيل تفاصيل الإنجاز لبناء قاعدة البيانات.</p>
                  
                  <form onSubmit={handleCompleteTask} className="space-y-5">
                     <div className="space-y-2">
                        <label className="text-xs text-slate-400">الوقت المستغرق (بالدقائق)</label>
                        <input 
                          type="number" min="1" required
                          value={closingDuration} onChange={e => setClosingDuration(Number(e.target.value))}
                          className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-slate-400">حالة القطع المستبدلة / ملاحظات</label>
                        <textarea 
                          required placeholder="مثال: الفلتر القديم كان مسدوداً بالكامل..."
                          value={closingNotes} onChange={e => setClosingNotes(e.target.value)}
                          className="w-full h-24 bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                        />
                     </div>
                     <div className="flex gap-3 pt-4" dir="ltr">
                        <button type="button" onClick={() => setClosingExecutionId(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-white/10">
                           إلغاء
                        </button>
                        <button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                           تم الإنجاز
                        </button>
                     </div>
                  </form>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Print Wrapper */}
      {printingMachineId && (
        <div className="hidden print:block fixed inset-0 bg-white z-[100] p-8 text-black" dir="ltr">
           <div className="border-[3px] border-black p-8 max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-6">
                <div>
                  <h1 className="text-4xl font-black mb-2 opacity-90">BDR NEXUS</h1>
                  <p className="text-sm font-bold tracking-widest text-slate-600 uppercase">Preventive Work Order Card</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-500">DATE: {format(new Date(), 'dd MMM yyyy')}</p>
                </div>
              </div>
              
              {(() => {
                 const pm = enrichedMachines.find(m => m.id === printingMachineId);
                 if (!pm) return null;
                 
                 return (
                   <>
                     <div className="grid grid-cols-2 gap-8 mb-8">
                       <div>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Asset Code</p>
                         <p className="text-3xl font-black">{pm.referenceCode}</p>
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Blueprint Model</p>
                         <p className="text-xl font-bold">{pm.blueprintName}</p>
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Technician</p>
                         <p className="text-lg font-bold">{pm.technician?.name || 'Unassigned'}</p>
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Sector</p>
                         <p className="text-lg font-bold">{pm.sector?.name || 'Unassigned'}</p>
                       </div>
                     </div>

                     <div className="mb-8">
                        <h2 className="text-xl font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Required Tasks & Parts</h2>
                        <div className="space-y-4">
                           {pm.scheduledExecutions.filter(ex => ex.status === 'PENDING').map(ex => {
                               const taskDef = preventiveTasks.find(t => t.id === ex.taskId);
                               let stockStatus = null;
                               if (taskDef?.targetTemplateId) {
                                 const mappedBpIds = partMappings.filter(p => p.machineId === pm.id).map(p => p.blueprintId);
                                 const mappedBpForTask = pdrBlueprints.find(bp => mappedBpIds.includes(bp.id) && bp.templateId === taskDef.targetTemplateId);
                                 if (mappedBpForTask) {
                                     const stock = inventory.find(inv => inv.blueprintId === mappedBpForTask.id);
                                     stockStatus = { available: (stock?.quantityCurrent || 0) > 0, location: stock?.locationDetails || 'Unknown Bin' };
                                 }
                               }

                               return (
                                 <div key={ex.id} className="border-2 border-slate-200 p-4 rounded-lg flex items-start gap-4">
                                   <div className="w-6 h-6 border-2 border-black rounded" />
                                   <div className="flex-1">
                                      <p className="font-bold text-lg leading-none mb-2">{taskDef?.title || 'Unknown Task'}</p>
                                      {stockStatus && (
                                         <p className="text-sm font-bold text-slate-600">
                                            Req. Part Status: {stockStatus.available ? `✓ In Stock (Loc: ${stockStatus.location})` : '✗ Out of Stock'}
                                         </p>
                                      )}
                                   </div>
                                 </div>
                               );
                           })}
                        </div>
                     </div>

                     <div className="mt-12 pt-8 border-t-2 border-black grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Technician Signature</p>
                          <div className="h-16 border-b-2 border-dotted border-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Time Spent (Mins)</p>
                          <div className="h-16 border-b-2 border-dotted border-slate-400" />
                        </div>
                     </div>
                   </>
                 );
              })()}
           </div>
        </div>
      )}
    </div>
  );
}

