import React, { useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import BusinessComplexity from './components/BusinessComplexity';
import ValueChain from './components/ValueChain';
import BusinessCapabilities from './components/BusinessCapabilities';
import WizardProgress from './components/WizardProgress';
import WizardProgressPrototypes from './components/WizardProgressPrototypes';
import StrategicInitiativePage from './components/StrategicInitiativePage';
import SelectedCapabilitiesPage from './components/SelectedCapabilitiesPage';
import LoadDataPage from './components/LoadDataPage';
import ReadDataPage from './components/ReadDataPage';
import { mutuallyExclusiveHeaders } from './config';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getHomepageIndustriesFromMongo, getHomepageBusinessComplexityFromMongo } from './utils/mongoApi';
import { getValueChainsByEntryId } from './utils/api.valuechains';

function App() {
  // Use a single page state for clarity
  const [page, setPage] = useState('home'); // 'home', 'oldHome', 'valueChain', 'businessCapabilities'
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
  const [businessComplexityOptions, setBusinessComplexityOptions] = useState([]);
  const [entryId, setEntryId] = useState(null);
  const [valueChainIds, setValueChainIds] = useState([]);
  const [valueChainNames, setValueChainNames] = useState([]);

  // Navigation helpers
  const goToHome = () => setPage('home');
  const goToOldHome = () => setPage('oldHome');
  const goToValueChain = () => setPage('valueChain');
  const goToBusinessCapabilities = () => setPage('businessCapabilities');

  useEffect(() => {
    if (page !== 'oldHome') return;
    // Fetch headers and frames from MongoDB Homepage sheet
    getHomepageIndustriesFromMongo().then(types => {
      // We'll need to fetch the full Homepage sheet from MongoDB to get headers and frames
      getHomepageBusinessComplexityFromMongo().then(bcOptions => {
        setBusinessComplexityOptions(bcOptions);
      });
      // Fetch the full Homepage sheet from MongoDB
      fetch('/api/mongo/read?sheetName=Homepage')
        .then(res => res.json())
        .then(json => {
          if (!json.success || !Array.isArray(json.data) || json.data.length === 0) return;
          // Remove id/_id columns from headers
          const headersRaw = Object.keys(json.data[0]);
          const headers = headersRaw.filter(h => h.trim().toLowerCase() !== '_id' && h.trim().toLowerCase() !== 'id');
          setHeaders(headers);
          // Build frames: for each header, collect all unique values (excluding empty and id/_id)
          const framesArr = headers.map(h => {
            const vals = json.data.map(row => row[h]).filter(v => v && v.toString().trim() !== '' && v.toString().trim().toLowerCase() !== '_id' && v.toString().trim().toLowerCase() !== 'id');
            // Only unique values
            return [...new Set(vals)];
          });
          setFrames(framesArr);
          setError('');
        });
    });
  }, [page]);

  useEffect(() => {
    // Fetch business complexity options from MongoDB when page is oldHome
    if (page === 'oldHome') {
      getHomepageBusinessComplexityFromMongo().then(setBusinessComplexityOptions);
    }
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

  // Handler to set valueChainName in userFlow
  const handleSetValueChainName = (valueChainName) => {
    setUserFlow(prev => ({ ...prev, valueChainName }));
  };

  useEffect(() => {
    // Fetch value chains for the selected entry when entering businessCapabilities page
    if (page === 'businessCapabilities' && entryId) {
      getValueChainsByEntryId(entryId)
        .then((chains) => {
          if (Array.isArray(chains)) {
            setValueChainIds(chains.map(vc => vc._id));
            setValueChainNames(chains.map(vc => vc.Name || vc.name));
          } else if (chains && typeof chains === 'object') {
            // In case API returns a single object
            setValueChainIds([chains._id]);
            setValueChainNames([chains.Name || chains.name]);
          } else {
            setValueChainIds([]);
            setValueChainNames([]);
          }
        })
        .catch(() => {
          setValueChainIds([]);
          setValueChainNames([]);
        });
    }
  }, [page, entryId]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/prototype" element={<WizardProgressPrototypes />} />
        <Route path="/strategic-initiative/selected-capabilities" element={<SelectedCapabilitiesPage />} />
        <Route path="/load-data" element={<LoadDataPage />} />
        <Route path="/Read-Data" element={<ReadDataPage />} />
        <Route path="*" element={
          (() => {
            if (page === 'home') {
              return <HomePage onOk={(selectedType, name, label, directToBlocks, entryId) => {
                setUserFlow({ name, businessType: selectedType, label, valueChainName: name });
                setPreselectedBusinessType(selectedType);
                setWizardStep(0);
                if (entryId) setEntryId(entryId); // <-- set entryId if provided
                if (label === 'Strategic Initiative' && directToBlocks) {
                  setPage('strategicInitiative');
                } else if (directToBlocks) {
                  setTimeout(() => setPage('businessCapabilities'), 0);
                } else {
                  goToOldHome();
                }
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
                    setShowValueChain={(_id) => { setEntryId(_id); setPage('valueChain'); setWizardStep(1); }}
                    preselectedBusinessType={preselectedBusinessType}
                    userFlow={userFlow}
                    businessComplexityOptions={businessComplexityOptions}
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
                    onNextPage={() => { setPage('businessCapabilities'); setWizardStep(2); }}
                    preselectedBusinessType={preselectedBusinessType}
                    userFlow={userFlow}
                    onSetValueChainName={handleSetValueChainName}
                    entryId={entryId}
                    entryName={userFlow.name}
                  />
                </>
              );
            }
            if (page === 'businessCapabilities') {
              let businessType = '';
              Object.keys(selected).forEach(key => {
                if (selected[key]) {
                  const [frameIdx, btnIdx] = key.split('-').map(Number);
                  if (headers[frameIdx] && headers[frameIdx].trim().toLowerCase() === 'industry') {
                    businessType = frames[frameIdx]?.[btnIdx] || '';
                  }
                }
              });
              // Always use preselectedBusinessType if available
              if (preselectedBusinessType) {
                businessType = preselectedBusinessType;
              }
              // Pass valueChainIds and valueChainNames arrays to BusinessCapabilities
              return (
                <>
                  <div style={{ height: 90 }} />
                  <WizardProgress currentStep={wizardStep} styleOverride={{ margin: '0' }} />
                  <BusinessCapabilities
                    businessType={businessType}
                    onNext={() => {
                      setWizardStep(4);
                      setPage('ready');
                    }}
                    userFlow={userFlow}
                    entryId={entryId}
                    valueChainIds={valueChainIds}
                    valueChainNames={valueChainNames}
                    valueChainEntryId={entryId}
                    valueChainEntryName={userFlow.name}
                    wizardStep={wizardStep}
                    setWizardStep={setWizardStep}
                  />
                </>
              );
            }
            if (page === 'assessment') {
              return (
                <>
                  <div style={{ height: 90 }} />
                  <WizardProgress currentStep={3} styleOverride={{ margin: '0' }} />
                  <BusinessCapabilities
                    businessType={preselectedBusinessType}
                    onNext={() => { setWizardStep(4); setPage('ready'); }}
                    onBack={() => {
                      setWizardStep(2);
                      setPage('businessCapabilities');
                    }}
                    userFlow={userFlow}
                    filterMaturityOnly={true}
                    entryId={entryId}
                    valueChainId={entryId} // <-- Pass valueChainId explicitly
                  />
                </>
              );
            }
            if (page === 'ready') {
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
                </>
              );
            }
            if (page === 'strategicInitiative') {
              // Removed debug log for page render
              return <StrategicInitiativePage valueChain={userFlow.name} businessType={userFlow.businessType} label={userFlow.label} />;
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
