import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service or console
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
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 text-center border border-gray-700">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-red-500/10 rounded-full">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-3 text-gray-100">Oops! Something went wrong</h1>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              We're sorry, but an unexpected error occurred. The application has recovered from a crash, but you might need to refresh or return to the dashboard.
            </p>
            {this.state.error && (
              <div className="bg-gray-950 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32 border border-gray-700/50 shadow-inner">
                <p className="text-red-400/90 text-xs font-mono whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
              <button
                onClick={this.handleRefresh}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg shadow-blue-600/20 w-full sm:w-auto"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleReturnHome}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-all font-medium focus:outline-none focus:ring-2 focus:ring-gray-500/50 w-full sm:w-auto"
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
