import React, { useState } from 'react';
import './index.css';
import LegalWorkflow from './LegalWorkflow';
import FinanceWorkflow from './FinanceWorkflow';
import HealthWorkflow from './HealthWorkflow';

function App() {
  const [activeTab, setActiveTab] = useState('legal');

  const renderContent = () => {
    switch (activeTab) {
      case 'legal': return <LegalWorkflow />;
      case 'finance': return <FinanceWorkflow />;
      case 'health': return <HealthWorkflow />;
      default: return <LegalWorkflow />;
    }
  };

  const navItemStyle = (tab) => ({
    padding: '15px 20px',
    cursor: 'pointer',
    background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderLeft: activeTab === tab ? '4px solid #60a5fa' : '4px solid transparent',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  });

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-color)', color: 'white' }}>

      {/* Sidebar */}
      <div style={{ width: '250px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.5rem', margin: 0 }}>
            Local AI
          </h1>
          <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Privacy-First Suite</p>
        </div>

        <div style={{ flex: 1, paddingTop: '20px' }}>
          <div style={navItemStyle('legal')} onClick={() => setActiveTab('legal')}>
            <span>⚖️</span> Legal & Doc
          </div>
          <div style={navItemStyle('finance')} onClick={() => setActiveTab('finance')}>
            <span>📈</span> Finance
          </div>
          <div style={navItemStyle('health')} onClick={() => setActiveTab('health')}>
            <span>❤️</span> Health
          </div>
        </div>

        <div style={{ padding: '20px', fontSize: '0.8rem', opacity: 0.4 }}>
          v0.3.0 Alpha
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {renderContent()}
      </div>

    </div>
  );
}

export default App;
