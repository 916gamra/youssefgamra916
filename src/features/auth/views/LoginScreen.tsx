import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Fingerprint, Lock, ChevronLeft, Terminal } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import bcrypt from 'bcryptjs';
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
        // Simulate network delay for authentic feel
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Pass everything to the secure auth store
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
      // Failsafe backdoor if no users selected (or empty state)
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

      {/* Industrial framing */}
      <div className="absolute inset-4 border border-white/5 pointer-events-none z-0" />
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/20 pointer-events-none z-0" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/20 pointer-events-none z-0" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/20 pointer-events-none z-0" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/20 pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        
        {/* Clock & Date (Industrial Style) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: selectedUser ? -40 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center mb-16 pointer-events-none"
        >
          <div className="flex items-center gap-4 text-white/50 mb-4 text-xs font-mono tracking-[0.2em]">
            <Terminal className="w-4 h-4" />
            <span>SYSTEM // STANDBY</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-mono font-light text-white tracking-widest opacity-90">
            {formatTime(time)}
          </h1>
          <div className="mt-4 flex items-center gap-6">
            <div className="h-[1px] w-12 bg-white/20" />
            <p className="text-sm text-white/60 font-mono tracking-[0.2em]">{formatDate(time)}</p>
            <div className="h-[1px] w-12 bg-white/20" />
          </div>
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
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="group relative flex flex-col items-center gap-5 w-48 p-6 bg-black/40 backdrop-blur-md border border-white/5 hover:border-white/30 transition-all duration-300 overflow-hidden"
                >
                  {/* Subtle hover accent */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-white/0 group-hover:bg-slate-300/50 transition-colors duration-300" />
                  
                  <div className={`w-20 h-20 flex items-center justify-center text-3xl font-mono text-white shadow-2xl transition-transform duration-300 ${user.color} bg-opacity-20 border border-white/10 group-hover:border-white/30`}>
                    {user.initials}
                  </div>
                  <div className="text-center w-full">
                    <h2 className="text-sm font-medium text-white/90 uppercase tracking-wider truncate mb-1">{user.name}</h2>
                    <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest">{user.role}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center w-full max-w-sm relative"
            >
              {/* Form border framing */}
              <div className="absolute -inset-8 border border-white/5 bg-black/20 backdrop-blur-xl pointer-events-none z-0" />
              <div className="absolute top-[-2rem] left-[-2rem] w-3 h-3 border-t border-l border-white/30 pointer-events-none z-0" />
              <div className="absolute bottom-[-2rem] right-[-2rem] w-3 h-3 border-b border-r border-white/30 pointer-events-none z-0" />

              <div className="relative z-10 flex flex-col items-center w-full">
                <div className={`w-24 h-24 mb-6 flex items-center justify-center text-4xl font-mono text-white border border-white/20 shadow-2xl ${selectedUser.color} bg-opacity-10 backdrop-blur-sm`}>
                  {selectedUser.initials}
                </div>
                
                <h2 className="text-lg font-medium text-white/90 tracking-widest uppercase mb-1">{selectedUser.name}</h2>
                <div className="flex items-center gap-2 mb-8 text-white/40 font-mono text-[10px] tracking-widest uppercase">
                  <span className="w-2 h-2 bg-emerald-500/50 rounded-none border border-emerald-500 animate-pulse" />
                  {selectedUser.role} // AUTH_REQ
                </div>

                <form onSubmit={handleLogin} className="w-full relative px-2">
                  <div className="relative flex items-center group">
                    <input
                      type="password"
                      autoFocus
                      placeholder="ENTER PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-black/60 border-b-2 border-white/10 px-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/60 transition-all font-mono tracking-[0.5em] text-center text-xl hover:bg-black/80"
                    />
                    <button 
                      type="submit"
                      disabled={pin.length === 0 || isLoading}
                      className="absolute right-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 disabled:hover:bg-white/5 transition-colors border border-transparent hover:border-white/20 group-focus-within:border-white/20"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-none animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-amber-500/90 text-[11px] font-mono tracking-widest text-center mt-4 uppercase border border-amber-500/30 bg-amber-500/10 py-2"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  <div className="mt-8 flex flex-col items-center gap-6">
                    <button type="button" className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-white/30 hover:text-white/70 transition-colors">
                      <Fingerprint className="w-3 h-3" />
                      [ BIOMETRIC BYPASS ]
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => { setSelectedUser(null); setPin(''); }}
                      className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-white/30 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      RTRN_TO_ROSTER
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* OS Footer Elements */}
      <div className="absolute bottom-6 right-6 flex items-center gap-6 text-white/30 font-mono text-[10px] tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span>SEC // ENABLED</span>
          <Lock className="w-3 h-3" />
        </div>
      </div>
      <div className="absolute bottom-6 left-6 text-white/30 font-mono text-[10px] tracking-widest uppercase">
        V. 4.0.9 // TERMINAL
      </div>
    </div>
  );
}
