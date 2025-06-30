import React from 'react';
import WizardProgress from './WizardProgress';

export default function ValueChainReady({ goToHome }) {
  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '16px 0 8px 0',
        textAlign: 'right',
      }}>
        <h1 style={{ margin: 0, fontSize: '2em' }}>Value Chain Intelligence</h1>
        <h2 style={{ margin: 0, fontSize: '1.1em', fontWeight: 400 }}>Powered by Beyond Axis</h2>
      </div>
      <div style={{ height: 90 }} />
      <WizardProgress currentStep={4} styleOverride={{ margin: '0' }} />
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <h2>Value Chain Ready!</h2>
        <p>Your value chain has been successfully saved and assessed.</p>
      </div>
      <button
        style={{
          position: 'fixed',
          bottom: 32,
          right: 48,
          padding: '14px 36px',
          fontSize: '1.15em',
          fontWeight: 700,
          borderRadius: 8,
          background: '#1890ff',
          color: '#fff',
          border: 'none',
          boxShadow: '0 2px 8px rgba(24,144,255,0.13)',
          cursor: 'pointer',
          zIndex: 5000
        }}
        onClick={goToHome}
      >
        Home Page
      </button>
    </>
  );
}
