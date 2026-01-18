import React, { useState } from 'react';
import './index.css';
import Settings from './Settings';
import LegalWorkflow from './LegalWorkflow';
import FinanceWorkflow from './FinanceWorkflow';
import HealthWorkflow from './HealthWorkflow';
import { AIProvider, useAI } from './AIContext';

const StatusHeader = () => {
  const { activeTask } = useAI();
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', display: 'flex', gap: '15px', alignItems: 'center', zIndex: 100 }}>
      {/* Processing Indicator */}
      {activeTask && (
        <div className="glass-panel" style={{
          padding: '8px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(96, 165, 250, 0.2)',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          <div className="spinner" style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ opacity: 0.7 }}>Thinking... </span>
            <span style={{ fontWeight: 'bold' }}>{activeTask.model}</span>
          </div>
        </div>
      )}

      {/* Local Only Badge */}
      <div className="glass-panel" style={{
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#4ade80'
      }}>
        <span style={{ fontSize: '1rem' }}>🛡️</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Offline Mode</span>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('legal');

  const renderContent = () => {
    switch (activeTab) {
      case 'legal': return <LegalWorkflow />;
      case 'finance': return <FinanceWorkflow />;
      case 'health': return <HealthWorkflow />;
      case 'settings': return <Settings />;
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

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={navItemStyle('settings')} onClick={() => setActiveTab('settings')}>
            <span>⚙️</span> Settings
          </div>
        </div>

        <div style={{ padding: '20px', fontSize: '0.8rem', opacity: 0.4 }}>
          v0.3.0 Alpha
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <StatusHeader />
        <div style={{ flex: 1, overflow: 'hidden', paddingTop: '60px' }}> {/* Padding for header */}
          {renderContent()}
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AIProvider>
      <AppContent />
    </AIProvider>
  );
}
