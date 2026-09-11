import React, { useCallback, useEffect, useState } from 'react';
import { Check, X, Clock, MapPin, Building2, ShieldCheck, Coins, RefreshCw } from 'lucide-react';
import { fetchJson, sendJson, ApiError } from '../lib/api';
import { MOCK_BOOKING_REQUESTS, type BookingRequest } from './mockData';

// Shape returned by GET /api/ProviderRequests (camelCase, per ASP.NET
// Core's default System.Text.Json naming policy). Mirrors BookingRequestDto
// on the backend.
type BookingRequestDto = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCategory: string;
  equipmentLocation: string;
  requesterInstitutionId: string;
  requesterInstitutionName: string;
  requesterInstitutionType: string;
  requesterInstitutionLocation: string;
  requesterInstitutionVerified: boolean;
  requesterName: string;
  startTime: string;
  endTime: string;
  hours: number;
  totalCostAlgo: number;
  purpose: string;
  status: BookingRequest['status'];
  createdAt: string;
};

function toBookingRequest(dto: BookingRequestDto): BookingRequest {
  return { ...dto };
}

type FilterTab = 'Pending' | 'Accepted' | 'Rejected' | 'All';

const FILTERS: FilterTab[] = ['Pending', 'Accepted', 'Rejected', 'All'];

// The backend seeds every new booking with "Pending Payment" until the
// renter's escrow clears - from the provider's point of view that's the
// "awaiting my decision" bucket, so the UI labels it "Pending".
function matchesFilter(status: BookingRequest['status'], filter: FilterTab): boolean {
  if (filter === 'All') return true;
  if (filter === 'Pending') return status === 'Pending Payment';
  return status === filter;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

function formatSlot(startIso: string, endIso: string): { date: string; range: string } {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return {
    date: dateFormatter.format(start),
    range: `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`,
  };
}

function StatusPill({ status }: { status: BookingRequest['status'] }) {
  const styles: Record<BookingRequest['status'], string> = {
    'Pending Payment': 'bg-[#f8f8f6] text-black/60 border-black/10',
    Accepted: 'bg-[#111] text-white border-black/10',
    Rejected: 'bg-white text-black/40 border-black/10 line-through decoration-black/30',
    Cancelled: 'bg-white text-black/40 border-black/10',
    Completed: 'bg-[#f8f8f6] text-black/60 border-black/10',
  };
  const label: Record<BookingRequest['status'], string> = {
    'Pending Payment': 'Awaiting Decision',
    Accepted: 'Accepted',
    Rejected: 'Rejected',
    Cancelled: 'Cancelled',
    Completed: 'Completed',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}

interface ProviderNotificationsProps {
  /** Reports how many requests are still awaiting a decision, so the parent tab/nav can show a badge. */
  onPendingCountChange?: (count: number) => void;
}

export const ProviderNotifications: React.FC<ProviderNotificationsProps> = ({ onPendingCountChange }) => {
  const [requests, setRequests] = useState<BookingRequest[]>(MOCK_BOOKING_REQUESTS);
  const [filter, setFilter] = useState<FilterTab>('Pending');
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchJson<BookingRequestDto[]>('/ProviderRequests');
    if (data) {
      setRequests(data.map(toBookingRequest));
      setUsingMockData(false);
    } else {
      setRequests(MOCK_BOOKING_REQUESTS);
      setUsingMockData(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const pendingCount = requests.filter((r) => r.status === 'Pending Payment').length;
    onPendingCountChange?.(pendingCount);
  }, [requests, onPendingCountChange]);

  const decide = async (id: string, nextStatus: 'Accepted' | 'Rejected') => {
    setActioningId(id);
    setActionError(null);

    // Optimistic update so the card responds instantly...
    const previous = requests;
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));

    try {
      if (usingMockData) {
        // No backend to talk to (dev fallback) - the optimistic update above is the result.
        return;
      }
      const updated = await sendJson<BookingRequestDto>(`/ProviderRequests/${id}/status`, 'PUT', {
        status: nextStatus,
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? toBookingRequest(updated) : r)));
    } catch (err) {
      // ...but roll back if the request actually failed server-side.
      setRequests(previous);
      setActionError(err instanceof ApiError ? err.message : 'Something went wrong updating that request.');
    } finally {
      setActioningId(null);
    }
  };

  const filtered = requests.filter((r) => matchesFilter(r.status, filter));
  const pendingCount = requests.filter((r) => r.status === 'Pending Payment').length;

  return (
    <div className="w-full space-y-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 md:flex-row md:items-end">
        <div>
          <div className="text-[9px] font-semibold tracking-[0.2em] text-black/40 uppercase">
            Requests &amp; Notifications
          </div>
          <h2 className="mt-2 text-3xl font-medium tracking-[-0.04em] text-[#111] md:text-4xl">
            Incoming Bookings
          </h2>
          <p className="mt-1 text-xs text-black/45">
            {pendingCount > 0
              ? `${pendingCount} request${pendingCount === 1 ? '' : 's'} awaiting your decision.`
              : 'All caught up — no requests awaiting a decision.'}
            {usingMockData && (
              <span className="ml-2 rounded-full border border-black/10 bg-[#f8f8f6] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-black/40">
                Demo data
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5 overflow-x-auto">
            {FILTERS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`whitespace-nowrap rounded-xl border px-3.5 py-2 text-[10px] font-medium transition ${
                  filter === tab
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 bg-white text-black/60 hover:border-black/30 hover:text-black'
                }`}
              >
                {tab}
                {tab === 'Pending' && pendingCount > 0 && (
                  <span
                    className={`ml-1.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] ${
                      filter === tab ? 'bg-white text-black' : 'bg-black text-white'
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={load}
            disabled={loading}
            title="Refresh"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white p-2.5 text-black/60 transition hover:border-black/30 hover:text-black disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 text-xs text-black/70">
          {actionError}
        </div>
      )}

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-[#111]">No requests here.</p>
          <p className="mt-1 text-xs text-black/45">
            {filter === 'Pending' ? 'New booking requests will show up in this tab.' : 'Try a different filter above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((req) => {
            const slot = formatSlot(req.startTime, req.endTime);
            const isPending = req.status === 'Pending Payment';
            const isActioning = actioningId === req.id;

            return (
              <div
                key={req.id}
                className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 transition hover:border-black/20 hover:shadow-lg hover:shadow-black/5"
              >
                <div className="space-y-4">
                  {/* Top row: equipment + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">
                        {req.equipmentCategory || 'Equipment'} · {req.equipmentId}
                      </div>
                      <h3 className="mt-1 text-sm font-medium tracking-tight text-[#111]">{req.equipmentName}</h3>
                    </div>
                    <StatusPill status={req.status} />
                  </div>

                  {/* Requester */}
                  <div className="flex items-start gap-2.5 rounded-xl border border-black/5 bg-[#f8f8f6] p-3">
                    <Building2 size={14} className="mt-0.5 shrink-0 text-black/40" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-[#111]">
                          {req.requesterInstitutionName}
                        </span>
                        {req.requesterInstitutionVerified && (
                          <ShieldCheck size={12} className="shrink-0 text-black/50" aria-label="Verified institution" />
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-black/45">
                        <span>{req.requesterName}</span>
                        {req.requesterInstitutionType && (
                          <>
                            <span>·</span>
                            <span>{req.requesterInstitutionType}</span>
                          </>
                        )}
                        {req.requesterInstitutionLocation && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {req.requesterInstitutionLocation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time slot + cost */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-black/5 bg-[#f8f8f6] p-2.5">
                      <span className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-black/40">
                        <Clock size={10} /> Time Slot
                      </span>
                      <span className="mt-1 block text-xs font-medium text-[#111]">{slot.date}</span>
                      <span className="block text-[10px] text-black/50">
                        {slot.range} · {req.hours}h
                      </span>
                    </div>
                    <div className="rounded-xl border border-black/5 bg-[#f8f8f6] p-2.5">
                      <span className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-black/40">
                        <Coins size={10} /> Total Cost
                      </span>
                      <span className="mt-1 block text-xs font-medium text-[#111]">{req.totalCostAlgo} ALGO</span>
                      <span className="block text-[10px] text-black/50">
                        {(req.totalCostAlgo / Math.max(req.hours, 1)).toFixed(1)} ALGO/hr
                      </span>
                    </div>
                  </div>

                  {/* Purpose */}
                  {req.purpose && (
                    <div>
                      <span className="text-[8px] font-semibold uppercase tracking-wider text-black/40">
                        Purpose
                      </span>
                      <p className="mt-1 text-xs leading-5 text-black/60">{req.purpose}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isPending ? (
                  <div className="mt-5 flex gap-2 border-t border-black/5 pt-4">
                    <button
                      onClick={() => decide(req.id, 'Rejected')}
                      disabled={isActioning}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white py-2.5 text-xs font-medium text-black/70 transition hover:border-black/30 hover:text-black disabled:opacity-50"
                    >
                      <X size={13} /> Reject
                    </button>
                    <button
                      onClick={() => decide(req.id, 'Accepted')}
                      disabled={isActioning}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-xs font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      <Check size={13} /> {isActioning ? 'Saving…' : 'Accept'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 border-t border-black/5 pt-4 text-[10px] text-black/40">
                    Decision recorded — {req.status === 'Accepted' ? 'equipment marked as Rented.' : 'no further action needed.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProviderNotifications;
