export interface IntegrationErrorSignal {
  area: "users" | "auth" | "checkin" | "general";
  reason: string;
  details?: Record<string, unknown>;
  at: number;
}

const INTEGRATION_ERROR_EVENT = "medcore:integration-error";

export function emitIntegrationError(signal: IntegrationErrorSignal): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<IntegrationErrorSignal>(INTEGRATION_ERROR_EVENT, { detail: signal }));
}

export function onIntegrationError(listener: (signal: IntegrationErrorSignal) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const custom = event as CustomEvent<IntegrationErrorSignal>;
    if (custom.detail) listener(custom.detail);
  };
  window.addEventListener(INTEGRATION_ERROR_EVENT, handler);
  return () => window.removeEventListener(INTEGRATION_ERROR_EVENT, handler);
}
