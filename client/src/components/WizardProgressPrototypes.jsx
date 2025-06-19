import React, { useState } from 'react';

const steps = [
  'Business Complexity',
  'Value Chain',
  'Business Capabilities',
  'Capability Assessment',
  'Value Chain Ready'
];

function StepCircles({ currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: idx <= currentStep ? '#2563eb' : '#e0e7ef',
            color: idx <= currentStep ? '#fff' : '#222',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 18, border: '2px solid #2563eb'
          }}>
            {idx < currentStep ? '✓' : idx + 1}
          </div>
          <div style={{ minWidth: 80, textAlign: 'center', fontSize: 14, color: idx === currentStep ? '#2563eb' : '#888' }}>
            {step}
          </div>
          {idx < steps.length - 1 && (
            <div style={{
              flex: 1, height: 4,
              background: idx < currentStep ? '#2563eb' : '#e0e7ef',
              margin: '0 8px'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ProgressBar({ currentStep }) {
  return (
    <div style={{ width: '100%', margin: '24px 0' }}>
      <div style={{ position: 'relative', height: 8, background: '#e0e7ef', borderRadius: 4 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: 8, borderRadius: 4,
          width: `${(currentStep) / (steps.length - 1) * 100}%`, background: '#2563eb', transition: 'width 0.3s'
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {steps.map((step, idx) => (
          <div key={step} style={{ color: idx === currentStep ? '#2563eb' : '#888', fontWeight: idx === currentStep ? 700 : 400 }}>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function MinimalDots({ currentStep }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '24px 0', gap: 16 }}>
      {steps.map((step, idx) => (
        <div key={step} style={{
          width: idx === currentStep ? 18 : 12,
          height: idx === currentStep ? 18 : 12,
          borderRadius: '50%',
          background: idx === currentStep ? '#2563eb' : '#e0e7ef',
          border: idx === currentStep ? '2px solid #2563eb' : '2px solid #e0e7ef',
          transition: 'all 0.2s'
        }} />
      ))}
    </div>
  );
}

export default function WizardProgressPrototypes() {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 32, background: '#f9f9fb', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <h2>Wizard Progress Prototypes</h2>
      <div style={{ marginBottom: 32 }}>
        <label>Current Step: </label>
        <input type="range" min={0} max={steps.length - 1} value={currentStep} onChange={e => setCurrentStep(Number(e.target.value))} />
        <span style={{ marginLeft: 12 }}>{steps[currentStep]}</span>
      </div>
      <h3>1. Step Circles with Numbers</h3>
      <StepCircles currentStep={currentStep} />
      <h3>2. Horizontal Progress Bar</h3>
      <ProgressBar currentStep={currentStep} />
      <h3>3. Minimalist Dots</h3>
      <MinimalDots currentStep={currentStep} />
    </div>
  );
}
