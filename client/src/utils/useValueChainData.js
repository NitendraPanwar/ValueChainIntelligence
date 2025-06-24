import { useState, useEffect } from 'react';
import { getBusinessCapabilitiesFromMongo } from './mongoApi';

export function useValueChainData(valueChainName, businessType) {
  const [frames, setFrames] = useState([]); // [{ name, description }]
  const [capabilitiesByFrame, setCapabilitiesByFrame] = useState({}); // { frameName: [capObj, ...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!valueChainName || !businessType) {
      setFrames([]);
      setCapabilitiesByFrame({});
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    // Support array of valueChainNames
    const valueChainNames = Array.isArray(valueChainName) ? valueChainName : [valueChainName];
    Promise.all(
      valueChainNames.map(name => getBusinessCapabilitiesFromMongo(name, businessType))
    )
      .then(results => {
        // Flatten and group by Value Chain Stage (frame)
        const allRows = results.flat();
        const framesMap = {};
        allRows.forEach(row => {
          const frameName = row.valueChainStage || '';
          if (!framesMap[frameName]) framesMap[frameName] = [];
          framesMap[frameName].push({ name: row.capabilityName, description: row.description, shortDescription: row.shortDescription });
        });
        setFrames(Object.keys(framesMap).map(name => ({ name, description: '' })));
        setCapabilitiesByFrame(framesMap);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load capabilities from MongoDB.');
        setLoading(false);
      });
  }, [valueChainName, businessType]);

  return { frames, capabilitiesByFrame, loading, error };
}
