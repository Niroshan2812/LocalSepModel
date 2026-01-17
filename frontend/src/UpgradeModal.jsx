import React, { useState, useEffect } from 'react';
import './index.css';

function UpgradeModal({ onClose, onUpgradeComplete }) {
    const [status, setStatus] = useState({ proAvailable: false, downloading: false });
    const [downloadStarted, setDownloadStarted] = useState(false);
    const [progress, setProgress] = useState(0); // Fake progress for demo since backend just streams to log right now
    const [pollingId, setPollingId] = useState(null);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 2000);
        setPollingId(interval);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/upgrade/status');
            const data = await res.json();
            setStatus(data);
            if (data.downloading) {
                setDownloadStarted(true);
                // Simulate progress for UI feedback since we don't have a byte-level stream API exposed yet
                setProgress(prev => (prev < 90 ? prev + 5 : prev));
            } else if (data.proAvailable && downloadStarted) {
                setProgress(100);
                setTimeout(() => {
                    onUpgradeComplete();
                    onClose();
                }, 1000);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleStartUpgrade = async () => {
        setDownloadStarted(true);
        setProgress(5);
        await fetch('/api/upgrade/start', { method: 'POST' });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="glass-panel" style={{ padding: '30px', width: '400px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '15px' }}>Upgrade to Pro Intelligence</h2>
                <p style={{ marginBottom: '20px', color: '#cbd5e1' }}>
                    Unlocks deep reasoning (Mistral 7B). <br />
                    Download size: ~4.5 GB.
                </p>

                {downloadStarted ? (
                    <div>
                        <div style={{
                            background: 'rgba(255,255,255,0.1)', borderRadius: '10px',
                            height: '10px', width: '100%', overflow: 'hidden', marginBottom: '10px'
                        }}>
                            <div style={{
                                background: 'var(--secondary-gradient)', height: '100%',
                                width: `${progress}%`, transition: 'width 0.5s ease'
                            }}></div>
                        </div>
                        <p>Downloading... {status.downloading ? '(In Progress)' : ''}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button className="btn-primary" onClick={handleStartUpgrade}>
                            Download Now
                        </button>
                        <button style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                        }} onClick={onClose}>
                            Later
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UpgradeModal;
