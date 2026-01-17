import React from 'react';

function FinanceWorkflow() {
    return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
            <h2>Private Finance Analyst</h2>
            <p style={{ opacity: 0.7, marginBottom: '30px' }}>Analyze your spending privately. No cloud.</p>

            <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '3rem', opacity: 0.5 }}>📊</div>
                <p>Drop your CSV or Excel file here</p>
                <button className="btn-primary" disabled style={{ opacity: 0.5 }}>Upload Statements (Coming Soon)</button>
            </div>
        </div>
    );
}

export default FinanceWorkflow;
