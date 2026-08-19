import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-2">A JavaScript error occurred while rendering this page.</p>
            <p className="text-rose-400 text-xs font-mono bg-rose-950/40 rounded-lg px-3 py-2 mb-6 text-left break-all">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
