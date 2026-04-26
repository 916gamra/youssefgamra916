/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SplashScreen } from '@/app/SplashScreen';
import { DesktopLayout } from '@/app/DesktopLayout';
import { LoginScreen } from '@/features/auth/views/LoginScreen';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useSystemCognition } from '@/core/useSystemCognition';
import { seedUsers } from '@/core/seed';

const queryClient = new QueryClient();

export default function App() {
  const [isSplashScreenDone, setIsSplashScreenDone] = useState(false);
  const [isSessionVerified, setIsSessionVerified] = useState(false);
  const { isAuthenticated, currentUser, logout, checkSession } = useAuthStore();
  
  // Initialize System Consciousness
  useSystemCognition();

  useEffect(() => {
    // Check if there is an active session before removing the splash screen
    const verify = async () => {
       try {
         await seedUsers(); // Ensure base users exist
         await checkSession();
       } finally {
         setIsSessionVerified(true);
       }
    };
    verify();
  }, [checkSession]);

  const isBooting = !isSplashScreenDone || !isSessionVerified;

  return (
    <QueryClientProvider client={queryClient}>
      {/* Global Toast Notifications */}
      <Toaster 
        position="top-right" 
        theme="dark" 
        toastOptions={{
          className: 'bg-black/90 backdrop-blur-xl border border-white/10 text-white shadow-2xl rounded-xl',
          descriptionClassName: 'text-slate-400 font-medium',
          titleClassName: 'font-semibold tracking-wide'
        }}
      />

      {isBooting && (
        <SplashScreen onComplete={() => setIsSplashScreenDone(true)} />
      )}
      
      {!isBooting && !isAuthenticated && <LoginScreen />}
      
      {!isBooting && isAuthenticated && <DesktopLayout user={currentUser} onLogout={logout} />}
    </QueryClientProvider>
  );
}

