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

    const [agentConfigs, setAgentConfigs] = useState({
        finance: { model: 'Llama-3-Finance', personality: 80 },
        health: { model: 'Mistral-OpenOrca', personality: 20 },
        legal: { model: 'Phi-3-Mini', personality: 90 }
    });
    const [systemPrompt, setSystemPrompt] = useState("Call me 'Sir', be concise, never use emojis.");

    const handleConfigChange = (agent, field, value) => {
        setAgentConfigs(prev => ({
            ...prev,
            [agent]: { ...prev[agent], [field]: value }
        }));
    };

    const availableModels = ['Llama-3-Finance', 'Mistral-OpenOrca', 'Phi-3-Mini', 'Qwen-Lite', 'Mistral-7B'];

    const [installedModels, setInstalledModels] = useState([
        { name: 'Llama-3-Finance', size: '4.7GB', quant: 'q4_k_m' },
        { name: 'Mistral-OpenOrca', size: '4.1GB', quant: 'q5_k_m' },
        { name: 'Phi-3-Mini', size: '1.8GB', quant: 'q8_0' }
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [downloadQueue, setDownloadQueue] = useState([
        { name: 'DeepSeek-Coder', progress: 45, speed: '12MB/s', eta: '2m' }
    ]);

    const [perfConfig, setPerfConfig] = useState({
        contextWindow: 4096,
        gpuEnabled: true,
        gpuLayers: 25,
        threadMode: 'auto',
        threadCount: 4
    });

    const [privacyConfig, setPrivacyConfig] = useState({
        anonymizeLogs: false,
        localOnlyMode: true,
        retentionFinance: '24h',
        retentionHealth: 'never',
        redactLevel: 'high'
    });

    const handlePerfChange = (field, value) => {
        setPerfConfig(prev => ({ ...prev, [field]: value }));
    };

    const handlePrivacyChange = (field, value) => {
        setPrivacyConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleNuke = () => {
        if (confirm("⚠️ NUKE CONTEXT? \n\nThis will instantly wipe ALL active RAM, Chat History, and Temporary Buffers.\nThis action is irreversible.")) {
            alert("💥 NUKE INITIATED.\n\n- RAM Cleared\n- History Wiped\n- Buffers Flushed");
            setSystemStats(prev => ({ ...prev, ram: 10, vram: 5 })); // Simulating wipe
        }
    };

    const handleClearHistory = () => {
        if (confirm("Are you sure? This will permanently delete all chat history.")) {
            alert("History cleared.");
        }
    };

    const handleExportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings: agentConfigs, system: systemStats }));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "local_ai_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleVerifyModel = (name) => {
        alert(`Verifying integrity hash for ${name}... \nHash: SHA256 matches registry.`);
    };

    const handleDeleteModel = (name) => {
        if (confirm(`Delete ${name}? This cannot be undone.`)) {
            setInstalledModels(prev => prev.filter(m => m.name !== name));
        }
    };

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
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>Agent Matrix Configuration</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Role Mapping Table */}
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '20px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#93c5fd' }}>Role Mapping & Personality</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                    {/* CFO Agent */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '20px', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#10b981' }}>CFO Agent</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Finance</div>
                                        </div>
                                        <select
                                            value={agentConfigs.finance.model}
                                            onChange={(e) => handleConfigChange('finance', 'model', e.target.value)}
                                            className="input-field"
                                            style={{ margin: 0 }}
                                        >
                                            {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px' }}>
                                                <span>Creative</span>
                                                <span style={{ fontWeight: 'bold' }}>{agentConfigs.finance.personality}% Precise</span>
                                            </div>
                                            <input type="range" min="0" max="100" value={agentConfigs.finance.personality} onChange={(e) => handleConfigChange('finance', 'personality', e.target.value)} style={{ width: '100%' }} />
                                        </div>
                                    </div>

                                    {/* Therapy Agent */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '20px', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#f472b6' }}>Wellness Agent</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Health</div>
                                        </div>
                                        <select
                                            value={agentConfigs.health.model}
                                            onChange={(e) => handleConfigChange('health', 'model', e.target.value)}
                                            className="input-field"
                                            style={{ margin: 0 }}
                                        >
                                            {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px' }}>
                                                <span>Empathetic</span>
                                                <span style={{ fontWeight: 'bold' }}>{agentConfigs.health.personality}% Clinical</span>
                                            </div>
                                            <input type="range" min="0" max="100" value={agentConfigs.health.personality} onChange={(e) => handleConfigChange('health', 'personality', e.target.value)} style={{ width: '100%' }} />
                                        </div>
                                    </div>

                                    {/* Legal Agent */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '20px', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: '#8b5cf6' }}>Paralegal Agent</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Legal</div>
                                        </div>
                                        <select
                                            value={agentConfigs.legal.model}
                                            onChange={(e) => handleConfigChange('legal', 'model', e.target.value)}
                                            className="input-field"
                                            style={{ margin: 0 }}
                                        >
                                            {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px' }}>
                                                <span>Casual</span>
                                                <span style={{ fontWeight: 'bold' }}>{agentConfigs.legal.personality}% Formal</span>
                                            </div>
                                            <input type="range" min="0" max="100" value={agentConfigs.legal.personality} onChange={(e) => handleConfigChange('legal', 'personality', e.target.value)} style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* System Prompt Injection */}
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '20px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#fbbf24' }}>Global System Prompt Injection</h4>
                                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '15px' }}>Define how the AI mesh addresses you and behaves globally.</p>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                    <button className="btn-primary" onClick={() => alert("Settings Saved!")}>Save Configuration</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'depot':
                return (
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>Model Depot</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Left Col: Installed Models */}
                            <div>
                                <h4 style={{ margin: '0 0 15px 0', opacity: 0.8 }}>Installed Models</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {installedModels.map((model, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#60a5fa' }}>{model.name}</div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '2px' }}>
                                                        {model.size} • {model.quant}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button onClick={() => handleVerifyModel(model.name)} title="Verify Hash" className="btn-icon" style={{ padding: '5px', fontSize: '0.9rem' }}>🔍</button>
                                                    <button onClick={() => handleDeleteModel(model.name)} title="Delete" className="btn-icon" style={{ padding: '5px', fontSize: '0.9rem', color: '#ef4444' }}>🗑️</button>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', fontSize: '0.7rem' }}>
                                                <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '10px' }}>Ready</span>
                                                {model.name.includes("Llama-3") && <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '10px', color: '#6ee7b7' }}>Core</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Col: Model Store */}
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '20px' }}>
                                <h4 style={{ margin: '0 0 15px 0', opacity: 0.8 }}>Model Store (Ollama Library)</h4>

                                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                    <input
                                        className="input-field"
                                        placeholder="Search models (e.g. mistral, llama)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && alert(`Searching for ${searchQuery}...`)}
                                    />
                                    <button className="btn-primary" onClick={() => alert(`Searching for ${searchQuery}...`)}>Search</button>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Recommended:</span>
                                    <span className="tag" style={{ border: '1px solid #10b981', color: '#10b981', cursor: 'pointer' }}>Best for 8GB RAM</span>
                                    <span className="tag" style={{ border: '1px solid #f472b6', color: '#f472b6', cursor: 'pointer' }}>Coding Specialists</span>
                                    <span className="tag" style={{ border: '1px solid #fbbf24', color: '#fbbf24', cursor: 'pointer' }}>Uncensored</span>
                                </div>

                                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.7 }}>Downloads Queue</h5>
                                {downloadQueue.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {downloadQueue.map((dl, idx) => (
                                            <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                                                    <span>{dl.name}</span>
                                                    <span>{dl.progress}%</span>
                                                </div>
                                                <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${dl.progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }}></div>
                                                </div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>{dl.speed} • {dl.eta} remaining</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', opacity: 0.4, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                                        Queue is empty
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'performance':
                return (
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>Performance (The Engine Room)</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            {/* Left Col: Context & Hardware */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                                {/* Context Window */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>Context Window (RAM Heavy)</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                        <span>2048</span>
                                        <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{perfConfig.contextWindow} Tokens</span>
                                        <span>32k</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="2048"
                                        max="32768"
                                        step="2048"
                                        value={perfConfig.contextWindow}
                                        onChange={(e) => handlePerfChange('contextWindow', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: '#fbbf24' }}
                                    />
                                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '8px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>⚠️</span>
                                        Increasing this allows the AI to read larger PDFs but consumes significantly more RAM.
                                    </div>
                                </div>

                                {/* Hardware Acceleration */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h4 style={{ margin: '0', color: '#a78bfa' }}>Hardware Acceleration</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>GPU Offloading</span>
                                            <button
                                                onClick={() => handlePerfChange('gpuEnabled', !perfConfig.gpuEnabled)}
                                                style={{
                                                    background: perfConfig.gpuEnabled ? '#10b981' : '#333',
                                                    border: 'none',
                                                    borderRadius: '15px',
                                                    width: '40px',
                                                    height: '20px',
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.3s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    background: 'white',
                                                    borderRadius: '50%',
                                                    position: 'absolute',
                                                    top: '2px',
                                                    left: perfConfig.gpuEnabled ? '22px' : '2px',
                                                    transition: 'left 0.3s'
                                                }}></div>
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ opacity: perfConfig.gpuEnabled ? 1 : 0.5, pointerEvents: perfConfig.gpuEnabled ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem' }}>
                                            <span>GPU Layers</span>
                                            <span>{perfConfig.gpuLayers} / 35</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="35"
                                            value={perfConfig.gpuLayers}
                                            onChange={(e) => handlePerfChange('gpuLayers', parseInt(e.target.value))}
                                            style={{ width: '100%', accentColor: '#a78bfa' }}
                                        />
                                        <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '5px' }}>How much of the model sits on the graphics card.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Threads & Summary */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                {/* Thread Count */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 15px 0', color: '#f472b6' }}>CPU Thread Count</h4>

                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        <button
                                            onClick={() => handlePerfChange('threadMode', 'auto')}
                                            className="btn-secondary"
                                            style={{
                                                flex: 1,
                                                background: perfConfig.threadMode === 'auto' ? '#f472b6' : 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                border: 'none'
                                            }}
                                        >
                                            Auto (Recommended)
                                        </button>
                                        <button
                                            onClick={() => handlePerfChange('threadMode', 'manual')}
                                            className="btn-secondary"
                                            style={{
                                                flex: 1,
                                                background: perfConfig.threadMode === 'manual' ? '#f472b6' : 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                border: 'none'
                                            }}
                                        >
                                            Manual
                                        </button>
                                    </div>

                                    {perfConfig.threadMode === 'manual' && (
                                        <div className="fade-in">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem' }}>
                                                <span>Cores Dedicated</span>
                                                <span>{perfConfig.threadCount} Cores</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="16"
                                                value={perfConfig.threadCount}
                                                onChange={(e) => handlePerfChange('threadCount', parseInt(e.target.value))}
                                                style={{ width: '100%', accentColor: '#f472b6' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Mock Stats Visualization - Engine Room Feel */}
                                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '15px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ fontSize: '4rem', opacity: 0.2 }}>⚙️</div>
                                    <div style={{ marginTop: '10px', opacity: 0.6, fontStyle: 'italic' }}>Engine optimized for output.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'privacy':
                return (
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>Privacy Vault</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                            {/* The Kill Switch */}
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '15px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#fca5a5', fontSize: '1.1rem' }}>⚠️ The Kill Switch</h4>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Instantly clears all active RAM, chat history, and context buffers.</div>
                                </div>
                                <button
                                    onClick={handleNuke}
                                    className="btn-primary"
                                    style={{
                                        background: '#dc2626',
                                        border: '2px solid #ef4444',
                                        padding: '10px 25px',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        boxShadow: '0 0 15px rgba(220, 38, 38, 0.5)'
                                    }}
                                >
                                    ☢️ NUKE CONTEXT
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                {/* Left Col: Retention Policy */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px' }}>
                                    <h4 style={{ margin: '0 0 20px 0', color: '#93c5fd' }}>Retention Policy</h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>Auto-delete Finance Chats</div>
                                            <select
                                                value={privacyConfig.retentionFinance}
                                                onChange={(e) => handlePrivacyChange('retentionFinance', e.target.value)}
                                                className="input-field"
                                                style={{ width: '100%', margin: 0 }}
                                            >
                                                <option value="24h">After 24 Hours</option>
                                                <option value="7d">After 7 Days</option>
                                                <option value="never">Never</option>
                                            </select>
                                        </div>

                                        <div>
                                            <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>Auto-delete Health Journals</div>
                                            <select
                                                value={privacyConfig.retentionHealth}
                                                onChange={(e) => handlePrivacyChange('retentionHealth', e.target.value)}
                                                className="input-field"
                                                style={{ width: '100%', margin: 0 }}
                                            >
                                                <option value="never">Never (Default)</option>
                                                <option value="30d">After 30 Days</option>
                                                <option value="1y">After 1 Year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Col: PII Redaction */}
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px' }}>
                                    <h4 style={{ margin: '0 0 20px 0', color: '#a78bfa' }}>PII Redaction Levels</h4>

                                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.9rem' }}>Auto-Redact Sensitivity</span>
                                        <div
                                            onClick={() => handlePrivacyChange('anonymizeLogs', !privacyConfig.anonymizeLogs)} // Using same toggle as Anonymize for now, conceptually linked
                                            style={{ width: '40px', height: '20px', background: privacyConfig.anonymizeLogs ? '#a78bfa' : '#333', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                                        >
                                            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: privacyConfig.anonymizeLogs ? '22px' : '2px', transition: 'left 0.3s' }}></div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div
                                            onClick={() => handlePrivacyChange('redactLevel', 'high')}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: `1px solid ${privacyConfig.redactLevel === 'high' ? '#a78bfa' : 'transparent'}`,
                                                background: privacyConfig.redactLevel === 'high' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.05)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #a78bfa', background: privacyConfig.redactLevel === 'high' ? '#a78bfa' : 'transparent' }}></div>
                                                High Sensitivity
                                            </div>
                                            <div style={{ marginLeft: '22px', fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>Redacts Names, Locations, Dates, Money.</div>
                                        </div>

                                        <div
                                            onClick={() => handlePrivacyChange('redactLevel', 'medium')}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: `1px solid ${privacyConfig.redactLevel === 'medium' ? '#a78bfa' : 'transparent'}`,
                                                background: privacyConfig.redactLevel === 'medium' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.05)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #a78bfa', background: privacyConfig.redactLevel === 'medium' ? '#a78bfa' : 'transparent' }}></div>
                                                Medium Sensitivity
                                            </div>
                                            <div style={{ marginLeft: '22px', fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>Redacts Names, SSNs.</div>
                                        </div>
                                    </div>
                                </div>
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
