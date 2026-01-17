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

    // Smart Trigger: Check complexity with Lite model
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
          setMessages(prev => [...prev, { role: 'assistant', content: 'I notice this is a complex request. My standard model might struggle. I recommend upgrading to Pro Intelligence for deep reasoning.' }]);
          setInput('');
          return;
        }
      } catch (e) {
        console.warn("Complexity check failed, proceeding normally", e);
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
    fetch('/api/model/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'pro' })
    });
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h1 style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', margin: 0 }}>
          Local AI Assistant
        </h1>
        <div style={{
          background: currentModel === 'Pro' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.1)',
          padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentModel === 'Pro' ? '#fff' : '#fbbf24' }}></span>
          Current Model: <strong>{currentModel}</strong>
        </div>
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

      <div className="input-area glass-panel" style={{ padding: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="btn-icon" title="Upload Document (Coming in Phase 3)" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer', opacity: 0.5 }}>
          📎
        </button>
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
