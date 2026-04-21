import { StrictMode } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "remixicon/fonts/remixicon.css";
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './hooks/useAuth'
import { onIntegrationError } from "./api/integrationSignals";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: Boolean(import.meta.env.VITE_SENTRY_DSN) && import.meta.env.MODE !== "test",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],
  tracesSampleRate: 0.2,
  replaysOnErrorSampleRate: 1.0,
});

async function bootstrap() {
  const unsubscribeIntegrationErrors = onIntegrationError((signal) => {
    Sentry.captureMessage(`Integration error: ${signal.area}/${signal.reason}`, {
      level: "warning",
      extra: signal.details,
      tags: { area: signal.area, reason: signal.reason },
    });
  });

  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const [{ default: axe }, React, ReactDOM] = await Promise.all([
      import('@axe-core/react'),
      import('react'),
      import('react-dom'),
    ])
    axe(React, ReactDOM, 1000)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>,
  )

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      unsubscribeIntegrationErrors();
    });
  }
}

void bootstrap()
