// src/components/ErrorBoundary.jsx - Enhanced error boundary with better UX
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // You can integrate with services like Sentry here
      console.error("Production error:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      isRetrying: true,
    });

    // Reset error state after a brief delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      });
    }, 1000);
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>

              <p className="text-muted-foreground mb-6">
                We're sorry, but something unexpected happened. Please try
                again.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {this.state.isRetrying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Retrying...
                  </span>
                ) : (
                  "Try Again"
                )}
              </button>

              <button
                onClick={this.handleReload}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Reload Page
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Go Back
              </button>
            </div>

            {/* Development error details */}
            {isDevelopment && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
                  🔍 Error Details (Development)
                </summary>
                <div className="bg-muted p-4 rounded-lg text-xs font-mono overflow-auto max-h-40">
                  <div className="text-destructive font-semibold mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="font-semibold mb-2">Component Stack:</div>
                      <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
