import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[System Crash] Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = (this as any).state;
    const { fallback, children } = (this as any).props;

    if (hasError) {
      if (fallback) return fallback;

      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-3xl border border-rose-500/20 rounded-3xl m-4">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-rose-500/5">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Protocol Failure</h2>
          <p className="text-zinc-400 text-center max-w-md mb-8">
            The current portal encountered a critical operational failure. System logs recorded the anomaly.
          </p>

          <div className="w-full max-w-lg bg-black/60 rounded-xl p-4 border border-white/5 mb-8 overflow-auto max-h-40">
            <code className="text-rose-400 text-xs font-mono">
              {error?.toString()}
            </code>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
          >
            <RefreshCw className="w-5 h-5" />
            Restart Interface
          </button>
        </div>
      );
    }

    return children;
  }
}

