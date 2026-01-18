import React, { useState, useEffect } from 'react';

function Settings() {
    const [activeSection, setActiveSection] = useState('overview');
    const [modelStatus, setModelStatus] = useState(null);

    useEffect(() => {
        // Fetch model status for "Model Depot" transparency
        fetch('/api/upgrade/status')
            .then(res => res.json())
            .then(data => setModelStatus(data))
            .catch(e => console.error(e));

        // Fetch System Stats (Live)
        const fetchStats = () => {
            fetch('/api/system/stats')
                .then(res => res.json())
                .then(data => {
                    setSystemStats({
                        ram: data.ramPercent,
                        vram: data.vramPercent, // Mocked backend
                        storage: data.storagePercent,
                        uptime: data.uptime,
                        ramDetails: `${data.ramUsedGb}GB / ${data.ramTotalGb}GB`,
                        storageDetails: `${data.storageUsedGb}GB Used`
                    });
                })
                .catch(e => console.error("Stats fetch error", e));
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const sections = [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'matrix', label: 'Agent Matrix', icon: '🤖' },
        { id: 'depot', label: 'Model Depot', icon: '📦' },
        { id: 'performance', label: 'Performance', icon: '⚡' },
        { id: 'privacy', label: 'Privacy Vault', icon: '🔐' }
    ];

    const [systemStats, setSystemStats] = useState({ ram: 40, vram: 25, storage: 15 }); // Mocked for now
    const [tps, setTps] = useState(null);
    const [isTestingSpeed, setIsTestingSpeed] = useState(false);

    // Speed Test Handler
    const handleSpeedTest = async () => {
        setIsTestingSpeed(true);
        setTps(null);
        const start = performance.now();
        try {
            // Send a fixed prompt
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: "Count from 1 to 20 fast." })
            });
            const data = await res.json();
            const end = performance.now();

            // Calc TPS (Approx: 1 token ~= 4 chars)
            const chars = data.response.length;
            const tokens = chars / 4;
            const seconds = (end - start) / 1000;
            const calculatedTps = (tokens / seconds).toFixed(2);

            setTps(calculatedTps);
        } catch (e) {
            console.error(e);
            setTps("Error");
        } finally {
            setIsTestingSpeed(false);
        }
    };

    const handlePurge = () => {
        // Mock purge for now
        alert("System Cache Purged! RAM freed.");
        setSystemStats(prev => ({ ...prev, ram: Math.max(10, prev.ram - 20) }));
    };

    // Helper for RAM Color
    const getRamColor = (usage) => {
        if (usage < 50) return '#4ade80'; // Green
        if (usage < 80) return '#fbbf24'; // Orange
        return '#ef4444'; // Red
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
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
            case 'matrix':
                return (
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3>Agent Matrix</h3>
                        <p style={{ opacity: 0.7, marginBottom: '20px' }}>Active autonomous agents in your mesh.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <AgentRow name="CFO Agent" role="Finance" model="Llama-3-Finance" status="Active" color="#10b981" />
                            <AgentRow name="Wellness Agent" role="Health" model="Llama-3-Health" status="Idle" color="#f472b6" />
                            <AgentRow name="Paralegal Agent" role="Legal" model="Mistral-7B-Law" status="Idle" color="#8b5cf6" />
                        </div>
                    </div>
                );
            case 'depot':
                return (
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3>Model Depot</h3>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                            <div style={{ flex: 1, padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                <h4>Current Core Model</h4>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa', margin: '10px 0' }}>
                                    {modelStatus?.currentModel || 'Unknown'}
                                </div>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                    This model powers the general reasoning capabilities of all agents.
                                </p>
                            </div>
                            <div style={{ flex: 1, padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                <h4>Available Upgrades</h4>
                                <ul style={{ paddingLeft: '20px', marginTop: '10px', lineHeight: '1.8' }}>
                                    <li>Llama-3-70B (Requires 64GB RAM)</li>
                                    <li>Mistral-Medium (Cloud Only)</li>
                                    <li>DeepSeek-Coder (Coding Specialist)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 'performance':
                return (
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3>Performance Monitor</h3>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '5px', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            {/* Fake Chart */}
                            {[40, 60, 45, 70, 30, 80, 50, 60, 90, 40, 50, 45].map((h, i) => (
                                <div key={i} style={{ flex: 1, background: '#60a5fa', opacity: 0.6, height: `${h}%`, borderRadius: '4px 4px 0 0' }}></div>
                            ))}
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.7 }}>
                            <span>Latency: 45ms</span>
                            <span>Memory: 4.2GB / 16GB</span>
                        </div>
                    </div>
                );
            case 'privacy':
                return (
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3>Privacy Vault</h3>
                        <p style={{ color: '#f87171', marginBottom: '20px' }}>Manage your sensitive data retention.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>Clear Chat History</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Permanently delete all conversation logs.</div>
                                </div>
                                <button className="btn-primary" style={{ background: '#ef4444' }}>Purge</button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>Export Data</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Download all your data as JSON.</div>
                                </div>
                                <button className="btn-primary" style={{ background: '#3b82f6' }}>Export</button>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', color: 'white' }}>
            {/* Settings Sidebar */}
            <div style={{ width: '200px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '20px' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>⚙️ Settings</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {sections.map(sec => (
                        <div
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id)}
                            style={{
                                padding: '10px 15px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                background: activeSection === sec.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: activeSection === sec.id ? 'white' : 'rgba(255,255,255,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <span>{sec.icon}</span>
                            {sec.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {renderContent()}
            </div>
        </div>
    );
}

// Sub-components
const Card = ({ title, value, color }) => (
    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', borderLeft: `4px solid ${color}` }}>
        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '5px' }}>{value}</div>
    </div>
);

const AgentRow = ({ name, role, model, status, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}></div>
            <div>
                <div style={{ fontWeight: 'bold' }}>{name}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{role} • {model}</div>
            </div>
        </div>
        <div style={{ padding: '5px 10px', borderRadius: '15px', background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>
            {status}
        </div>
    </div>
);

export default Settings;
