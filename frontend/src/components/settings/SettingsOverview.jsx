import React from 'react';

const Card = ({ title, value, color }) => (
    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', borderLeft: `4px solid ${color}` }}>
        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '5px' }}>{value}</div>
    </div>
);

const SettingsOverview = ({
    systemStats,
    tps,
    isTestingSpeed,
    handleSpeedTest,
    handlePurge,
    getRamColor
}) => {
    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>At a Glance</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <Card title="System Status" value="Online" color="#4ade80" />
                <Card title="Uptime" value={systemStats.uptime || "0h 0m"} color="#60a5fa" />
                <Card title="Active Agents" value="3" color="#f472b6" />
                <Card title="Version" value="v0.3.0 Alpha" color="#94a3b8" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Live Resource Monitor */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 20px 0', opacity: 0.8 }}>Live Resource Monitor</h4>

                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                        {/* RAM Circular Gauge */}
                        <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#333" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={getRamColor(systemStats.ram)}
                                    strokeWidth="4"
                                    strokeDasharray={`${systemStats.ram}, 100`}
                                    style={{ transition: 'stroke-dasharray 0.5s' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', flexDirection: 'column', display: 'flex', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{systemStats.ram}%</div>
                                <div style={{ fontSize: '0.5rem', opacity: 0.7 }}>{systemStats.ramDetails || 'RAM'}</div>
                            </div>
                        </div>

                        {/* Bars */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* VRAM */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                                    <span>VRAM (Live)</span>
                                    <span>{systemStats.vram}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${systemStats.vram}%`, height: '100%', background: '#8b5cf6' }}></div>
                                </div>
                            </div>
                            {/* Storage */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                                    <span>Storage</span>
                                    <span>{systemStats.storageDetails || 'Calculating...'}</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                                    Models: 15GB • Vectors: 200MB
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ margin: '0', opacity: 0.8 }}>Quick Actions</h4>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Test System Speed</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Run TPS Benchmark</div>
                        </div>
                        {tps ? (
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>{tps} TPS</div>
                        ) : (
                            <button onClick={handleSpeedTest} disabled={isTestingSpeed} className="btn-primary" style={{ fontSize: '0.8rem' }}>
                                {isTestingSpeed ? 'Testing...' : 'Run Test'}
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Purge Cache</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Free up RAM</div>
                        </div>
                        <button onClick={handlePurge} className="btn-primary" style={{ background: '#ef4444', fontSize: '0.8rem' }}>
                            Purge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsOverview;
