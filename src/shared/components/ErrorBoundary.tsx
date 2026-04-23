import * as React from 'react';
import { AlertTriangle, RefreshCw, TerminalSquare } from 'lucide-react';
import { db } from '@/core/db';

interface Props {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined, errorInfo: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[System Crash] Uncaught error:', error, errorInfo);
    try {
      db.auditLogs.add({
        id: crypto.randomUUID(),
        userId: 'SYSTEM',
        userName: 'Error Boundary',
        action: 'SYSTEM_CRASH',
        entityType: (this as any).props.componentName || 'UI_COMPONENT',
        entityId: 'CRITICAL',
        details: JSON.stringify({ message: error.message, stack: error.stack, info: errorInfo.componentStack }),
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        deviceInfo: navigator.userAgent
      });
    } catch (e) {
      console.error('Failed to log critical error to DB', e);
    }
    this.setState({ errorInfo });
  }

  render() {
    const { hasError, error, errorInfo } = (this as any).state;
    const { fallback, children, componentName } = (this as any).props;

    if (hasError) {
      if (fallback) return fallback;

      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0a0f18] text-slate-300 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 w-full h-1 bg-red-500 animate-pulse" />
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-500/5">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3">
             <TerminalSquare className="w-6 h-6 text-red-500" />
             Fatal Exception
          </h2>
          <p className="text-slate-400 text-center max-w-lg mb-8 uppercase tracking-widest text-[10px] font-bold">
            Module [{componentName || 'UNKNOWN'}] encountered a critical runtime error. Incident logged to secure audit trail.
          </p>

          <div className="w-full max-w-2xl bg-black/60 rounded-xl p-6 border border-white/5 mb-8 overflow-auto max-h-48 shadow-inner shadow-black/50 custom-scrollbar text-left flex flex-col gap-2">
            <code className="text-red-400 text-sm font-mono font-bold block mb-2 pb-2 border-b border-red-500/20">
              {error?.toString()}
            </code>
            <code className="text-slate-500 text-[10px] font-mono whitespace-pre text-left">
              {errorInfo?.componentStack || error?.stack}
            </code>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-3.5 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl mb-4 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
          >
            <RefreshCw className="w-4 h-4" />
            Reboot Interface Console
          </button>
        </div>
      );
    }

    return children;
  }
}

