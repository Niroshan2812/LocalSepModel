import React, { useState, useEffect, useRef } from 'react';
import UpgradeModal from './UpgradeModal';
import { useAI } from './AIContext';

function LegalWorkflow() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Legal & Bureaucracy Assistant. Upload a contract or ask me legal questions.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [currentModel, setCurrentModel] = useState('Lite');
    const messagesEndRef = useRef(null);
    const [extractedText, setExtractedText] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [profile, setProfile] = useState({ name: 'Jane Doe', address: '123 Main St, Springfield', phone: '555-0199', email: 'jane@example.com' });
    const [uploadedFile, setUploadedFile] = useState(null);
    const [docMetadata, setDocMetadata] = useState(null);
    const fileInputRef = useRef(null);
    const { startTask, endTask } = useAI();
    // ... existing useEffects ...

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setMessages(prev => [...prev, { role: 'assistant', content: `Indexing ${file.name}...` }]);
        startTask(`Indexing ${file.name}`, "OCR-Engine");

        try {
            const res = await fetch('/api/docs/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.status === 'success') {
                setUploadedFile(file.name);
                setDocMetadata(data.metadata);
                if (data.metadata.extracted_text) {
                    setExtractedText(data.metadata.extracted_text);
                }
                setMessages(prev => [...prev, { role: 'assistant', content: `Document processed! I've read ${data.metadata.page_count} pages.` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: `Failed to index document: ${data.message}` }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error uploading document.' }]);
        } finally {
            endTask();
        }
    };

    const handleSanitize = async () => {
        if (!extractedText) return alert("Upload a document first.");
        startTask("Redacting PII...", "Privacy-Shield");
        try {
            const res = await fetch('/api/legal/sanitize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: extractedText })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: `**Sanitization Report:**\nFound: ${data.foundTypes.join(', ')}\n\nPreview:\n${data.redactedText.substring(0, 200)}...` }]);
        } catch (e) {
            console.error(e);
        } finally { endTask(); }
    };

    const handleAnalyzeRisks = async () => {
        if (!extractedText) return alert("Upload a document first.");
        startTask("Analyzing Legal Risks...", "Mistral-Legal");
        try {
            const res = await fetch('/api/legal/risks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: extractedText })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: `**⚠️ Risk Assessment (ELI5):**\n${data.risks}` }]);
        } catch (e) {
            console.error(e);
        } finally { endTask(); }
    };

    const handleAutoFill = async () => {
        if (!extractedText) return alert("Upload a form first.");
        startTask("Auto-Filling Form...", "Form-Filler-Bot");
        try {
            const res = await fetch('/api/legal/fill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: JSON.stringify(profile),
                    formText: extractedText
                })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: `**📝 Suggested Form Values:**\n${data.suggestions}` }]);
        } catch (e) {
            console.error(e);
        } finally { endTask(); }
    };

    // ... handleSend, handleKeyPress ...
    const handleSend = async () => {
        if (!input.trim()) return;
        // ... complexity check ...
        if (currentModel === 'Lite') {
            try {
                const checkRes = await fetch('/api/chat/complexity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: input })
                });
                const checkData = await checkRes.json();

                if (checkData.isComplex) {
                    setShowUpgrade(true);
                    setMessages(prev => [...prev, { role: 'user', content: input }]);
                    setMessages(prev => [...prev, { role: 'assistant', content: 'This legal/contract analysis implies complexity. I recommend the Pro Model.' }]);
                    setInput('');
                    return;
                }
            } catch (e) {
                console.warn("Complexity check failed", e);
            }
        }

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        startTask("Analyzing Query...", currentModel === 'Lite' ? "Qwen-Lite" : "Mistral-7B");

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content })
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]);
        } finally {
            setIsLoading(false);
            endTask();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleUpgradeComplete = () => {
        setCurrentModel("Pro");
        fetch('/api/model/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'pro' })
        });
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' }}>
            <header style={{ marginBottom: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ color: 'white' }}>Legal & Bureaucracy</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowProfile(!showProfile)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '15px', cursor: 'pointer' }}>
                        👤 My Profile
                    </button>
                    <div style={{
                        background: currentModel === 'Pro' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.1)',
                        padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentModel === 'Pro' ? '#fff' : '#fbbf24' }}></span>
                        Model: <strong>{currentModel}</strong>
                    </div>
                </div>
            </header>

            {showProfile && (
                <div className="glass-panel" style={{ padding: '15px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4>👤 Auto-Fill Profile</h4>
                    <input className="input-field" placeholder="Full Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                    <input className="input-field" placeholder="Address" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} />
                    <input className="input-field" placeholder="Phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                    <input className="input-field" placeholder="Email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                </div>
            )}

            {/* Metadata Card (Lite Task) */}
            {docMetadata && (
                <div className="glass-panel" style={{ padding: '15px', marginBottom: '20px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#93c5fd' }}>📄 {docMetadata.title || uploadedFile}</h4>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                <span>By: {docMetadata.author}</span> • <span>{docMetadata.page_count} Pages</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.3)', padding: '5px 10px', borderRadius: '5px' }}>
                            Synced
                        </div>
                    </div>
                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#ef4444' }} onClick={handleSanitize}>🛡️ Sanitize PII</button>
                        <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#faa916' }} onClick={handleAnalyzeRisks}>⚠️ Explain Risks</button>
                        <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#3b82f6' }} onClick={handleAutoFill}>📝 Auto-Fill Form</button>
                    </div>
                </div>
            )}

            {showUpgrade && (
                <UpgradeModal
                    onClose={() => setShowUpgrade(false)}
                    onUpgradeComplete={handleUpgradeComplete}
                />
            )}

            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '20px' }}>
                <div className="messages-area" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '90%'
                        }}>
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: msg.role === 'user' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                lineHeight: '1.5',
                                borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                                borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div style={{ opacity: 0.7 }}>Thinking...</div>}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="input-area glass-panel" style={{ padding: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept=".pdf" />
                <button
                    className="btn-icon"
                    title="Upload Contract/PDF"
                    onClick={() => fileInputRef.current.click()}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    📎
                </button>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Ask a legal question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                />
                <button onClick={handleSend} className="btn-primary" disabled={isLoading}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default LegalWorkflow;
