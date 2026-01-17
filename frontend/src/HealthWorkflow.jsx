import React from 'react';

function HealthWorkflow() {
    return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
            <h2>Personal Health Journal</h2>
            <p style={{ opacity: 0.7, marginBottom: '30px' }}>Secure, Encrypted, Private.</p>

            <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '3rem', opacity: 0.5 }}>🔒</div>
                <p>Your journal is encrypted with AES-256.</p>
                <button className="btn-primary" disabled style={{ opacity: 0.5 }}>Unlock Journal (Coming Soon)</button>
            </div>
        </div>
    );
}

export default HealthWorkflow;
