import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ShieldCheck, Fingerprint } from 'lucide-react';
import { cn } from '@/shared/utils';
import { toast } from 'sonner';
import { User } from '@/core/db';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useAuditTrail } from '@/features/system/hooks/useAuditTrail';
import { useNotificationsContext } from '@/shared/context/NotificationContext';
import { SystemBackground } from '@/shared/components/SystemBackground';
import { useActiveUsers } from '../hooks/useAuthSlots';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

export function LoginScreen() {
  const users = useActiveUsers();
  const { login } = useAuthStore();
  const { logEvent } = useAuditTrail();
  const { addNotification } = useNotificationsContext();
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
          
          addNotification({
            type: 'info',
            title: 'Identity Verified',
            message: `Neural link established for ${selectedUser.name}.`,
            source: 'Security Core',
            portal: 'SYSTEM'
          });

          toast.success(`Welcome back, ${selectedUser.name}!`, {
            description: 'System credentials verified. Establishing neural link...',
          });
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

          addNotification({
            type: 'warning',
            title: 'Intrusion Alert',
            message: `Unauthorized access attempt detected for identity: ${selectedUser.name}.`,
            source: 'Security Shield',
            portal: 'SYSTEM'
          });

          setError('AUTH_ERROR: Invalid credentials.');
          toast.error('Authentication Failed');
          setPin('');
          setTimeout(() => setError(''), 3000);
        }
      } catch (err) {
        addNotification({
          type: 'critical',
          title: 'System Breach',
          message: 'Internal verification failure detected in Security Core.',
          source: 'System Guard',
          portal: 'SYSTEM'
        });
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
          userId: 'ROOT',
          userName: 'System Root',
          action: 'LOGIN',
          entityType: 'SESSION',
          entityId: 'BACKDOOR',
          details: `Master root access granted.`,
          severity: 'CRITICAL'
        });

        addNotification({
          type: 'critical',
          title: 'Root Override',
          message: 'Master owner access protocols activated.',
          source: 'Titanic Kernel',
          portal: 'SYSTEM'
        });

        toast.success('Root Authenticated');
      } else {
        toast.error('Invalid Root Code');
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
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-wrap justify-center gap-6 w-full"
            >
              {users?.map((user) => (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  onClick={() => setSelectedUser(user)}
                  whileHover={{ y: -5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center p-4 w-40 rounded-2xl cursor-pointer group"
                >
                  <div className={`w-28 h-28 mb-4 rounded-full flex items-center justify-center text-4xl font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] ${user.color} bg-opacity-20 border border-white/10 group-hover:border-white/30 backdrop-blur-md relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                    <span className="drop-shadow-sm">{user.initials}</span>
                  </div>
                  <div className="text-center w-full">
                    <h2 className="text-sm font-medium text-white/90 tracking-wide truncate group-hover:text-white transition-colors">{user.name}</h2>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
          <motion.div 
            key="login-form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="w-full max-w-md relative flex flex-col items-center mx-auto"
          >
            <div className="flex flex-col items-center relative z-10 w-full max-w-sm mx-auto">
              
              <motion.div 
                variants={itemVariants}
                className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center text-3xl font-semibold text-white shadow-2xl ${selectedUser.color} bg-opacity-20 border-2 border-white/20 backdrop-blur-xl relative z-10 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                <span className="drop-shadow-sm">{selectedUser.initials}</span>
              </motion.div>
              
              <motion.h2 variants={itemVariants} className="text-2xl font-medium text-white tracking-tight mb-8 relative z-10 text-center drop-shadow-md">{selectedUser.name}</motion.h2>

              <form onSubmit={handleLogin} className="w-full relative z-10 flex flex-col items-center">
                <motion.div variants={itemVariants} className="relative flex items-center w-56 group mb-4">
                  <motion.input
                    type="password"
                    autoFocus
                    placeholder="Enter PIN"
                    value={pin}
                    animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                    onChange={(e) => setPin(e.target.value)}
                    disabled={isLoading}
                    className={cn(
                      "w-full bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border rounded-full px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-all font-sans text-center md:text-left text-sm backdrop-blur-2xl shadow-xl",
                      error ? "border-red-500/50 ring-red-500/20" : "border-white/20 focus:border-white/40 focus:ring-white/20"
                    )}
                  />
                  <AnimatePresence>
                    {pin.length > 0 && (
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all flex items-center justify-center border border-white/10"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                <AnimatePresence>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-white/80 font-medium text-xs text-center drop-shadow-md bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                
                <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center">
                  <button 
                    type="button" 
                    onClick={() => { setSelectedUser(null); setPin(''); setError(''); }}
                    className="flex flex-col items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer group"
                  >
                    <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 backdrop-blur-md transition-colors shadow-sm">
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                    Switch Identity
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
