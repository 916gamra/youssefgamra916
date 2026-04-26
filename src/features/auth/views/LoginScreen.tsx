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
import { GlassCard } from '@/shared/components/GlassCard';

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

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        
        {/* Clock & Date (Elegant Style) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: selectedUser ? -40 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center mb-16 pointer-events-none"
        >
          <h1 className="text-7xl md:text-8xl font-light text-white opacity-90 drop-shadow-md">
            {formatTime(time)}
          </h1>
          <p className="text-lg text-white/70 mt-4 font-medium drop-shadow-sm">{formatDate(time)}</p>
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
                <GlassCard
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="flex flex-col items-center gap-4 w-44 !p-6 cursor-pointer hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div className={`w-20 h-20 relative z-10 flex items-center justify-center text-3xl text-white shadow-2xl transition-transform duration-300 ${user.color} bg-opacity-20 border border-white/10 group-hover:border-white/30 rounded-2xl`}>
                    {user.initials}
                  </div>
                  <div className="text-center w-full relative z-10">
                    <h2 className="text-sm font-medium text-white/90 tracking-wide truncate">{user.name}</h2>
                    <p className="text-xs text-white/50 tracking-wide mt-1">{user.role}</p>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm relative"
            >
              <GlassCard className="flex flex-col items-center p-10 mt-8 relative z-10">
                <div className={`w-24 h-24 mb-6 flex items-center justify-center text-4xl text-white border border-white/20 shadow-2xl rounded-[16px] ${selectedUser.color} bg-opacity-20 backdrop-blur-md z-10 relative`}>
                  {selectedUser.initials}
                </div>
                
                <h2 className="text-xl font-medium text-white/90 tracking-wide mb-1 relative z-10">{selectedUser.name}</h2>
                <div className="flex items-center gap-2 mb-8 text-white/60 font-medium text-sm tracking-wide relative z-10">
                  {selectedUser.role} 
                </div>

                <form onSubmit={handleLogin} className="w-full relative px-2 z-10">
                  <div className="relative flex items-center group">
                    <input
                      type="password"
                      autoFocus
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-rose-500/50 focus:bg-black/60 transition-all font-mono tracking-[0.5em] text-center text-xl shadow-inner backdrop-blur-md"
                    />
                    <button 
                      type="submit"
                      disabled={pin.length === 0 || isLoading}
                      className="absolute right-2 px-4 py-3 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white rounded-lg border border-white/10 hover:border-rose-500/50 disabled:opacity-20 transition-all font-mono"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-rose-400 text-sm font-medium text-center mt-4"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => { setSelectedUser(null); setPin(''); }}
                      className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to users
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
