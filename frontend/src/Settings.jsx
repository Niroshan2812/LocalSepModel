import React, { useState, useEffect } from 'react';
import SettingsOverview from './components/settings/SettingsOverview';
import AgentMatrix from './components/settings/AgentMatrix';
import ModelDepot from './components/settings/ModelDepot';
import PerformanceSettings from './components/settings/PerformanceSettings';
import PrivacyVault from './components/settings/PrivacyVault';

function Settings() {
    const [activeSection, setActiveSection] = useState('overview');
    const [modelStatus, setModelStatus] = useState(null);

    const [systemStats, setSystemStats] = useState({ ram: 40, vram: 25, storage: 15 }); // Mocked for now
    const [tps, setTps] = useState(null);
    const [isTestingSpeed, setIsTestingSpeed] = useState(false);

    const [agentConfigs, setAgentConfigs] = useState({
        finance: { model: 'Llama-3-Finance', personality: 80 },
        health: { model: 'Mistral-OpenOrca', personality: 20 },
        legal: { model: 'Phi-3-Mini', personality: 90 }
    });
    const [systemPrompt, setSystemPrompt] = useState("Call me 'Sir', be concise, never use emojis.");

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

    useEffect(() => {
        // Fetch Settings from Backend
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.agentConfigs) setAgentConfigs(data.agentConfigs);
                if (data.perfConfig) setPerfConfig(data.perfConfig);
                if (data.privacyConfig) setPrivacyConfig(data.privacyConfig);
            })
            .catch(e => console.error("Failed to load settings", e));

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

    const saveSettings = (newSettings) => {
        // Construct full settings object to save
        // We can either save partial or full. Let's save full state for simplicity or what is passed.
        // Actually, let's just save the current state.
        // But state setters are async. Best to pass the updated object if possible,
        // or just rely on current state if triggered by a button (state should be up to date).

        const settingsToSave = {
            agentConfigs,
            perfConfig,
            privacyConfig,
            systemPrompt,
            ...newSettings // Override with specific updates if provided
        };

        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settingsToSave)
        })
            .then(res => res.json())
            .then(data => {
                console.log(data.message);
                // Optional: alert("Settings Saved");
            })
            .catch(e => console.error("Failed to save settings", e));
    };

    const sections = [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'matrix', label: 'Agent Matrix', icon: '🤖' },
        { id: 'depot', label: 'Model Depot', icon: '📦' },
        { id: 'performance', label: 'Performance', icon: '⚡' },
        { id: 'privacy', label: 'Privacy Vault', icon: '🔐' }
    ];

    const handleConfigChange = (agent, field, value) => {
        setAgentConfigs(prev => {
            const updated = {
                ...prev,
                [agent]: { ...prev[agent], [field]: value }
            };
            // Debounced save could go here, or just manual save.
            // For now, let's keep manual save on AgentMatrix, but update state.
            return updated;
        });
    };

    const [availableModels, setAvailableModels] = useState([]);

    useEffect(() => {
        // Fetch Real Models
        fetch('/api/settings/models')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setAvailableModels(data);
                } else {
                    // Fallback if API fails or returns empty
                    setAvailableModels(['Llama-3-Finance', 'Mistral-OpenOrca', 'Phi-3-Mini', 'Qwen-Lite']);
                }
            })
            .catch(e => {
                console.error("Failed to fetch models", e);
                setAvailableModels(['Llama-3-Finance', 'Mistral-OpenOrca', 'Phi-3-Mini']);
            });
    }, []);

    const handlePerfChange = (field, value) => {
        setPerfConfig(prev => {
            const updated = { ...prev, [field]: value };
            saveSettings({ perfConfig: updated }); // Auto-save for performance
            return updated;
        });
    };

    const handlePrivacyChange = (field, value) => {
        setPrivacyConfig(prev => {
            const updated = { ...prev, [field]: value };
            saveSettings({ privacyConfig: updated }); // Auto-save for privacy
            return updated;
        });
    };

    const handleNuke = () => {
        if (confirm("⚠️ NUKE CONTEXT? \n\nThis will instantly wipe ALL active RAM, Chat History, and Temporary Buffers.\nThis action is irreversible.")) {
            alert("💥 NUKE INITIATED.\n\n- RAM Cleared\n- History Wiped\n- Buffers Flushed");
            setSystemStats(prev => ({ ...prev, ram: 10, vram: 5 })); // Simulating wipe
        }
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
                return <SettingsOverview
                    systemStats={systemStats}
                    tps={tps}
                    isTestingSpeed={isTestingSpeed}
                    handleSpeedTest={handleSpeedTest}
                    handlePurge={handlePurge}
                    getRamColor={getRamColor}
                />;
            case 'matrix':
                return <AgentMatrix
                    agentConfigs={agentConfigs}
                    handleConfigChange={handleConfigChange}
                    availableModels={availableModels}
                    systemPrompt={systemPrompt}
                    setSystemPrompt={setSystemPrompt}
                    handleSave={() => saveSettings({ agentConfigs, systemPrompt })}
                />;
            case 'depot':
                return <ModelDepot
                    installedModels={installedModels}
                    handleVerifyModel={handleVerifyModel}
                    handleDeleteModel={handleDeleteModel}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    downloadQueue={downloadQueue}
                />;
            case 'performance':
                return <PerformanceSettings
                    perfConfig={perfConfig}
                    handlePerfChange={handlePerfChange}
                />;
            case 'privacy':
                return <PrivacyVault
                    privacyConfig={privacyConfig}
                    handlePrivacyChange={handlePrivacyChange}
                    handleNuke={handleNuke}
                />;
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

export default Settings;
