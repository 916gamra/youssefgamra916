import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ShieldCheck, Fingerprint } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { db, User } from '@/core/db';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useAuditTrail } from '@/features/system/hooks/useAuditTrail';
import { SystemBackground } from '@/shared/components/SystemBackground';

export function LoginScreen() {
  const users = useLiveQuery(() => db.users.toArray());
  const { login } = useAuthStore();
  const { logEvent } = useAuditTrail();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [time, setTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (selectedUser && pin.length > 0) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const isMatch = await login(selectedUser.id!, pin);

        if (isMatch) {
          await logEvent({
            userId: selectedUser.id!,
            userName: selectedUser.name,
            action: 'LOGIN',
            entityType: 'SESSION',
            entityId: selectedUser.id!.toString(),
            details: `Secure PIN authentication successful for session origin.`,
            severity: 'INFO'
          });
          toast.success(`Welcome back, ${selectedUser.name}!`);
        } else {
          await logEvent({
            userId: selectedUser.id!,
            userName: selectedUser.name,
            action: 'LOGIN_FAILURE',
            entityType: 'SESSION',
            entityId: selectedUser.id!.toString(),
            details: `Failed login attempt with incorrect credentials.`,
            severity: 'WARNING'
          });
          setError('AUTH_ERROR: Invalid credentials.');
          toast.error('Authentication Failed');
          setPin('');
          setTimeout(() => setError(''), 3000);
        }
      } catch (err) {
        setError('SYS_ERROR: Internal verification failure.');
        toast.error('System Error');
      } finally {
        setIsLoading(false);
      }
    } else if (!selectedUser && pin === '0000') {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const success = await login(null, pin);
      if (success) {
        await logEvent({
          userId: 'FAILSAFE',
          userName: 'System Failsafe',
          action: 'LOGIN',
          entityType: 'SESSION',
          entityId: 'BACKDOOR',
          details: `Failsafe root access granted.`,
          severity: 'CRITICAL'
        });
        toast.success('Failsafe Authenticated');
      }
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] flex flex-col items-center justify-center selection:bg-slate-500/30 font-sans">
      <SystemBackground />
      
      {/* Decorative framing for Titanic OS */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" />

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        
        {/* Central Hub Clock */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: selectedUser ? -40 : 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-16 pointer-events-none"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex gap-1.5">
               <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
               <div className="w-1.5 h-4 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)] mt-1" />
            </div>
            <h2 className="md:text-xl font-mono tracking-[0.4em] font-bold uppercase flex items-center gap-2">
               <span className="text-white">TITANIC</span>
               <span className="text-blue-500">OS</span>
            </h2>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-md">
            {formatTime(time)}
          </h1>
          <p className="text-sm text-slate-400 mt-4 font-mono tracking-widest uppercase">{formatDate(time)}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedUser ? (
            <motion.div 
              key="user-list"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap justify-center gap-6 w-full"
            >
              {users?.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="flex flex-col items-center p-6 w-48 bg-[#0a0b10]/90 backdrop-blur-xl border border-white/10 hover:border-rose-500/50 rounded-2xl cursor-pointer group transition-all duration-300 relative overflow-hidden shadow-2xl hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/10 group-hover:via-slate-500/30 to-transparent transition-colors" />
                  
                  <div className={`w-20 h-20 mb-4 relative z-10 flex items-center justify-center text-3xl font-bold text-white shadow-inner transition-all duration-300 ${user.color} bg-opacity-10 group-hover:bg-opacity-20 border border-white/5 rounded-2xl`}>
                    {user.initials}
                  </div>
                  <div className="text-center w-full relative z-10">
                    <h2 className="text-sm font-semibold text-white tracking-wide truncate group-hover:text-slate-100 transition-colors">{user.name}</h2>
                    <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-1.5 font-mono">{user.role}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md relative"
            >
              <div className="flex flex-col items-center bg-[#0a0b10] backdrop-blur-2xl border border-white/[0.06] rounded-3xl p-10 relative z-10 shadow-2xl overflow-hidden">
                {/* Decorative scanning line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-500/30 to-transparent opacity-50" />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-500/10 to-transparent opacity-50" />
                
                <div className="w-full flex items-center justify-between mb-8 opacity-70">
                   <ShieldCheck className="w-5 h-5 text-slate-400" />
                   <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">SECURE_AUTH</div>
                   <Fingerprint className="w-5 h-5 text-slate-400" />
                </div>


                <div className={`w-24 h-24 mb-6 flex items-center justify-center text-4xl font-bold text-white shadow-inner rounded-2xl ${selectedUser.color} bg-opacity-10 border border-white/5 relative z-10`}>
                  {selectedUser.initials}
                </div>
                
                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2 relative z-10 text-center">{selectedUser.name}</h2>
                <div className="text-slate-400 font-mono text-[10px] tracking-[0.2em] uppercase mb-8 relative z-10 text-center bg-slate-500/10 px-3 py-1.5 rounded-lg border border-slate-500/20">
                  {selectedUser.role} 
                </div>

                <form onSubmit={handleLogin} className="w-full relative z-10">
                  <div className="relative flex flex-col group mb-6">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 ml-1">Identity Pin Code</label>
                    <div className="relative flex items-center">
                      <input
                        type="password"
                        autoFocus
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-[#12141a] border border-white/[0.06] rounded-xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-slate-500/50 focus:ring-1 focus:ring-slate-500/30 transition-all font-mono tracking-[1em] text-center text-2xl shadow-inner backdrop-blur-md"
                      />
                      <button 
                        type="submit"
                        disabled={pin.length === 0 || isLoading}
                        className="absolute right-2 p-3 bg-white/5 hover:bg-slate-700 text-white/50 hover:text-white rounded-lg transition-all disabled:opacity-20 flex items-center justify-center"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-amber-400 text-[11px] font-mono tracking-wide text-center uppercase bg-amber-500/10 py-2 rounded-lg border border-amber-500/20"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  <div className="mt-8 flex flex-col items-center">
                    <button 
                      type="button" 
                      onClick={() => { setSelectedUser(null); setPin(''); }}
                      className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Switch Identity
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
