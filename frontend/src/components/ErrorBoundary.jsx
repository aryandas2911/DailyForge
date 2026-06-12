import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleReturnHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#3b8ea0]/10 dark:bg-[#3b8ea0]/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4eb7b3]/10 dark:bg-[#4eb7b3]/5 blur-3xl rounded-full pointer-events-none" />

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl z-10 box-border animate-in">
            <div className="flex justify-center mb-5">
              <div className="p-3 bg-rose-500/10 rounded-2xl">
                <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              An unexpected layout or runtime crash was caught. The system has safely isolated the incident, but you may need to refresh your view block or head back to the dashboard layout.
            </p>

            {this.state.error && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 mb-6 text-left overflow-auto max-h-32 scrollbar-thin shadow-inner">
                <p className="text-rose-500 dark:text-rose-400 text-xs font-mono font-bold whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
              <button
                onClick={this.handleRefresh}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReturnHome}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;