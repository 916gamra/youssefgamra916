import React from 'react';
import { cn } from '@/shared/utils';
import { LogOut, Sun, Moon, Languages } from 'lucide-react';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useThemeStore } from '@/app/store/useThemeStore';
import { useLanguageStore } from '@/app/store/useLanguageStore';

interface PortalSidebarProps {
  portalName: string;
  portalIcon: React.ReactNode;
  colorClass: string;
  borderClass: string;
  textClass: string;
  children: React.ReactNode;
}

export function PortalSidebar({ portalName, portalIcon, colorClass, borderClass, textClass, children }: PortalSidebarProps) {
  const nameParts = portalName.split(' ');
  const logout = useAuthStore(state => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  const { language, cycleLanguage } = useLanguageStore();

  return (
    <aside className="w-[84px] bg-slate-50/80 dark:bg-[#0a0b10]/90 backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/5 flex flex-col items-center py-6 gap-2 shrink-0 z-40 overflow-y-auto custom-scrollbar shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Portal Identity */}
      <div className="flex flex-col items-center shrink-0 px-2 mt-2 mb-4 group cursor-pointer transition-transform active:scale-95 relative z-10 w-full">
         <div className={cn(
           "w-12 h-12 rounded-2xl flex items-center justify-center border mb-3 shadow-[0_0_15px_rgba(0,0,0,0.3)] bg-white/50 dark:bg-[#0f111a] transition-all duration-300 group-hover:bg-white dark:group-hover:bg-[#151822] relative overflow-hidden", 
           colorClass, 
           borderClass
         )}>
           <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
           {React.cloneElement(portalIcon as React.ReactElement, { className: cn("w-5 h-5 relative z-10", textClass) })}
         </div>
         <div className="flex flex-col items-center gap-0.5">
           <span className={cn("text-[9px] font-bold uppercase tracking-widest text-center leading-tight", textClass)}>
             {nameParts[0]}
           </span>
           {nameParts.length > 1 && (
             <span className="text-[8px] text-slate-500 dark:text-slate-500 font-mono text-center leading-tight truncate px-1 w-full opacity-80 uppercase tracking-widest">
               {nameParts.slice(1).join(' ')}
             </span>
           )}
         </div>
      </div>

      <div className="w-10 h-px bg-slate-200 dark:bg-white/[0.08] shrink-0 my-2 relative z-10" />

      {/* Portal Content (Nav Items) */}
      <div className={cn("flex flex-col gap-2 shrink-0 items-center w-full px-3 flex-grow mt-2", textClass)}>
         {children}
      </div>

      <div className="w-10 h-px bg-slate-200 dark:bg-white/[0.08] shrink-0 my-2 relative z-10 mt-auto" />
      
      {/* Bottom Actions */}
      <div className="flex flex-col gap-2 w-full px-3 items-center mt-2 mb-2 relative z-10">
        <button 
          onClick={cycleLanguage}
          className="w-11 h-11 flex flex-col items-center justify-center text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] border border-transparent dark:hover:border-white/[0.05] transition-all shrink-0 rounded-xl active:scale-95 group"
          title="Cycle Language (EN/FR/AR)"
        >
          <Languages className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest">{language.toUpperCase()}</span>
        </button>

        <button 
          onClick={toggleTheme}
          className="w-11 h-11 flex items-center justify-center text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04] border border-transparent dark:hover:border-white/[0.05] transition-all shrink-0 rounded-xl active:scale-95 group"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" /> : <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-500" />}
        </button>

        <button 
          onClick={() => logout()}
          className="w-11 h-11 mt-2 flex items-center justify-center text-rose-500/70 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 border border-transparent dark:hover:border-rose-500/20 transition-all shrink-0 rounded-xl group active:scale-95"
          title="Logout"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

    </aside>
  );
}

