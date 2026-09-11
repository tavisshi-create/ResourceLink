import { useState } from 'react';
import App from './App';
import { MainApp } from './Provider/MainApp';

export function Root() {
  const [route, setRoute] = useState<'landing' | 'app'>('landing');

  if (route === 'landing') {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-[9999]">
          <button
            onClick={() => setRoute('app')}
            className="bg-[#5a67ba] hover:bg-[#4d59a8] text-white text-xs font-semibold px-4 py-2.5 rounded transition shadow-md"
          >
            Launch Platform
          </button>
        </div>
        <App />
      </div>
    );
  }

  return <MainApp />;
}
