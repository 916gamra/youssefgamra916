import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Fingerprint, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function GatewayView() {
  const { login } = useAuthStore();
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const attemptLogin = async () => {
    if (pin.length !== 4) return;
    
    setIsAuthenticating(true);
    // Artificially slow down just a tiny bit for the cinematic effect
    await new Promise(resolve => setTimeout(resolve, 600)); 
    
    const isValid = await login(pin);
    
    if (isValid) {
      setSuccess(true);
      // Wait for zoom animation to finish before removing from tree
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      setIsShaking(true);
      setPin('');
      setTimeout(() => setIsShaking(false), 500);
    }
    
    setIsAuthenticating(false);
  };

  // Keyboard support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          attemptLogin();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  // Auto-submit when 4 digits are entered
  React.useEffect(() => {
    if (pin.length === 4 && !isAuthenticating && !success) {
      attemptLogin();
    }
  }, [pin]);

  const variants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    },
    success: {
      scale: 1.2,
      opacity: 0,
      filter: 'blur(20px)',
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  return (
    <AnimatePresence>
      {!success && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f] overflow-hidden"
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Abstract Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
          </div>

          {/* Central Card */}
          <motion.div 
            animate={isShaking ? "shake" : success ? "success" : "initial"}
            variants={variants}
            className="relative z-10 w-full max-w-[400px] p-8"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none border border-white/5" />
            
            <div className="relative z-10 flex flex-col items-center">
              {/* Logo / Avatar area */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <Shield className="w-10 h-10 text-cyan-400" />
              </div>
              
              <h1 className="text-2xl font-bold tracking-widest text-white mb-2">TITANIC OS</h1>
              <p className="text-xs text-indigo-200/50 uppercase tracking-[0.2em] mb-8">Industrial Gateway</p>

              {/* PIN Display */}
              <div className="flex gap-4 mb-10">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      pin.length > i 
                        ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110' 
                        : 'bg-transparent border-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Secure Input Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400/70 uppercase tracking-widest bg-cyan-400/10 px-4 py-2 rounded-full border border-cyan-400/20">
                {isAuthenticating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying DNA...</>
                ) : (
                  <><Fingerprint className="w-4 h-4" /> Awaiting PIN</>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
