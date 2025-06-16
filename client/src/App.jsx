import React, { useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import BusinessComplexity from './components/BusinessComplexity';
import ValueChain from './components/ValueChain';
import BuildingBlocks from './components/BuildingBlocks';
import WizardProgress from './components/WizardProgress';
import WizardProgressPrototypes from './components/WizardProgressPrototypes';
import { mutuallyExclusiveHeaders } from './config';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  // Use a single page state for clarity
  const [page, setPage] = useState('home'); // 'home', 'oldHome', 'valueChain', 'thirdPage'
  const [frames, setFrames] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState({});
  const [vcName, setVcName] = useState([]);
  const [capabilitiesByFrame, setCapabilitiesByFrame] = useState({});
  const [capMaturity, setCapMaturity] = useState({});
  const [selectedCaps, setSelectedCaps] = useState([]);
  const [preselectedBusinessType, setPreselectedBusinessType] = useState('');
  const [wizardStep, setWizardStep] = useState(0); // 0: Business Complexity, 1: Value Chain, 2: Business Capabilities, 3: Capability Assessment, 4: Value Chain Ready
  const [userFlow, setUserFlow] = useState({ name: '', businessType: '', label: '' });

  // Navigation helpers
  const goToHome = () => setPage('home');
  const goToOldHome = () => setPage('oldHome');
  const goToValueChain = () => setPage('valueChain');
  const goToThirdPage = () => setPage('thirdPage');

  useEffect(() => {
    if (page !== 'oldHome') return;
    fetch('/VC_Capability_Master.xlsx')
      .then((res) => res.arrayBuffer())
      .then((data) => {
        import('xlsx').then(XLSX => {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets['Homepage'];
          if (!sheet) {
            setError('Homepage sheet not found.');
            return;
          }
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const columns = json[0]?.length || 0;
          const headers = json[0] || [];
          const framesArr = [];
          for (let col = 0; col < columns; col++) {
            const frame = [];
            for (let row = 1; row < json.length; row++) {
              if (json[row][col]) frame.push(json[row][col]);
            }
            framesArr.push(frame);
          }
          setFrames(framesArr);
          setHeaders(headers);
          setError('');
        });
      })
      .catch(() => setError('Failed to load Excel file.'));
  }, [page]);

  const handleButtonClick = (frameIdx, btnIdx) => {
    const key = `${frameIdx}-${btnIdx}`;
    const isMutuallyExclusive = mutuallyExclusiveHeaders.some(header =>
      headers[frameIdx] && headers[frameIdx].trim().toLowerCase() === header.trim().toLowerCase()
    );
    if (isMutuallyExclusive) {
      setSelected((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach(k => {
          if (k.startsWith(`${frameIdx}-`)) {
            delete updated[k];
          }
        });
        if (!prev[key]) {
          updated[key] = true;
        }
        return updated;
      });
    } else {
      setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/prototype" element={<WizardProgressPrototypes />} />
        <Route path="*" element={
          (() => {
            if (page === 'home') {
              return <HomePage onOk={(selectedType, name, label) => {
                setUserFlow({ name, businessType: selectedType, label });
                setPreselectedBusinessType(selectedType);
                setWizardStep(0);
                goToOldHome();
              }} />;
            }
            if (page === 'oldHome') {
              return (
                <>
                  {/* Spacer for fixed header to prevent overlap */}
                  <div style={{ height: 90 }} />
                  <WizardProgress currentStep={0} styleOverride={{ margin: '0' }} />
                  <BusinessComplexity
                    frames={frames}
                    headers={headers}
                    error={error}
                    selected={selected}
                    handleButtonClick={handleButtonClick}
                    setShowValueChain={() => { setPage('valueChain'); setWizardStep(1); }}
                    preselectedBusinessType={preselectedBusinessType}
                    userFlow={userFlow}
                  />
                </>
              );
            }
            if (page === 'valueChain') {
              if (typeof window !== 'undefined') {
                window.setAppSelected = (frameIdx, btnIdx) => {
                  setSelected(prev => ({ ...prev, [`${frameIdx}-${btnIdx}`]: true }));
                };
              }
              return (
                <>
                  <div style={{ height: 90 }} />
                  <WizardProgress currentStep={1} styleOverride={{ margin: '0' }} />
                  <ValueChain
                    selected={selected}
                    frames={frames}
                    headers={headers}
                    onBack={() => { setPage('oldHome'); setWizardStep(0); }}
                    onNextPage={() => { setPage('thirdPage'); setWizardStep(2); }}
                    preselectedBusinessType={preselectedBusinessType}
                    userFlow={userFlow}
                  />
                </>
              );
            }
            if (page === 'thirdPage') {
              let businessType = '';
              Object.keys(selected).forEach(key => {
                if (selected[key]) {
                  const [frameIdx, btnIdx] = key.split('-').map(Number);
                  if (headers[frameIdx] && headers[frameIdx].trim().toLowerCase() === 'business type') {
                    businessType = frames[frameIdx]?.[btnIdx] || '';
                  }
                }
              });
              if (!businessType && preselectedBusinessType) {
                businessType = preselectedBusinessType;
              }
              return (
                <>
                  <div style={{ height: 90 }} />
                  <WizardProgress currentStep={2} styleOverride={{ margin: '0' }} />
                  <BuildingBlocks
                    businessType={businessType}
                    onNext={() => { setWizardStep(3); setPage('assessment'); }}
                    userFlow={userFlow}
                  />
                </>
              );
            }
            if (page === 'assessment') {
              return (
                <>
                  <div style={{ height: 90 }} />
                  <WizardProgress currentStep={3} styleOverride={{ margin: '0' }} />
                  <BuildingBlocks
                    businessType={preselectedBusinessType}
                    onNext={() => { setWizardStep(4); setPage('ready'); }}
                    userFlow={userFlow}
                  />
                </>
              );
            }
            if (page === 'ready') {
              return (
                <>
                  <div style={{ height: 90 }} />
                  <WizardProgress currentStep={4} styleOverride={{ margin: '0' }} />
                  <div style={{ textAlign: 'center', marginTop: 80 }}>
                    <h2>Value Chain Ready!</h2>
                    <p>Your value chain has been successfully saved and assessed.</p>
                  </div>
                </>
              );
            }
            // fallback
            return null;
          })()
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
