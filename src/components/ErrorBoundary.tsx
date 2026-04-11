import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, errorId: `err_${Date.now().toString(36)}` };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(JSON.stringify({
      type: 'react_error_boundary',
      context: this.props.context ?? 'unknown',
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join(' | '),
      componentStack: info.componentStack?.split('\n').slice(0, 5).join(' | '),
      timestamp: new Date().toISOString(),
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 4, maxWidth: 400 }}>
            An unexpected error occurred{this.props.context ? ` in ${this.props.context}` : ''}.
          </p>
          {this.state.errorId && (
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 20, fontFamily: 'monospace' }}>
              Ref: {this.state.errorId}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => this.setState({ hasError: false, errorId: null })}
              className="btn-primary"
              style={{ fontSize: 14 }}
            >
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/diagnostic/admin'; }}
              className="btn-outline"
              style={{ fontSize: 14 }}
            >
              Go to Admin
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
