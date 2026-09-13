import { useState } from 'react';
import Main from './Main';
import SmartMatch from './SmartMatch';
import './ReceiverApp.css';

type ReceiverTab = 'browse' | 'match';

export function ReceiverApp() {
  const [tab, setTab] = useState<ReceiverTab>('browse');

  return (
    <div className="receiver-app">
      <nav className="receiver-tabs">
        <button
          type="button"
          className={tab === 'browse' ? 'receiver-tab receiver-tab-active' : 'receiver-tab'}
          onClick={() => setTab('browse')}
        >
          Browse Equipment
        </button>
        <button
          type="button"
          className={tab === 'match' ? 'receiver-tab receiver-tab-active' : 'receiver-tab'}
          onClick={() => setTab('match')}
        >
          Smart Match
        </button>
      </nav>

      {/* Both kept mounted (just hidden) so switching tabs doesn't lose
          form input or re-trigger the equipment fetch every time. */}
      <div className={tab === 'browse' ? '' : 'receiver-tab-hidden'}>
        <Main />
      </div>
      <div className={tab === 'match' ? '' : 'receiver-tab-hidden'}>
        <SmartMatch />
      </div>
    </div>
  );
}

export default ReceiverApp;
