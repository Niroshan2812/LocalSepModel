import React from 'react';

const AgentMatrix = ({
    agentConfigs,
    handleConfigChange,
    availableModels,
    systemPrompt,
    setSystemPrompt,
    handleSave
}) => {
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
                                {availableModels.map(m => {
                                    const name = typeof m === 'string' ? m : m.name;
                                    return <option key={name} value={name}>{name} {m.details ? `(${m.details})` : ''}</option>;
                                })}
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
                                {availableModels.map(m => {
                                    const name = typeof m === 'string' ? m : m.name;
                                    return <option key={name} value={name}>{name} {m.details ? `(${m.details})` : ''}</option>;
                                })}
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
                                {availableModels.map(m => {
                                    const name = typeof m === 'string' ? m : m.name;
                                    return <option key={name} value={name}>{name} {m.details ? `(${m.details})` : ''}</option>;
                                })}
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
                        <button className="btn-primary" onClick={handleSave}>Save Configuration</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentMatrix;
