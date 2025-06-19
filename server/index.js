const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, 'submissions.json');

app.use(cors());
app.use(express.json());

// Save submission
app.post('/api/save', (req, res) => {
  console.log('Received submission:', JSON.stringify(req.body, null, 2));
  const { name, businessType, label, businessComplexity, annualRevenues } = req.body;
  if (!name || !businessType) {
    return res.status(400).json({ error: 'Name and businessType are required.' });
  }
  let submissions = [];
  if (fs.existsSync(DATA_FILE)) {
    submissions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
  // Check for duplicate
  const exists = submissions.some(
    s => s.name === name && s.businessType === businessType && s.label === label
  );
  if (!exists) {
    submissions.push({
      name,
      businessType,
      label,
      timestamp: new Date().toISOString(),
      "Business Complexity": businessComplexity,
      "Annual Revenues (US$)": annualRevenues,
      ValueChain: [] // Initialize as empty array
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
    return res.json({ success: true, message: 'Saved.' });
  } else {
    // If duplicate, update the existing entry with new values
    submissions = submissions.map(s => {
      if (s.name === name && s.businessType === businessType && s.label === label) {
        const updated = { ...s };
        if (businessComplexity !== undefined) updated["Business Complexity"] = businessComplexity;
        if (annualRevenues !== undefined) updated["Annual Revenues (US$)"] = annualRevenues;
        if (req.body.ValueChain !== undefined) {
          updated["ValueChain"] = req.body.ValueChain;
          console.log('Saving ValueChain:', JSON.stringify(req.body.ValueChain, null, 2));
        }
        updated.timestamp = new Date().toISOString();
        return updated;
      }
      return s;
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
    return res.json({ success: true, message: 'Updated.' });
  }
});

// Save capability maturity assessment as nested Capability array within ValueChain
app.post('/api/saveCapabilityAssessment', (req, res) => {
  console.log('Received capability assessment:', JSON.stringify(req.body, null, 2));
  const { name, businessType, label, valueChainName, capabilityName, assessment } = req.body;
  if (!name || !businessType || !valueChainName || !capabilityName || !assessment) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  let submissions = [];
  if (fs.existsSync(DATA_FILE)) {
    submissions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
  // Find the correct submission
  const idx = submissions.findIndex(
    s => s.name === name && s.businessType === businessType && s.label === label
  );
  if (idx === -1) {
    return res.status(404).json({ error: 'Submission not found.' });
  }
  const submission = submissions[idx];
  if (!submission.ValueChain) submission.ValueChain = [];
  // Find the correct ValueChain entry
  let vc = submission.ValueChain.find(vc => vc.Name === valueChainName);
  if (!vc) {
    // If not found, create it
    vc = { Name: valueChainName, Capability: [] };
    submission.ValueChain.push(vc);
  }
  if (!vc.Capability) vc.Capability = [];
  // Find or add the capability
  const capIdx = vc.Capability.findIndex(c => c.Name === capabilityName);
  const capabilityObj = { Name: capabilityName, ...assessment };
  if (capIdx === -1) {
    vc.Capability.push(capabilityObj);
  } else {
    vc.Capability[capIdx] = capabilityObj;
  }
  submission.timestamp = new Date().toISOString();
  submissions[idx] = submission;
  fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
  return res.json({ success: true, message: 'Capability assessment saved.' });
});

// Save initiative (Strategic Initiative flow)
app.post('/api/save-initiative', (req, res) => {
  console.log('[Initiative] Received:', JSON.stringify(req.body, null, 2));
  const { initiativeName, initiativeOwner, initiativeScope, initiativeFunction, valueChainEntryName, label, selectedSuggestions } = req.body;
  if (!initiativeName || !initiativeOwner || !initiativeScope || !initiativeFunction || !valueChainEntryName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  let submissions = [];
  if (fs.existsSync(DATA_FILE)) {
    submissions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }
  // Check for existing initiative by initiativeName and valueChainEntryName
  const idx = submissions.findIndex(s => s.initiativeName === initiativeName && s.valueChainEntryName === valueChainEntryName);
  if (idx !== -1) {
    // Update existing
    submissions[idx] = {
      ...submissions[idx],
      initiativeOwner,
      initiativeScope,
      initiativeFunction,
      label: label || 'Strategic Initiative',
      timestamp: new Date().toISOString(),
      selectedSuggestions: selectedSuggestions || submissions[idx].selectedSuggestions || []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
    return res.json({ success: true, message: 'Initiative updated.' });
  } else {
    // Add new
    submissions.push({
      initiativeName,
      initiativeOwner,
      initiativeScope,
      initiativeFunction,
      valueChainEntryName,
      label: label || 'Strategic Initiative',
      timestamp: new Date().toISOString(),
      selectedSuggestions: selectedSuggestions || []
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
    return res.json({ success: true, message: 'Initiative saved.' });
  }
});

// Optional: Get all submissions
app.get('/api/submissions', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json([]);
  const submissions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  res.json(submissions);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
