import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, PreventiveTask, TaskFamily, TaskFrequencyType } from '@/core/db';
import { GlassCard } from '@/shared/components/GlassCard';
import { Plus, Search, Settings2, Wrench, Zap, Droplet, Wind, Cpu, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const FAMILY_CONFIG: Record<TaskFamily, { icon: any, color: string, label: string }> = {
  MEC: { icon: Wrench, color: 'text-amber-500 border-amber-500/20 bg-amber-500/10', label: 'Mechanical (MEC)' },
  ELE: { icon: Zap, color: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10', label: 'Electrical (ELE)' },
  HYD: { icon: Droplet, color: 'text-blue-500 border-blue-500/20 bg-blue-500/10', label: 'Hydraulic (HYD)' },
  PNU: { icon: Wind, color: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10', label: 'Pneumatic (PNU)' },
  ELN: { icon: Cpu, color: 'text-purple-500 border-purple-500/20 bg-purple-500/10', label: 'Electronic (ELN)' },
};

export function TaskCatalogView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [family, setFamily] = useState<TaskFamily>('MEC');
  const [targetTemplateId, setTargetTemplateId] = useState('');
  const [frequencyValue, setFrequencyValue] = useState(30);

  const tasks = useLiveQuery(() => db.preventiveTasks.toArray(), []);
  const pdrTemplates = useLiveQuery(() => db.pdrTemplates.toArray(), []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      await db.preventiveTasks.add({
        id: crypto.randomUUID(),
        title,
        family,
        targetTemplateId: targetTemplateId || undefined,
        frequencyType: 'TIME',
        frequencyValue,
        linkedBlueprintIds: [],
        createdAt: new Date().toISOString()
      });
      toast.success('Task added to knowledge base', { description: 'Generic task created successfully.' });
      setIsModalOpen(false);
      setTitle('');
      setTargetTemplateId('');
      setFrequencyValue(30);
    } catch (err: any) {
      toast.error('Failed to create task', { description: err.message });
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this generic task?')) {
      await db.preventiveTasks.delete(id);
      toast.success('Task deleted');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] p-6 space-y-6 text-slate-200 custom-scrollbar overflow-y-auto">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight font-sans">
            <Settings2 className="w-8 h-8 text-emerald-400" /> Tasks Catalog
          </h1>
          <p className="text-slate-400 text-sm mt-2 rtl:text-right" dir="rtl">
            مكتبة المهام الهندسية الموحدة
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center gap-2 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] font-bold tracking-wider text-xs uppercase"
        >
          <Plus className="w-4 h-4" /> New Generic Task
        </button>
      </header>
      
      <div className="flex items-center bg-white/[0.03] rounded-2xl px-5 py-3.5 border border-white/10 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
        <Search className="w-5 h-5 text-slate-400 mr-3" />
        <input 
          type="text"
          placeholder="Search generic tasks library..."
          className="bg-transparent border-none outline-none text-white flex-1 py-1 placeholder-slate-500 font-medium"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-emerald-500 pl-3 rtl:text-right" dir="rtl">
          استعراض مكتبة المهام (Tasks Library)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks?.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map(task => {
            const config = FAMILY_CONFIG[task.family];
            const Icon = config.icon;
            const linkedTemplate = pdrTemplates?.find(t => t.id === task.targetTemplateId);
            
            return (
              <GlassCard key={task.id} className={`p-6 flex flex-col items-center text-center group border-t-0 border-r-0 border-b-0 border-l-4 ${config.color.split(' ')[0].replace('text-', 'border-l-')} hover:bg-white/[0.04] transition-colors relative overflow-hidden`}>
                <button 
                  onClick={(e) => handleDeleteTask(task.id, e)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className={`p-4 rounded-full ${config.color} mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 tracking-wide" dir="rtl">{task.title}</h3>
                <span className={`text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded border mb-4 mt-2 ${config.color}`}>
                  {config.label}
                </span>
                
                <div className="w-full mt-auto pt-4 border-t border-white/10 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 mb-1" dir="rtl">مرتبط بـ:</span>
                  <span className="text-xs font-medium text-slate-300">
                    {linkedTemplate ? `${linkedTemplate.name} (${linkedTemplate.skuBase})` : 'Generic (No Specific Part)'}
                  </span>
                </div>
              </GlassCard>
            );
          })}
          {tasks?.length === 0 && (
             <div className="col-span-full py-16 text-center text-slate-500 flex flex-col items-center glass-panel rounded-2xl border-dashed">
               <Settings2 className="w-12 h-12 mb-4 opacity-20" />
               <p>No generic tasks defined in the library.</p>
             </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0f111a] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="h-1 w-full bg-emerald-500" />
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-bold text-white font-sans">إنشاء مهمة وقائية (Generic Task)</h2>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 px-1">إسم المهمة</label>
                    <input 
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="مثال: فحص مستوى الزيت والتشحيم"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 px-1">العائلة التقنية</label>
                    <select 
                      value={family}
                      onChange={e => setFamily(e.target.value as TaskFamily)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none appearance-none font-sans"
                    >
                      {Object.entries(FAMILY_CONFIG).map(([key, conf]) => (
                        <option key={key} value={key} className="bg-slate-900">{conf.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 px-1">ربط مع قالب الـ PDR Template</label>
                    <select 
                      value={targetTemplateId}
                      onChange={e => setTargetTemplateId(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
                    >
                      <option value="" className="bg-slate-900">-- عام (بدون تحديد) --</option>
                      {pdrTemplates?.map(tpl => (
                        <option key={tpl.id} value={tpl.id} className="bg-slate-900">
                          {tpl.name} ({tpl.skuBase})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-right">
                     <Settings2 className="w-6 h-6 text-emerald-400 shrink-0" />
                     <div>
                       <h4 className="text-sm font-bold text-emerald-400 mb-1">فلسفة الربط الذكي</h4>
                       <p className="text-xs leading-relaxed text-slate-300">
                         في هذه المرحلة، نحن لا نحدد الآلة. نحن نصمم "مهمة معيارية". عندما يتم ربط هذه المهمة بقالب، سيفهم النظام تلقائياً أن أي آلة تحتوي على هذا القالب ستحتاج لهذه المهمة.
                       </p>
                     </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4" dir="ltr">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-300 font-bold text-xs hover:bg-white/5 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                    >
                      حفظ في الكتالوج
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

