import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** When this value changes, a previously-caught error is cleared (e.g. on route change). */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render/lazy-chunk load errors so a single failed page does not crash
 * the whole app. Recovers automatically when `resetKey` changes (route change).
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch() {
    // Swallow: the fallback UI lets the user retry/reload.
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[color:var(--accent)]">Samahani</p>
          <p className="max-w-sm text-sm text-[color:var(--text-muted)]">
            Imeshindikana kupakia sehemu hii kwa sasa. Tafadhali jaribu tena.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border border-[color:var(--line-strong)] bg-[color:var(--surface-2)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--text-primary)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            Jaribu tena
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
