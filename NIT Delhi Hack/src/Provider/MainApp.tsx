import { useState } from 'react';
import { ProviderDashboard } from './ProviderDashboard';
import ReceiverMain from '../receiver/Main';

export function MainApp() {
  const [mode, setMode] = useState<'provider' | 'renter'>('provider');

  if (mode === 'renter') {
    return (
      <div className="w-full relative">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setMode('provider')}
            className="bg-[#5a67ba] hover:bg-[#4d59a8] text-white text-xs font-semibold px-4 py-2.5 rounded transition shadow-md"
          >
            Return to Provider Mode
          </button>
        </div>
        <ReceiverMain />
      </div>
    );
  }

  return <ProviderDashboard onToggleToRenter={() => setMode('renter')} />;
}

export default MainApp;