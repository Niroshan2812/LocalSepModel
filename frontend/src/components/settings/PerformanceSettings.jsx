import React from 'react';

const PerformanceSettings = ({ perfConfig, handlePerfChange }) => {
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
};

export default PerformanceSettings;
