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
    <aside className="w-[90px] border-r border-white/5 bg-[#050505] flex flex-col items-center py-6 gap-6 shrink-0 z-40 overflow-y-auto custom-scrollbar relative font-mono selection:bg-white/20">
      
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: `24px 24px`,
        }}
      />
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Top Left/Right Bracket Decoration */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/30 pointer-events-none z-10" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/30 pointer-events-none z-10" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/30 pointer-events-none z-10" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/30 pointer-events-none z-10" />

      {/* Portal Identity */}
      <div className="flex flex-col items-center shrink-0 mb-2 px-2 relative z-10 w-full">
         <div className={cn(
           "w-16 h-16 flex items-center justify-center border mb-3 transition-all duration-500 hover:scale-105 bg-black/50 relative group", 
           colorClass, 
           borderClass
         )}>
           {/* Inner accent ring */}
           <div className={cn("absolute inset-1 border opacity-20 group-hover:opacity-50 transition-opacity", borderClass)} />
           {React.cloneElement(portalIcon as React.ReactElement, { className: cn("w-6 h-6", textClass) })}
         </div>
         <span className={cn("text-[8px] uppercase tracking-[0.25em] font-medium text-center leading-tight", textClass)}>
           {nameParts.map((word, i) => (
             <React.Fragment key={i}>
               {word}
               {i < nameParts.length - 1 && <br/>}
             </React.Fragment>
           ))}
         </span>
         
         <div className="mt-4 flex gap-1.5 w-full justify-center opacity-70">
            <span className="w-1 h-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="w-1 h-3 bg-white/10" />
            <span className="w-1 h-3 bg-white/10" />
         </div>
      </div>

      <div className="w-full px-4 shrink-0 -my-1 opacity-20 relative z-10">
         <div className="h-px w-full bg-white relative">
            <div className="absolute left-0 top-[-2px] w-1 h-[5px] bg-white" />
            <div className="absolute right-0 top-[-2px] w-1 h-[5px] bg-white" />
         </div>
      </div>

      {/* Portal Content (Nav Items) */}
      <div className={cn("flex flex-col gap-3 shrink-0 items-center w-full flex-grow relative z-10 my-4", textClass)}>
         {children}
      </div>

      {/* Bottom Layout Break */}
      <div className="w-full px-4 shrink-0 -my-1 opacity-20 relative z-10 mt-auto">
         <div className="h-px w-full bg-white relative">
            <div className="absolute left-0 top-[-2px] w-1 h-[5px] bg-white" />
            <div className="absolute right-0 top-[-2px] w-1 h-[5px] bg-white" />
         </div>
      </div>
      
      <div className="flex flex-col gap-2 relative z-10 w-full items-center mt-4">
        <button 
          onClick={cycleLanguage}
          className="w-14 h-12 flex flex-col items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all shrink-0 relative group font-mono border border-transparent hover:border-white/10"
          title="Cycle Language (EN/FR/AR)"
        >
          <Languages className="w-4 h-4 mb-1 opacity-80" />
          <span className="text-[8px] tracking-widest font-medium opacity-60 group-hover:opacity-100">{language.toUpperCase()}</span>
        </button>

        <button 
          onClick={toggleTheme}
          className="w-14 h-12 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all shrink-0 border border-transparent hover:border-white/10"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button 
          onClick={() => logout()}
          className="w-14 h-14 mt-4 flex items-center justify-center text-rose-500/40 hover:text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all group shrink-0 relative overflow-hidden"
          title="Tactical Logout"
        >
          <div className="absolute top-0 w-full h-[1px] bg-rose-500/0 group-hover:bg-rose-500/50 transition-colors" />
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

    </aside>
  );
}

