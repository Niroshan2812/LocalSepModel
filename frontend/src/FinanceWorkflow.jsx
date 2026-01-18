import React, { useState, useRef } from 'react';
import { useAI } from './AIContext';

function FinanceWorkflow() {
    const [data, setData] = useState(null);
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [view, setView] = useState('transactions'); // transactions, subscriptions, forecast
    const [subscriptions, setSubscriptions] = useState([]);
    const [forecast, setForecast] = useState(null);
    const [balance, setBalance] = useState(1000); // Default balance for forecast
    const fileInputRef = useRef(null);
    const { startTask, endTask } = useAI();

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
                // Reset states
                setAnalysis('');
                setSubscriptions([]);
                setForecast(null);
            } else {
                alert("Error: " + result.message);
            }
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        }
    };

    const handleCategoryUpdate = async (transaction, newCategory) => {
        // Simple prompt for now, could be a modal
        // In a real app, drag-and-drop or dropdown would be better
        if (!newCategory) {
            newCategory = prompt(`Enter new category for "${transaction.description}":`, transaction.category);
        }
        if (!newCategory || newCategory === transaction.category) return;

        // 1. Update backend rule
        // We find a keyword from description - heuristic: take the first word or the whole description? 
        // Let's use the whole description for exact matching preference or ask user.
        // For simplicity: use the first meaningful word or just the description.
        // Let's rely on the user typing the keyword to map.
        // BETTER: The user wants to map "Netflix" -> "Entertainment". 
        // We can guess the keyword is the description itself if it's short, or ask.

        // Let's assume we map the specific description string to the category for now.
        // Or better, let the backend handle the rule logic, we just send "keyword" and "category".
        // I will assume the description IS the keyword to learn for future exactish matches.

        try {
            await fetch('/api/finance/category/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: transaction.description, category: newCategory })
            });
            // 2. Optimistic update locally? 
            // Parsing again is best but expensive. Let's just update local state.
            const newData = { ...data };
            newData.transactions = newData.transactions.map(t =>
                t.description === transaction.description ? { ...t, category: newCategory } : t
            );
            // Recalc totals (rough)
            const newTotals = {};
            newData.transactions.forEach(t => {
                newTotals[t.category] = (newTotals[t.category] || 0) + (t.amount);
            });
            newData.totals = newTotals;

            setData(newData);
        } catch (e) {
            console.error(e);
        }
    };

    const RequestAnalysis = async () => {
        if (!data || !data.totals) return;
        setIsAnalyzing(true);
        startTask("Analyzing Spending Habits", "Llama-3-Finance");
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
            endTask();
        }
    };

    const findSubscriptions = async () => {
        startTask("Hunting Subscriptions", "Pattern-Matcher");
        try {
            const res = await fetch('/api/finance/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions: data.transactions })
            });
            const result = await res.json();
            setSubscriptions(result.subscriptions);
        } catch (e) { console.error(e); }
        finally { endTask(); }
    };

    const calculateRunway = async () => {
        startTask("Forecasting Runway", "Llama-3-Finance");
        try {
            const res = await fetch('/api/finance/forecast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balance: balance, transactions: data.transactions })
            });
            const result = await res.json();
            setForecast(result);
        } catch (e) { console.error(e); }
        finally { endTask(); }
    };

    return (
        <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <header style={{ textAlign: 'center' }}>
                <h2 style={{ color: 'white', marginBottom: '5px' }}>Private Finance Analyst (CFO Mode)</h2>
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
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '20px' }}>
                    {/* Navigation */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setView('transactions')} className="btn-primary" style={{ background: view === 'transactions' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)' }}>📝 Transactions</button>
                        <button onClick={() => { setView('subscriptions'); findSubscriptions(); }} className="btn-primary" style={{ background: view === 'subscriptions' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)' }}>🔄 Subscriptions</button>
                        <button onClick={() => setView('forecast')} className="btn-primary" style={{ background: view === 'forecast' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)' }}>🔮 Forecasting</button>
                        <button className="btn-icon" onClick={() => setData(null)} title="Clear" style={{ marginLeft: 'auto' }}>🗑️</button>
                    </div>

                    {/* Views */}
                    {view === 'transactions' && (
                        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
                            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ textAlign: 'left', opacity: 0.7 }}>
                                            <tr>
                                                <th style={{ padding: '8px' }}>Date</th>
                                                <th style={{ padding: '8px' }}>Desc</th>
                                                <th style={{ padding: '8px' }}>Category (Click to fix)</th>
                                                <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.transactions.map((t, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '8px', opacity: 0.8 }}>{t.date}</td>
                                                    <td style={{ padding: '8px' }}>{t.description}</td>
                                                    <td style={{ padding: '8px', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                                                        onClick={() => handleCategoryUpdate(t)}
                                                        title="Click to change category">
                                                        {t.category}
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

                            {/* AI Side Panel */}
                            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="glass-panel" style={{ padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Thinking...</h4>
                                    {Object.entries(data.totals).map(([cat, amount]) => (
                                        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                            <span>{cat}</span>
                                            <span>{Math.abs(amount).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="glass-panel" style={{ flex: 1, padding: '15px', background: 'rgba(16, 185, 129, 0.1)' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>🤖 AI Analyst</h4>
                                    {!analysis && !isAnalyzing && <button className="btn-primary" style={{ fontSize: '0.8rem' }} onClick={RequestAnalysis}>Analyze Spending</button>}
                                    {analysis && <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{analysis}</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'subscriptions' && (
                        <div className="glass-panel" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h2>Subscription Hunter</h2>
                            <p style={{ opacity: 0.7 }}>Scanning for recurring monthly charges...</p>

                            {subscriptions.length === 0 && <div style={{ marginTop: '20px', opacity: 0.5 }}>No obvious subscriptions found yet.</div>}

                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '600px' }}>
                                {subscriptions.map((sub, i) => (
                                    <div key={i} style={{
                                        padding: '15px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '10px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <span>{sub}</span>
                                        <button className="btn-primary" style={{ background: '#ef4444', padding: '5px 15px', fontSize: '0.8rem' }}>Cancel?</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'forecast' && (
                        <div className="glass-panel" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                            <h2>Financial Casting</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label>Current Total Balance ($): </label>
                                <input
                                    className="input-field"
                                    type="number"
                                    value={balance}
                                    onChange={e => setBalance(e.target.value)}
                                    style={{ width: '150px' }}
                                />
                                <button className="btn-primary" onClick={calculateRunway}>Calculate Runway</button>
                            </div>

                            {forecast && (
                                <div style={{ marginTop: '30px', textAlign: 'center', animation: 'pulse 1s ease-in' }}>
                                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: forecast.days < 30 ? '#ef4444' : '#10b981' }}>
                                        {forecast.days === 9999 ? "∞" : forecast.days} Days
                                    </div>
                                    <div style={{ fontSize: '1.2rem', opacity: 0.7 }}>Runway Left</div>
                                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontStyle: 'italic' }}>
                                        "{forecast.commentary}"
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FinanceWorkflow;
