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
    <aside className="w-[84px] bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/10 flex flex-col items-center py-6 gap-2 shrink-0 z-40 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] font-sans">
      
      {/* Portal Identity */}
      <div className="flex flex-col items-center shrink-0 px-2 mt-2 mb-4 group cursor-pointer transition-transform active:scale-95">
         <div className={cn(
           "w-12 h-12 rounded-[14px] flex items-center justify-center border mb-2 shadow-sm bg-white/50 dark:bg-white/5 transition-colors group-hover:bg-white dark:group-hover:bg-white/10", 
           colorClass, 
           borderClass
         )}>
           {React.cloneElement(portalIcon as React.ReactElement, { className: cn("w-5 h-5", textClass) })}
         </div>
         <span className={cn("text-[10px] font-semibold text-center leading-tight tracking-wide", textClass)}>
           {nameParts[0]}
         </span>
         {nameParts.length > 1 && (
           <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center leading-tight truncate px-1 w-full">
             {nameParts.slice(1).join(' ')}
           </span>
         )}
      </div>

      <div className="w-8 h-[2px] bg-slate-200 dark:bg-white/10 shrink-0 my-1 rounded-full" />

      {/* Portal Content (Nav Items) */}
      <div className={cn("flex flex-col gap-2 shrink-0 items-center w-full px-3 flex-grow mt-2", textClass)}>
         {children}
      </div>

      <div className="w-8 h-[2px] bg-slate-200 dark:bg-white/10 shrink-0 my-1 rounded-full mt-auto" />
      
      {/* Bottom Actions */}
      <div className="flex flex-col gap-1.5 w-full px-3 items-center mt-2 mb-2">
        <button 
          onClick={cycleLanguage}
          className="w-[44px] h-[44px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all shrink-0 rounded-[12px] active:scale-95"
          title="Cycle Language (EN/FR/AR)"
        >
          <Languages className="w-[18px] h-[18px] mb-0.5" />
          <span className="text-[9px] font-bold opacity-70">{language.toUpperCase()}</span>
        </button>

        <button 
          onClick={toggleTheme}
          className="w-[44px] h-[44px] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all shrink-0 rounded-[12px] active:scale-95"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <button 
          onClick={() => logout()}
          className="w-[44px] h-[44px] mt-2 flex items-center justify-center text-rose-500/70 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-all shrink-0 rounded-[12px] group active:scale-95"
          title="Logout"
        >
          <LogOut className="w-[18px] h-[18px] group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

    </aside>
  );
}

