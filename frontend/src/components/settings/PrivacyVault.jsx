import React from 'react';

const PrivacyVault = ({ privacyConfig, handlePrivacyChange, handleNuke }) => {
    return (
        <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>Privacy Vault</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* The Kill Switch */}
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '15px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#fca5a5', fontSize: '1.1rem' }}>⚠️ The Kill Switch</h4>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Instantly clears all active RAM, chat history, and context buffers.</div>
                    </div>
                    <button
                        onClick={handleNuke}
                        className="btn-primary"
                        style={{
                            background: '#dc2626',
                            border: '2px solid #ef4444',
                            padding: '10px 25px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            boxShadow: '0 0 15px rgba(220, 38, 38, 0.5)'
                        }}
                    >
                        ☢️ NUKE CONTEXT
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Left Col: Retention Policy */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px' }}>
                        <h4 style={{ margin: '0 0 20px 0', color: '#93c5fd' }}>Retention Policy</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>Auto-delete Finance Chats</div>
                                <select
                                    value={privacyConfig.retentionFinance}
                                    onChange={(e) => handlePrivacyChange('retentionFinance', e.target.value)}
                                    className="input-field"
                                    style={{ width: '100%', margin: 0 }}
                                >
                                    <option value="24h">After 24 Hours</option>
                                    <option value="7d">After 7 Days</option>
                                    <option value="never">Never</option>
                                </select>
                            </div>

                            <div>
                                <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>Auto-delete Health Journals</div>
                                <select
                                    value={privacyConfig.retentionHealth}
                                    onChange={(e) => handlePrivacyChange('retentionHealth', e.target.value)}
                                    className="input-field"
                                    style={{ width: '100%', margin: 0 }}
                                >
                                    <option value="never">Never (Default)</option>
                                    <option value="30d">After 30 Days</option>
                                    <option value="1y">After 1 Year</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: PII Redaction */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px' }}>
                        <h4 style={{ margin: '0 0 20px 0', color: '#a78bfa' }}>PII Redaction Levels</h4>

                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.9rem' }}>Auto-Redact Sensitivity</span>
                            <div
                                onClick={() => handlePrivacyChange('anonymizeLogs', !privacyConfig.anonymizeLogs)} // Using same toggle as Anonymize for now, conceptually linked
                                style={{ width: '40px', height: '20px', background: privacyConfig.anonymizeLogs ? '#a78bfa' : '#333', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                            >
                                <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: privacyConfig.anonymizeLogs ? '22px' : '2px', transition: 'left 0.3s' }}></div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div
                                onClick={() => handlePrivacyChange('redactLevel', 'high')}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: `1px solid ${privacyConfig.redactLevel === 'high' ? '#a78bfa' : 'transparent'}`,
                                    background: privacyConfig.redactLevel === 'high' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.05)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #a78bfa', background: privacyConfig.redactLevel === 'high' ? '#a78bfa' : 'transparent' }}></div>
                                    High Sensitivity
                                </div>
                                <div style={{ marginLeft: '22px', fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>Redacts Names, Locations, Dates, Money.</div>
                            </div>

                            <div
                                onClick={() => handlePrivacyChange('redactLevel', 'medium')}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: `1px solid ${privacyConfig.redactLevel === 'medium' ? '#a78bfa' : 'transparent'}`,
                                    background: privacyConfig.redactLevel === 'medium' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255,255,255,0.05)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #a78bfa', background: privacyConfig.redactLevel === 'medium' ? '#a78bfa' : 'transparent' }}></div>
                                    Medium Sensitivity
                                </div>
                                <div style={{ marginLeft: '22px', fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>Redacts Names, SSNs.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyVault;
