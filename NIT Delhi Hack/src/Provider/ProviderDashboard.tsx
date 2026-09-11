import React, { useState } from 'react';
import { StatsOverview } from './StatsOverview';
import { EquipmentList } from './EquipmentList';
import { ProviderNotifications } from './ProviderNotifications';
import { PROVIDER_STATS } from './mockData';

interface ProviderDashboardProps {
  onToggleToRenter?: () => void;
}

type Tab = 'dashboard' | 'equipment' | 'requests';

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onToggleToRenter }) => {
  const [activeTab, setActiveTab] = useState<Tab>('equipment');
  // Lifted out of ProviderNotifications so the nav pill can show a badge
  // even while that tab isn't the active one.
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  return (
    <div className="min-h-screen w-full bg-[#f8f8f6] text-[#111] antialiased">
      {/* Floating Pill Header */}
      <header className="fixed left-1/2 top-3 z-50 flex w-[calc(100%-24px)] max-w-7xl -translate-x-1/2 items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-xl md:px-6">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 font-semibold tracking-tight text-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black">
              <span className="flex gap-0.5">
                <span className="h-3 w-0.5 rounded-full bg-white" />
                <span className="h-5 w-0.5 rounded-full bg-white" />
                <span className="h-3 w-0.5 rounded-full bg-white" />
              </span>
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-xs tracking-tight">ResourceLink</span>
              <span className="text-[9px] font-mono text-black/40 leading-none">
                NODE: {PROVIDER_STATS.nodeId}
              </span>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden sm:flex items-center gap-1.5 rounded-xl border border-black/10 bg-[#f8f8f6] p-1">
            <button
              onClick={() => setActiveTab('equipment')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === 'equipment'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-black/55 hover:text-black'
              }`}
            >
              Machine Inventory
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-black/55 hover:text-black'
              }`}
            >
              Provider Analytics
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === 'requests'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-black/55 hover:text-black'
              }`}
            >
              Requests
              {pendingRequestCount > 0 && (
                <span
                  className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold ${
                    activeTab === 'requests' ? 'bg-white text-black' : 'bg-black text-white'
                  }`}
                >
                  {pendingRequestCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right: Institution & Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-black/60">
            <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
            {PROVIDER_STATS.institutionName}
          </div>

          <button
            onClick={onToggleToRenter}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-xs font-medium transition hover:-translate-y-0.5 hover:border-black/30"
          >
            Switch to Renter
            <span className="text-black/40">→</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-5 pt-28 pb-16 md:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[9px] font-semibold tracking-[0.16em] text-black/50 uppercase mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            Institutional Node Workspace
          </div>
          <h1 className="text-4xl font-medium leading-tight tracking-[-0.04em] text-[#111] md:text-5xl">
            {activeTab === 'dashboard'
              ? 'Capacity & Yield Ledger'
              : activeTab === 'requests'
              ? 'Requests & Notifications'
              : 'Infrastructure & Telemetry'}
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-6 text-black/50">
            {activeTab === 'dashboard'
              ? 'Real-time telemetry performance, active lease cycles, and automated Algorand settlements.'
              : activeTab === 'requests'
              ? 'Review incoming booking requests and accept or reject them in one place.'
              : 'Manage registered hardware, configure pay-per-use slots, and inspect utilization rates.'}
          </p>
        </div>

        <div className="w-full">
          {activeTab === 'dashboard' && <StatsOverview />}
          {activeTab === 'equipment' && <EquipmentList />}
          {/* Kept mounted (just hidden) outside its tab so the nav badge
              above stays accurate even while the provider is looking at a
              different tab. */}
          <div className={activeTab === 'requests' ? '' : 'hidden'}>
            <ProviderNotifications onPendingCountChange={setPendingRequestCount} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 py-6 text-center text-[9px] text-black/30">
        ResourceLink Institutional Operating System · Verified Algorand Node
      </footer>
    </div>
  );
};

export default ProviderDashboard;