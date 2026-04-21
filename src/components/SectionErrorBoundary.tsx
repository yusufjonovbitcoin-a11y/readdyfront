import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/react";

interface SectionErrorBoundaryProps {
  children: ReactNode;
}

interface SectionBoundaryImplProps {
  children: ReactNode;
  onRetry: () => void;
}

interface SectionBoundaryImplState {
  hasError: boolean;
}

class SectionBoundaryImpl extends Component<SectionBoundaryImplProps, SectionBoundaryImplState> {
  state: SectionBoundaryImplState = { hasError: false };

  static getDerivedStateFromError(): SectionBoundaryImplState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { extra: { errorInfo } });
    console.error("Section render error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">This section failed to load.</p>
        <button
          type="button"
          onClick={this.props.onRetry}
          className="mt-2 text-xs font-semibold text-amber-900 underline cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }
}

export default function SectionErrorBoundary({ children }: SectionErrorBoundaryProps) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <SectionBoundaryImpl key={retryKey} onRetry={() => setRetryKey((value) => value + 1)}>
      {children}
    </SectionBoundaryImpl>
  );
}
