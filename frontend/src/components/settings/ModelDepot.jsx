import React from 'react';

const ModelDepot = ({
    installedModels,
    handleVerifyModel,
    handleDeleteModel,
    searchQuery,
    setSearchQuery,
    downloadQueue
}) => {
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
};

export default ModelDepot;
