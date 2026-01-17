import React, { useState, useRef } from 'react';

function FinanceWorkflow() {
    const [data, setData] = useState(null);
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/finance/upload', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.status === 'success') {
                setData(result);
                setAnalysis(''); // Clear previous analysis
            } else {
                alert("Error: " + result.message);
            }
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        }
    };

    const RequestAnalysis = async () => {
        if (!data || !data.totals) return;
        setIsAnalyzing(true);
        try {
            const res = await fetch('/api/finance/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totals: data.totals })
            });
            const result = await res.json();
            setAnalysis(result.analysis);
        } catch (e) {
            console.error(e);
            setAnalysis("Failed to get analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <header style={{ textAlign: 'center' }}>
                <h2 style={{ color: 'white', marginBottom: '5px' }}>Private Finance Analyst</h2>
                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Local CSV Processing • No Cloud Upload</p>
            </header>

            {!data && (
                <div className="glass-panel" style={{ padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'center' }}>
                    <div style={{ fontSize: '4rem', opacity: 0.5 }}>📊</div>
                    <p style={{ fontSize: '1.2rem' }}>Upload your Bank Statement (CSV)</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" style={{ display: 'none' }} />
                    <button className="btn-primary" onClick={() => fileInputRef.current.click()}>Select CSV File</button>
                    <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>Supported columns: Date, Description, Amount</p>
                </div>
            )}

            {data && (
                <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
                    {/* Left: Transactions Table (Lite Task) */}
                    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Recent Transactions ({data.count})</strong>
                            <button className="btn-icon" onClick={() => setData(null)} title="Clear">🗑️</button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead style={{ textAlign: 'left', opacity: 0.7 }}>
                                    <tr>
                                        <th style={{ padding: '8px' }}>Date</th>
                                        <th style={{ padding: '8px' }}>Desc</th>
                                        <th style={{ padding: '8px' }}>Category</th>
                                        <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.transactions.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '8px', opacity: 0.8 }}>{t.date}</td>
                                            <td style={{ padding: '8px' }}>{t.description}</td>
                                            <td style={{ padding: '8px' }}>
                                                <span style={{
                                                    background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8em'
                                                }}>
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'right', color: t.amount < 0 ? '#f87171' : '#4ade80' }}>
                                                {t.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Analysis (Pro Task) */}
                    <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Category Summary (Lite) */}
                        <div className="glass-panel" style={{ padding: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Thinking...</h4>
                            {Object.entries(data.totals).map(([cat, amount]) => (
                                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    <span>{cat}</span>
                                    <span>{Math.abs(amount).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* AI Insight */}
                        <div className="glass-panel" style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 100%)' }}>
                            <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                🤖 AI Analyst
                                {!analysis && !isAnalyzing && (
                                    <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '5px 10px' }} onClick={RequestAnalysis}>
                                        Analyze
                                    </button>
                                )}
                            </h4>

                            {isAnalyzing && <div style={{ opacity: 0.7 }}>Crunching numbers...</div>}

                            {analysis && (
                                <div style={{ fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                    {analysis}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FinanceWorkflow;
