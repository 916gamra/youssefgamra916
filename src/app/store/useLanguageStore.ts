import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'EN' | 'FR' | 'AR';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  cycleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'EN',
      setLanguage: (lang) => set({ language: lang }),
      cycleLanguage: () => set((state) => {
        const sequence: Language[] = ['EN', 'FR', 'AR'];
        const currentIndex = sequence.indexOf(state.language);
        const nextIndex = (currentIndex + 1) % sequence.length;
        return { language: sequence[nextIndex] };
      }),
    }),
    {
      name: 'titan-language-storage',
    }
  )
);
