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

import { NotificationProvider } from '@/shared/context/NotificationContext';

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
      <NotificationProvider>
        {/* Global Toast Notifications */}
        <Toaster 
          position="top-right" 
          theme="dark" 
          toastOptions={{
            className: 'bg-black/80 backdrop-blur-3xl border border-white/10 text-white shadow-2xl shadow-black/50 rounded-2xl group',
            descriptionClassName: 'text-slate-400 font-medium text-xs',
            titleClassName: 'font-semibold tracking-wide text-sm',
            style: {
              borderLeft: '4px solid transparent',
            }
          }}
        />

        {isBooting && (
          <SplashScreen onComplete={() => setIsSplashScreenDone(true)} />
        )}
        
        {!isBooting && !isAuthenticated && <LoginScreen />}
        
        {!isBooting && isAuthenticated && <DesktopLayout user={currentUser} onLogout={logout} />}
      </NotificationProvider>
    </QueryClientProvider>
  );
}

