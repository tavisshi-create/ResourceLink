// Client for the Smart Resource Matching FastAPI service.
//
// This is a SEPARATE backend from the .NET API that `lib/api.ts` talks to,
// so it gets its own base URL instead of reusing API_BASE/'/api'.
//
// - If your FastAPI service is proxied through the same origin (e.g. nginx
//   routes "/match-api" to it, the way Vite proxies "/api" to the .NET
//   backend in dev), leave MATCH_API_BASE as-is.
// - If it runs on its own host/port, set VITE_MATCHING_API_URL in your
//   .env file, e.g. VITE_MATCHING_API_URL=http://localhost:8000
const MATCH_API_BASE = (import.meta.env.VITE_MATCHING_API_URL as string | undefined) ?? '/match-api';

export class MatchApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'MatchApiError';
    this.status = status;
  }
}

export interface MatchRequest {
  category: string;
  capability: string;
  location: string;
  /** ISO date, e.g. "2026-09-15" */
  date: string;
  /** 24h time, e.g. "09:00" */
  time: string;
  budget: number | null;
  operatorRequired: boolean;
}

// ---------------------------------------------------------------------------
// ADJUST ME: I don't have your FastAPI route's exact Pydantic schema, so
// this is my best-guess shape for one ranked result, covering every field
// the results UI needs. Update the field names below (and the two spots
// marked below in `findBestMatch`) to match whatever your endpoint actually
// returns.
// ---------------------------------------------------------------------------
export interface MatchedResource {
  resourceId: string;
  name: string;
  institution?: string;
  category: string;
  capability?: string;
  location: string;
  /** Human-readable availability, e.g. "Mon-Fri, 9AM-5PM" or a confirmed slot */
  availability?: string;
  /** Cost for the requested slot, e.g. rate per hour */
  budget?: number;
  operatorAvailable?: boolean;
  matchScore: number; // expected 0-100
  image?: string;
  detailsUrl?: string;
}

export async function findBestMatch(payload: MatchRequest): Promise<MatchedResource[]> {
  // ADJUST ME: path + request body shape.
  const url = `${MATCH_API_BASE}/match`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `${url} responded with ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string; message?: string };
      if (body?.detail) message = typeof body.detail === 'string' ? body.detail : message;
      else if (body?.message) message = body.message;
    } catch {
      // Response body wasn't JSON (or was empty) - stick with the default message.
    }
    throw new MatchApiError(message, res.status);
  }

  const data = await res.json();

  // ADJUST ME: unwrap here if your API nests the array, e.g. `data.results`
  // or `data.matches`, instead of returning a bare array.
  const results: unknown = Array.isArray(data) ? data : (data as { results?: unknown }).results ?? data;

  return Array.isArray(results) ? (results as MatchedResource[]) : [];
}
