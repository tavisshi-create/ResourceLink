// Shared API client for talking to the ktr-back .NET backend.
//
// In dev, Vite proxies "/api" straight to the backend (see vite.config.ts),
// so the default base of "/api" works out of the box. If you ever need to
// point the frontend at a backend running somewhere else (e.g. a deployed
// build with no dev proxy), set VITE_API_URL in a .env file.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Fetch JSON from the backend. Resolves to `null` (instead of throwing)
 * when the request fails, so callers can fall back to mock data without
 * wrapping every call in try/catch.
 */
export async function fetchJson<T>(path: string): Promise<T | null> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new ApiError(`${url} responded with ${res.status}`, res.status);
    }

    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[api] falling back to mock data for ${path}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Send a JSON body to the backend (POST/PUT/PATCH/DELETE).
 *
 * Unlike `fetchJson`, this throws on failure instead of swallowing the
 * error into a `null` fallback - mutations like "accept this booking" or
 * "put this machine into maintenance" have a real-world side effect, so
 * the caller needs to know if it didn't actually happen (and show the user
 * an error) rather than silently pretending it worked.
 */
export async function sendJson<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `${url} responded with ${res.status}`;
    try {
      const errorBody = (await res.json()) as { message?: string };
      if (errorBody?.message) message = errorBody.message;
    } catch {
      // Response body wasn't JSON (or was empty) - stick with the default message.
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
