import { Component, type ErrorInfo, type ReactNode } from "react";
import * as Sentry from "@sentry/react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  reportUrl?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { extra: { errorInfo } });
    console.error("Unhandled app error:", error, errorInfo);
  }

  private reloadPage = () => {
    window.location.reload();
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback, reportUrl } = this.props;

    if (!hasError) return children;
    if (fallback) return fallback;

    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <i className="ri-error-warning-line text-xl" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Nimadir noto'g'ri bajarildi</h1>
          <p className="text-sm text-gray-500 mt-2">
            Sahifani yuklashda kutilmagan xatolik yuz berdi. Sahifani yangilab qayta urinib ko'ring.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.reloadPage}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 cursor-pointer transition-colors"
            >
              Reload page
            </button>
            {reportUrl ? (
              <a
                href={reportUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Report issue
              </a>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
