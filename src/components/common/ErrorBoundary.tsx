import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
          <div className="flex h-screen items-center justify-center flex-col p-6 text-center bg-slate-50">
              <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
              <p className="text-slate-500 mb-4">Please restart the app.</p>
              <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Reload</button>
          </div>
      );
    }
    return this.props.children;
  }
}
