import React, { useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import OldHomePage from './components/OldHomePage';
import ValueChain from './components/ValueChain';
import BuildingBlocks from './components/BuildingBlocks';
import { mutuallyExclusiveHeaders } from './config';
import './App.css';

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

  // Navigation rendering
  if (page === 'home') {
    return <HomePage onOk={(selectedType) => {
      setPreselectedBusinessType(selectedType);
      goToOldHome();
    }} />;
  }

  if (page === 'oldHome') {
    return (
      <OldHomePage
        frames={frames}
        headers={headers}
        error={error}
        selected={selected}
        handleButtonClick={handleButtonClick}
        setShowValueChain={() => setPage('valueChain')}
        preselectedBusinessType={preselectedBusinessType}
      />
    );
  }

  if (page === 'valueChain') {
    // Provide a setter for ValueChain to update selected in App
    if (typeof window !== 'undefined') {
      window.setAppSelected = (frameIdx, btnIdx) => {
        setSelected(prev => ({ ...prev, [`${frameIdx}-${btnIdx}`]: true }));
      };
    }
    return (
      <ValueChain
        selected={selected}
        frames={frames}
        headers={headers}
        onBack={() => setPage('oldHome')}
        onNextPage={() => setPage('thirdPage')}
        preselectedBusinessType={preselectedBusinessType}
      />
    );
  }

  if (page === 'thirdPage') {
    // Find businessType from selected, fallback to preselectedBusinessType if not found
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
      <BuildingBlocks
        businessType={businessType}
        onNext={caps => { setSelectedCaps(caps); /* TODO: setPage('fourthPage') */ }}
      />
    );
  }

  // fallback
  return null;
}

export default App;
