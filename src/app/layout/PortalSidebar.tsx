import React from 'react';
import { cn } from '@/shared/utils';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/app/store/useAuthStore';

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

  return (
    <aside className="w-[84px] border-r border-white/5 bg-[#050508] backdrop-blur-3xl flex flex-col items-center py-8 gap-4 shrink-0 z-40 overflow-y-auto custom-scrollbar shadow-[4px_0_32px_rgba(0,0,0,1)] relative">
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      
      {/* Portal Identity */}
      <div className="flex flex-col items-center shrink-0 mb-4 px-2">
         <div className={cn(
           "w-14 h-14 rounded-[1.25rem] flex items-center justify-center border mb-4 shadow-[inset_0_1px_rgba(255,255,255,0.05),_0_0_20px_rgba(0,0,0,0.8)] transition-all duration-500 hover:scale-110", 
           colorClass, 
           borderClass
         )}>
           {React.cloneElement(portalIcon as React.ReactElement, { className: cn("w-6 h-6", textClass) })}
         </div>
         <span className={cn("text-[8px] uppercase tracking-[0.2em] font-black text-center leading-tight drop-shadow-md", textClass)}>
           {nameParts.map((word, i) => (
             <React.Fragment key={i}>
               {word}
               {i < nameParts.length - 1 && <br/>}
             </React.Fragment>
           ))}
         </span>
      </div>

      <div className="w-10 h-px bg-white/5 shrink-0 my-2" />

      {/* Portal Content (Nav Items) - Sets the 'current' color for children */}
      <div className={cn("flex flex-col gap-4 shrink-0 items-center w-full px-2 flex-grow", textClass)}>
         {children}
      </div>

      {/* Bottom Actions */}
      <div className="w-10 h-px bg-white/5 shrink-0 my-2" />
      
      <button 
        onClick={() => logout()}
        className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all group shrink-0"
        title="Tactical Logout"
      >
        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </button>

    </aside>
  );
}

