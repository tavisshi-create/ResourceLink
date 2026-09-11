import React, { useState, useEffect } from 'react';
import { fetchJson, sendJson, ApiError } from '../lib/api';
import { MOCK_EQUIPMENT, type EquipmentItem } from './mockData';

// The three states the provider can put a machine into from the dashboard.
// Maps 1:1 onto ResourceAllocation.Status on the backend, except "Active"
// on the frontend corresponds to "Available" in the database.
const STATUS_OPTIONS: EquipmentItem['status'][] = ['Active', 'Rented', 'Maintenance'];

function toBackendStatus(status: EquipmentItem['status']): string {
  return status === 'Active' ? 'Available' : status;
}

function fromBackendStatus(status: string): EquipmentItem['status'] {
  if (status === 'Available') return 'Active';
  if (status === 'Rented') return 'Rented';
  return 'Maintenance';
}

// Shape returned by GET /api/ResourceAllocations (camelCase, per
// ASP.NET Core's default System.Text.Json naming policy).
type ResourceAllocationDto = {
  id: string;
  name: string;
  category: string;
  ratePerHour: number;
  totalCostAlgo: number;
  status: string;
  location: string;
  images?: string[];
  specs?: Record<string, string>;
};

export const EquipmentList: React.FC = () => {
  const [items, setItems] = useState<EquipmentItem[]>(MOCK_EQUIPMENT);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedMachine, setSelectedMachine] = useState<EquipmentItem | null>(null);
  // Whether `items` came from the live API (vs. the mock fallback). Status
  // changes only get PATCHed to the backend when this is true - there's
  // nothing to persist against when we're just showing demo data.
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    fetchJson<ResourceAllocationDto[]>('/ResourceAllocations').then((data) => {
      if (data && data.length > 0) {
        const mapped: EquipmentItem[] = data.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category as EquipmentItem['category'],
          modelNumber: d.specs?.Model || 'Unknown',
          status: fromBackendStatus(d.status),
          ratePerHour: d.ratePerHour,
          totalEarningsAlgo: d.totalCostAlgo,
          utilizationRate: 0,
          location: d.location,
          imageUrl: d.images?.[0] || MOCK_EQUIPMENT[0].imageUrl,
        }));
        setItems(mapped);
        setUsingLiveData(true);
      }
    });
  }, []);

  const updateStatus = async (item: EquipmentItem, nextStatus: EquipmentItem['status']) => {
    if (nextStatus === item.status) return;

    setStatusUpdatingId(item.id);
    setStatusError(null);

    const previousItems = items;
    // Optimistic update - the toggle should feel instant.
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: nextStatus } : it)));
    setSelectedMachine((prev) => (prev && prev.id === item.id ? { ...prev, status: nextStatus } : prev));

    if (!usingLiveData) {
      // Demo mode - nothing to persist, the optimistic update is the result.
      setStatusUpdatingId(null);
      return;
    }

    try {
      await sendJson(`/ResourceAllocations/${item.id}/status`, 'PATCH', {
        status: toBackendStatus(nextStatus),
      });
    } catch (err) {
      // Roll back on failure so the UI never lies about persisted state.
      setItems(previousItems);
      setSelectedMachine((prev) => (prev && prev.id === item.id ? { ...prev, status: item.status } : prev));
      setStatusError(
        err instanceof ApiError ? err.message : `Couldn't update status for ${item.name}. Please try again.`,
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filtered = items.filter((item) => {
    const matchesQuery =
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase());

    const matchesFilter =
      filter === 'All' ||
      (filter === 'Medical' && item.category.includes('Imaging')) ||
      (filter === 'Research' && (item.category.includes('Microscopy') || item.category.includes('Biotechnology'))) ||
      (filter === 'Available Now' && item.status === 'Active');

    return matchesQuery && matchesFilter;
  });

  return (
    <div className="w-full space-y-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 md:flex-row md:items-end">
        <div>
          <div className="text-[9px] font-semibold tracking-[0.2em] text-black/40 uppercase">
            Capacity Inventory
          </div>
          <h2 className="mt-2 text-3xl font-medium tracking-[-0.04em] text-[#111] md:text-4xl">
            Registered Units
          </h2>
          <p className="mt-1 text-xs text-black/45">
            {filtered.length} hardware assets synchronized with Algorand testnet telemetry.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search equipment, bay or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-xs outline-none transition placeholder:text-black/35 focus:border-black/30"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          <div className="flex gap-1.5 overflow-x-auto">
            {['All', 'Medical', 'Research', 'Available Now'].map((tab) => (
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
              </button>
            ))}
          </div>

          <button className="flex items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-medium text-white transition hover:-translate-y-0.5">
            <span>+</span> Register Machine
          </button>
        </div>
      </div>

      {/* Equipment Grid with Canonical Tailwind v4 Durations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedMachine(item)}
            className="group relative cursor-pointer w-full border border-black/10 rounded-2xl overflow-hidden flex flex-col justify-between bg-white transition-all duration-700 hover:-translate-y-1 hover:border-black/30 hover:shadow-xl isolation-auto before:content-[''] before:absolute before:-top-5 before:-right-5 before:w-10 before:h-10 before:rounded-full before:bg-[#111] before:z-0 before:scale-100 before:transition-transform before:duration-1600 before:ease-in-out hover:before:scale-[65]"
          >
            {/* Corner Badge Arrow */}
            <div className="absolute top-0 right-0 z-20 w-7 h-7 rounded-bl-xl bg-[#111] flex items-center justify-center text-white text-[11px] transition-transform duration-500 group-hover:scale-105">
              <span className="font-mono">→</span>
            </div>

            <div className="relative z-10">
              {/* Image Banner */}
              <div className="relative h-36 w-full bg-[#f0f0ee] overflow-hidden border-b border-black/10 group-hover:border-white/10 transition-colors duration-1400">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover grayscale-15 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1400"
                />

                <span
                  className={`absolute top-2.5 left-2.5 text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border backdrop-blur-md transition-colors duration-1400 ${
                    item.status === 'Active'
                      ? 'bg-white/90 text-[#111] border-black/10'
                      : item.status === 'Rented'
                      ? 'bg-[#111] text-white border-white/20'
                      : 'bg-[#f0f0ee] text-black/60 border-black/10'
                  }`}
                >
                  {item.status}
                </span>

                <span className="absolute bottom-2.5 left-2.5 text-[8px] font-mono bg-white/90 text-black/70 px-1.5 py-0.5 rounded border border-black/10">
                  {item.id}
                </span>
              </div>

              {/* Body Details */}
              <div className="p-4">
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40 group-hover:text-white/40 transition-colors duration-1400">
                  {item.category}
                </div>
                <h3 className="text-sm font-medium text-[#111] group-hover:text-white mt-1 tracking-tight truncate transition-colors duration-1400">
                  {item.name}
                </h3>
                <p className="text-[11px] text-black/45 group-hover:text-white/50 font-normal truncate transition-colors duration-1400">
                  {item.modelNumber}
                </p>

                {/* Metrics Box */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-[#f8f8f6] group-hover:bg-white/5 border border-black/5 group-hover:border-white/10 rounded-xl text-xs transition-all duration-1400">
                  <div>
                    <span className="text-black/40 group-hover:text-white/40 block text-[8px] uppercase tracking-wider font-semibold transition-colors duration-1400">
                      Rate / Hour
                    </span>
                    <span className="font-medium text-[#111] group-hover:text-white text-xs transition-colors duration-1400">
                      {item.ratePerHour} ALGO
                    </span>
                  </div>
                  <div>
                    <span className="text-black/40 group-hover:text-white/40 block text-[8px] uppercase tracking-wider font-semibold transition-colors duration-1400">
                      Total Yield
                    </span>
                    <span className="font-medium text-[#111] group-hover:text-white text-xs transition-colors duration-1400">
                      {item.totalEarningsAlgo} ALGO
                    </span>
                  </div>
                </div>

                {/* Capacity Allocation Meter */}
                <div>
                  <div className="flex justify-between text-[10px] font-medium text-[#111] group-hover:text-white mb-1 transition-colors duration-1400">
                    <span className="text-black/50 group-hover:text-white/60">Capacity Allocated</span>
                    <span className="font-mono">{item.utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-black/10 group-hover:bg-white/10 h-1 rounded-full overflow-hidden transition-colors duration-1400">
                    <div
                      className="bg-[#111] group-hover:bg-white h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.utilizationRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-[10px] text-black/50 group-hover:text-white/60 px-4 py-3 border-t border-black/5 group-hover:border-white/10 flex items-center justify-between transition-all duration-1400">
              <span className="truncate max-w-32.5 flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                </svg>
                {item.location}
              </span>
              <span className="text-[#111] group-hover:text-white font-medium text-[10px] flex items-center gap-1 group-hover:translate-x-0.5 transition-all duration-300">
                Inspect <span>→</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Details Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-black/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono bg-[#f8f8f6] text-black/60 px-2 py-0.5 rounded border border-black/10">
                  {selectedMachine.id}
                </span>
                <h3 className="text-base font-medium text-[#111] mt-2">{selectedMachine.name}</h3>
                <p className="text-xs text-black/45">{selectedMachine.modelNumber}</p>
              </div>
              <button
                onClick={() => setSelectedMachine(null)}
                className="text-black/40 hover:text-black text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#f8f8f6] rounded-2xl border border-black/5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-black/45">Location:</span>
                <span className="font-medium text-[#111]">{selectedMachine.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/45">Rate:</span>
                <span className="font-medium text-[#111]">{selectedMachine.ratePerHour} ALGO/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/45">Total Yield:</span>
                <span className="font-medium text-[#111]">{selectedMachine.totalEarningsAlgo} ALGO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/45">Utilization:</span>
                <span className="font-medium text-[#111]">{selectedMachine.utilizationRate}%</span>
              </div>
            </div>

            {/* Instant Status Switch */}
            <div>
              <span className="text-[8px] font-semibold uppercase tracking-wider text-black/40">
                Availability Status
              </span>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = selectedMachine.status === option;
                  const isBusy = statusUpdatingId === selectedMachine.id;
                  return (
                    <button
                      key={option}
                      onClick={() => updateStatus(selectedMachine, option)}
                      disabled={isBusy}
                      className={`rounded-xl border py-2 text-[10px] font-medium transition disabled:opacity-50 ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-black/10 bg-white text-black/60 hover:border-black/30 hover:text-black'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {statusError && <p className="mt-2 text-[10px] text-red-600">{statusError}</p>}
            </div>

            <button
              onClick={() => setSelectedMachine(null)}
              className="w-full py-2.5 text-xs font-medium bg-black text-white rounded-xl hover:bg-neutral-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;