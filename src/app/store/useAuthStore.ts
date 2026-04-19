import { create } from 'zustand';
import { db, User } from '@/core/db';
import { checkRateLimit, recordLoginAttempt, resetLoginAttempts, verifyPin, sessionManager } from '@/core/security';
import { useTabStore } from '@/app/store';
import { toast } from 'sonner';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (userId: number | null, pin: string) => Promise<boolean>;
  logout: () => void;
  checkSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,

  login: async (userId: number | null, pin: string) => {
    // 1. Check Rate Limit
    if (!checkRateLimit()) {
      toast.error('System Locked. Too many login attempts.', {
        description: 'Please wait 15 minutes before trying again.'
      });
      return false;
    }

    // 2. Failsafe Backdoor (First Setup Only)
    const count = await db.users.count();
    if (count === 0 && pin === '0000') {
      const adminUser: User = {
        name: 'System Admin',
        role: 'Super Administrator',
        initials: 'SA',
        color: 'bg-indigo-600',
        pin: '0000',
        isPrimary: true
      };
      
      const id = await db.users.add(adminUser);
      adminUser.id = id;
      
      sessionManager.createSession(id);
      resetLoginAttempts();
      useTabStore.getState().clearTabs();
      import('./useOsStore').then(m => m.useOsStore.getState().setPortal('HOME'));
      set({ currentUser: adminUser, isAuthenticated: true });
      return true;
    }

    // 3. Verify specific user against DB
    if (userId !== null) {
       const user = await db.users.get(userId);
       if (user) {
          if (await verifyPin(pin, user.pin)) {
            sessionManager.createSession(user.id!);
            resetLoginAttempts();
            useTabStore.getState().clearTabs();
            import('./useOsStore').then(m => m.useOsStore.getState().setPortal('HOME'));
            set({ currentUser: user, isAuthenticated: true });
            return true;
          }
       }
    }

    // Invalid PIN
    recordLoginAttempt();
    return false;
  },

  checkSession: async () => {
    const session = sessionManager.validateSession();
    if (!session) {
      set({ currentUser: null, isAuthenticated: false });
      return false;
    }

    const { currentUser } = get();
    if (!currentUser) {
      const user = await db.users.get(session.userId);
      if (user) {
        set({ currentUser: user, isAuthenticated: true });
        return true;
      } else {
        sessionManager.destroySession();
        set({ currentUser: null, isAuthenticated: false });
        return false;
      }
    }
    
    return true;
  },

  logout: () => {
    sessionManager.destroySession();
    // Strict isolation: Tabs must not survive logout
    useTabStore.getState().clearTabs();
    import('./useOsStore').then(module => {
      module.useOsStore.getState().setPortal('HOME');
    });
    set({ currentUser: null, isAuthenticated: false });
  }
}));
