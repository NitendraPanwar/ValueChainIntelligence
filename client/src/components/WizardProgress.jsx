import React from 'react';

const steps = [
  'Business Complexity',
  'Value Chain',
  'Business Capabilities',
  'Capability Assessment',
  'Value Chain Ready'
];

export default function WizardProgress({ currentStep, styleOverride }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0 8px 0', ...(styleOverride || {}) }}>
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: idx <= currentStep ? '#2563eb' : '#e0e7ef',
              color: idx <= currentStep ? '#fff' : '#222',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 18, border: '2px solid #2563eb', marginBottom: 6
            }}>
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            <div style={{ textAlign: 'center', fontSize: 14, color: idx === currentStep ? '#2563eb' : '#888', fontWeight: idx === currentStep ? 700 : 400 }}>
              {step}
            </div>
          </div>
          {idx < steps.length - 1 && (
            <div style={{
              flex: 1, height: 4,
              background: idx < currentStep ? '#2563eb' : '#e0e7ef',
              margin: '0 8px', borderRadius: 2
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
