import React from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Box } from 'lucide-react';

export function PartDetail({ tabId }: { tabId: string }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <header className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight">Part Details</h1>
          <p className="text-[var(--text-dim)] text-lg">Detailed view and stock history.</p>
        </div>
      </header>

      <GlassCard className="overflow-hidden">
        <div className="py-12 text-center text-[var(--text-dim)] border border-dashed border-[var(--glass-border)] rounded-xl bg-white/[0.02]">
          <Box className="w-12 h-12 mx-auto mb-4 opacity-50 text-[var(--accent)]" />
          <h3 className="text-lg font-medium text-[var(--text-bright)] mb-1">UI Temporarily Disabled</h3>
          <p className="max-w-sm mx-auto text-sm">We are upgrading to the new relational database schema (Families/Templates/Blueprints). Detailed part views will return soon!</p>
        </div>
      </GlassCard>
    </div>
  );
}
