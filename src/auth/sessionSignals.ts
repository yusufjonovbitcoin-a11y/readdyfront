export type SessionFailureSignal = {
  reason: "unauthorized";
  status: 401;
  at: number;
};

type SessionFailureListener = (signal: SessionFailureSignal) => void;

const listeners = new Set<SessionFailureListener>();

export function emitSessionFailure(signal: SessionFailureSignal) {
  listeners.forEach((listener) => {
    listener(signal);
  });
}

export function onSessionFailure(listener: SessionFailureListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
