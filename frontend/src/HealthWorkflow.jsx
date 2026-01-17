import React, { useState, useRef, useEffect } from 'react';

function HealthWorkflow() {
    const [isLocked, setIsLocked] = useState(true);
    const [password, setPassword] = useState('');
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [chatResponse, setChatResponse] = useState('');
    const [mode, setMode] = useState('journal'); // 'journal' or 'chat'

    const handleUnlock = async () => {
        try {
            const res = await fetch('/api/health/journal/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setEntries(data.entries);
                setIsLocked(false);
            } else {
                alert("Unlock failed. Wrong password?");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddEntry = async () => {
        if (!newEntry.trim()) return;
        try {
            const res = await fetch('/api/health/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newEntry, password })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setEntries(prev => [...prev, data.entry]);
                setNewEntry('');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleChat = async () => {
        if (!chatMessage.trim()) return;
        setChatResponse("Thinking...");
        try {
            const res = await fetch('/api/health/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: chatMessage })
            });
            const data = await res.json();
            setChatResponse(data.response);
        } catch (e) {
            setChatResponse("Error connecting to therapist.");
        }
    };

    if (isLocked) {
        return (
            <div style={{ padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', color: 'white' }}>
                <div style={{ fontSize: '3rem' }}>🔒</div>
                <h2>Encrypted Health Journal</h2>
                <p>Enter your password to decrypt your journal entries.</p>
                <input
                    type="password"
                    className="input-field"
                    placeholder="Journal Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ textAlign: 'center', maxWidth: '300px' }}
                />
                <button className="btn-primary" onClick={handleUnlock}>Unlock</button>
                <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>First time? Any password creates a new key.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', gap: '20px', color: 'white' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Personal Health & Therapy</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setMode('journal')}
                        style={{ padding: '8px 15px', borderRadius: '15px', border: 'none', background: mode === 'journal' ? '#10b981' : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>
                        📖 Journal
                    </button>
                    <button
                        onClick={() => setMode('chat')}
                        style={{ padding: '8px 15px', borderRadius: '15px', border: 'none', background: mode === 'chat' ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>
                        🧠 Therapist
                    </button>
                    <button className="btn-icon" onClick={() => setIsLocked(true)} title="Lock">🔒</button>
                </div>
            </header>

            {mode === 'journal' ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '20px', overflow: 'hidden' }}>
                    {/* New Entry */}
                    <div className="glass-panel" style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                        <textarea
                            className="input-field"
                            placeholder="How are you feeling today?"
                            value={newEntry}
                            onChange={e => setNewEntry(e.target.value)}
                            style={{ flex: 1, minHeight: '60px', resize: 'none' }}
                        />
                        <button className="btn-primary" onClick={handleAddEntry}>Save</button>
                    </div>

                    {/* Feed */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
                        {entries.slice().reverse().map((entry) => (
                            <div key={entry.id} className="glass-panel" style={{ padding: '15px', background: 'rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', opacity: 0.7, fontSize: '0.8rem' }}>
                                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                                    <span style={{
                                        color: entry.mood === 'Positive' ? '#4ade80' : entry.mood === 'Negative' ? '#f87171' : '#fbbf24'
                                    }}>Mode: {entry.mood}</span>
                                </div>
                                <div>{entry.content}</div>
                            </div>
                        ))}
                        {entries.length === 0 && <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>No entries found. Start writing!</div>}
                    </div>
                </div>
            ) : (
                <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🧠</div>
                        {chatResponse ? (
                            <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '20px', borderRadius: '15px', maxWidth: '80%', lineHeight: '1.6' }}>
                                <strong>Therapist:</strong> {chatResponse}
                            </div>
                        ) : (
                            <div style={{ opacity: 0.5 }}>Tell me what's on your mind...</div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="I'm feeling anxious about..."
                            value={chatMessage}
                            onChange={e => setChatMessage(e.target.value)}
                        />
                        <button className="btn-primary" onClick={handleChat} style={{ background: '#8b5cf6' }}>Chat</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HealthWorkflow;
