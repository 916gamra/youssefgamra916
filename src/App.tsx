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

function SystemLifecycle() {
  useSystemCognition();
  return null;
}

export default function App() {
  const [isSplashScreenDone, setIsSplashScreenDone] = useState(false);
  const [isSessionVerified, setIsSessionVerified] = useState(false);
  const { isAuthenticated, currentUser, logout, checkSession } = useAuthStore();
  
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
        <SystemLifecycle />
        {/* Global Toast Notifications */}
        <Toaster 
          position="top-right" 
          expand={false}
          richColors
          closeButton
          theme="dark" 
          toastOptions={{
            className: 'bg-black/40 backdrop-blur-[20px] border border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[1.25rem] py-3 px-4 flex gap-3 items-center',
            descriptionClassName: 'text-slate-500 font-medium text-[11px] leading-tight',
            titleClassName: 'font-bold tracking-tight text-[13px]',
            style: {
              fontFamily: 'inherit',
            },
            success: {
              className: 'border-emerald-500/30 bg-emerald-500/5',
            },
            error: {
              className: 'border-rose-500/30 bg-rose-500/5',
            },
            warning: {
              className: 'border-amber-500/30 bg-amber-500/5',
            },
            info: {
              className: 'border-cyan-500/30 bg-cyan-500/5',
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

