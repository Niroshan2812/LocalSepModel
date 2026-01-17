import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import UpgradeModal from './UpgradeModal';

function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your privacy-focused AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentModel, setCurrentModel] = useState('Lite');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Check initial status
    fetch('/api/upgrade/status')
      .then(res => res.json())
      .then(data => {
        if (data.currentModel.includes("mistral") || data.currentModel.includes("llama")) {
          setCurrentModel("Pro");
        }
      })
      .catch(e => console.error(e));
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Trigger Pro upgrade if user asks deeply complex questions (simulation)
    if (input.toLowerCase().includes("deep analysis") || input.toLowerCase().includes("contract")) {
      if (currentModel === 'Lite') {
        setShowUpgrade(true);
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setMessages(prev => [...prev, { role: 'assistant', content: 'This request requires the Pro model. Please upgrade to continue.' }]);
        setInput('');
        return;
      }
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the local engine.' }]);
    } finally {
      setIsLoading(false);
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
    // Actually switch model on backend
    fetch('/api/model/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'pro' })
    });
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '20px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, fontSize: '0.8rem', opacity: 0.8, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
          Current Model: <strong>{currentModel}</strong>
        </div>
        <h1 style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem' }}>
          Local AI Assistant
        </h1>
        <p style={{ opacity: 0.7 }}>Privacy-First. Local-First.</p>
      </header>

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
              maxWidth: '80%'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: msg.role === 'user' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                lineHeight: '1.5',
                borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '2px' : '12px',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', padding: '12px', opacity: 0.7 }}>
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-area glass-panel" style={{ padding: '10px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Type your message..."
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

export default App;
