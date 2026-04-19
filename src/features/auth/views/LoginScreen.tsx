import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Fingerprint, Lock, ChevronLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import bcrypt from 'bcryptjs';
import { toast } from 'sonner';
import { db, User } from '@/core/db';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useAuditTrail } from '@/features/system/hooks/useAuditTrail';

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
          setError('Incorrect PIN. Please try again.');
          toast.error('Authentication Failed');
          setPin('');
          setTimeout(() => setError(''), 3000);
        }
      } catch (err) {
        setError('An error occurred during verification.');
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
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0b10] flex flex-col items-center justify-center selection:bg-blue-500/30">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
        
        {/* Clock & Date (Windows 11 Style) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: selectedUser ? -40 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center mb-16 pointer-events-none"
        >
          <h1 className="text-7xl font-light text-white tracking-tight drop-shadow-lg">{formatTime(time)}</h1>
          <p className="text-xl text-white/80 font-medium mt-2 drop-shadow-md">{formatDate(time)}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedUser ? (
            <motion.div 
              key="user-list"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap justify-center gap-8"
            >
              {users?.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="group flex flex-col items-center gap-4 p-6 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
                >
                  <div className={`w-28 h-28 rounded-full ${user.color} flex items-center justify-center text-4xl font-semibold text-white shadow-2xl group-hover:scale-105 transition-transform duration-300 ring-4 ring-black/20 group-hover:ring-white/20`}>
                    {user.initials}
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-medium text-white">{user.name}</h2>
                    <p className="text-sm text-white/50 mt-1">{user.role}</p>
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
              className="flex flex-col items-center w-full max-w-sm"
            >
              <div className={`w-32 h-32 rounded-full ${selectedUser.color} flex items-center justify-center text-5xl font-semibold text-white shadow-2xl ring-4 ring-white/10 mb-6`}>
                {selectedUser.initials}
              </div>
              <h2 className="text-2xl font-medium text-white mb-1">{selectedUser.name}</h2>
              <p className="text-sm text-white/50 mb-8">{selectedUser.role}</p>

              <form onSubmit={handleLogin} className="w-full relative">
                <div className="relative flex items-center">
                  <input
                    type="password"
                    autoFocus
                    placeholder="PIN or Password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all backdrop-blur-md text-center tracking-widest text-lg"
                  />
                  <button 
                    type="submit"
                    disabled={pin.length === 0 || isLoading}
                    className="absolute right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:hover:bg-white/10 transition-colors"
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
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-xs text-center mt-3 font-medium"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                
                <div className="mt-6 flex flex-col items-center gap-4">
                  <button type="button" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                    <Fingerprint className="w-4 h-4" />
                    Sign-in options
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => { setSelectedUser(null); setPin(''); }}
                    className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mt-4"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Other users
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* OS Footer Elements */}
      <div className="absolute bottom-8 right-8 flex items-center gap-4 text-white/50">
        <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer bg-black/20 p-2 rounded-lg backdrop-blur-md border border-white/5">
          <Lock className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
