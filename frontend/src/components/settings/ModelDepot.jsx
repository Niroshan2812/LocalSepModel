import React from 'react';

const ModelDepot = ({
    installedModels,
    handleVerifyModel,
    handleDeleteModel,
    searchQuery,
    setSearchQuery,
    downloadQueue,
    handleCancelDownload
}) => {
    // Curated Curated Store Data (Mocked Registry)
    const curatedStoreModels = [
        { name: "llama3", description: "Meta's Llama 3 8B. Strong general purpose.", tags: ["General", "Efficient", "Meta"] },
        { name: "mistral", description: "Mistral 7B. High performance, Apache 2.0.", tags: ["General", "Open Source", "7B"] },
        { name: "gemma:7b", description: "Google's Gemma 7B. Lightweight and fast.", tags: ["General", "Google", "7B"] },
        { name: "phi3", description: "Microsoft's Phi-3 Mini. Best for low resources.", tags: ["Small", "Efficient", "Microsoft"] },
        { name: "codellama", description: "Specialized for code generation.", tags: ["Coding", "Programming"] },
        { name: "dolphin-mixtral", description: "Uncensored, creative storytelling.", tags: ["Uncensored", "Creative"] },
        { name: "nomic-embed-text", description: "High quality embedding model.", tags: ["Embedding", "Utility"] },
        { name: "llava", description: "Multimodal image understanding.", tags: ["Vision", "Multimodal"] },
        { name: "qwen2.5-coder", description: "Alibaba's Qwen Coder. Top tier coding.", tags: ["Coding", "Strong"] },
        { name: "deepseek-coder", description: "DeepSeek Coder. Very strong logic.", tags: ["Coding", "Logic"] }
    ];

    const filteredStore = curatedStoreModels.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleRecommendationClick = (tag) => {
        setSearchQuery(tag); // Or filter locally specific way
    };

    const [confirmModal, setConfirmModal] = React.useState(null);

    const handlePull = (model) => {
        setConfirmModal(model);
    };

    const confirmPull = () => {
        if (!confirmModal) return;
        const modelName = confirmModal.name;

        // API Call
        fetch('/api/settings/pull', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: modelName })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                // Optionally add to download queue mock
                downloadQueue.push({ name: modelName, progress: 0, speed: 'Starting...', eta: 'calculating...' });
            })
            .catch(e => alert("Failed to initiate pull: " + e));

        setConfirmModal(null);
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>Model Depot</h3>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.2)', maxWidth: '400px', width: '90%' }}>
                        <h4 style={{ marginTop: 0 }}>Confirm Download</h4>
                        <p style={{ opacity: 0.8 }}>Are you sure you want to download <strong>{confirmModal.name}</strong>?</p>
                        <div style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                            <div><strong>Description:</strong> {confirmModal.description}</div>
                            <div style={{ marginTop: '5px' }}><strong>Tags:</strong> {confirmModal.tags.join(', ')}</div>
                            <div style={{ marginTop: '5px', color: '#fbbf24' }}>⚠️ Large Download. Ensure you have disk space.</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn-secondary" onClick={() => setConfirmModal(null)}>Cancel</button>
                            <button className="btn-primary" onClick={confirmPull}>Yes, Pull Model</button>
                        </div>
                    </div>
                </div>
            )}


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Left Col: Installed Models */}
                <div>
                    <h4 style={{ margin: '0 0 15px 0', opacity: 0.8 }}>Installed Models</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {Array.isArray(installedModels) && installedModels.length > 0 ? (
                            installedModels.map((model, idx) => {
                                // Handle both string and object model formats safely
                                const modelName = typeof model === 'string' ? model : model.name;
                                const modelSize = typeof model === 'string' ? '' : model.size;
                                const modelQuant = typeof model === 'string' ? '' : model.quant;

                                return (
                                    <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#60a5fa' }}>{modelName}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '2px' }}>
                                                    {modelSize || 'Unknown Size'} • {modelQuant || 'Unknown Quant'}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button onClick={() => handleVerifyModel(modelName)} title="Verify Hash" className="btn-icon" style={{ padding: '5px', fontSize: '0.9rem' }}>🔍</button>
                                                <button onClick={() => handleDeleteModel(modelName)} title="Delete" className="btn-icon" style={{ padding: '5px', fontSize: '0.9rem', color: '#ef4444' }}>🗑️</button>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', fontSize: '0.7rem' }}>
                                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '10px' }}>Ready</span>
                                            {modelName.includes("Llama-3") && <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '10px', color: '#6ee7b7' }}>Core</span>}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div style={{ opacity: 0.5, fontStyle: 'italic' }}>No models found.</div>
                        )}
                    </div>
                </div>

                {/* Right Col: Model Store */}
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '15px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', opacity: 0.8 }}>Model Store (Curated Registry)</h4>

                    <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                        <input
                            className="input-field"
                            placeholder="Search models (e.g. coding, uncensored)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Recommended:</span>
                        <span onClick={() => handleRecommendationClick('7b')} className="tag" style={{ border: '1px solid #10b981', color: '#10b981', cursor: 'pointer' }}>Best for 8GB RAM</span>
                        <span onClick={() => handleRecommendationClick('coding')} className="tag" style={{ border: '1px solid #f472b6', color: '#f472b6', cursor: 'pointer' }}>Coding Specialists</span>
                        <span onClick={() => handleRecommendationClick('uncensored')} className="tag" style={{ border: '1px solid #fbbf24', color: '#fbbf24', cursor: 'pointer' }}>Uncensored</span>
                    </div>

                    {/* Filtered List */}
                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filteredStore.map((m, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{m.name}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{m.description}</div>
                                    <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
                                        {m.tags.map(t => <span key={t} style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px' }}>{t}</span>)}
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => handlePull(m)}>Pull</button>
                            </div>
                        ))}
                        {filteredStore.length === 0 && <div style={{ opacity: 0.5, textAlign: 'center' }}>No models match your search.</div>}
                    </div>


                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.7 }}>Downloads Queue</h5>
                    {downloadQueue.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {downloadQueue.map((dl, idx) => (
                                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{dl.name}</div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span>{dl.progress}%</span>
                                            <button
                                                onClick={() => handleCancelDownload(dl.name)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: '#ef4444', fontSize: '0.8rem', padding: 0
                                                }}
                                                title="Cancel Download"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${dl.progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }}></div>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>
                                        {dl.speed || 'Calculating...'} • {dl.eta || '...'} remaining • <span style={{ textTransform: 'capitalize' }}>{dl.status || ' Pending'}</span>
                                    </div>
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
