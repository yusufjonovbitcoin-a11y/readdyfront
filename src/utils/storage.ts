export function parseJsonSafe<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getStorageJsonSafe<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return parseJsonSafe<T>(window.localStorage.getItem(key), fallback);
}
