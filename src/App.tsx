/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen } from '@/app/SplashScreen';
import { DesktopLayout } from '@/app/DesktopLayout';
import { LoginScreen } from '@/features/auth/views/LoginScreen';
import { User } from '@/core/db';

const queryClient = new QueryClient();

export default function App() {
  const [appState, setAppState] = useState<'booting' | 'login' | 'desktop'>('booting');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setAppState('desktop');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppState('login');
  };

  return (
    <QueryClientProvider client={queryClient}>
      {appState === 'booting' && <SplashScreen onComplete={() => setAppState('login')} />}
      {appState === 'login' && <LoginScreen onLogin={handleLogin} />}
      {appState === 'desktop' && <DesktopLayout user={currentUser} onLogout={handleLogout} />}
    </QueryClientProvider>
  );
}

