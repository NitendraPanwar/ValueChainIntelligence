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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '8px 0 8px 0', gap: 24, ...(styleOverride || {}) }}>
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div style={{
            padding: '8px 18px',
            borderRadius: 20,
            background: idx === currentStep ? '#2563eb' : '#e0e7ef',
            color: idx === currentStep ? '#fff' : '#222',
            fontWeight: idx === currentStep ? 700 : 500,
            fontSize: 18,
            border: idx === currentStep ? '2px solid #2563eb' : '2px solid #e0e7ef',
            minWidth: 120,
            textAlign: 'center',
            transition: 'all 0.2s',
          }}>
            {step}
          </div>
          {idx < steps.length - 1 && (
            <span style={{ fontSize: 28, color: '#b6c2d6', fontWeight: 700 }}>&rarr;</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
