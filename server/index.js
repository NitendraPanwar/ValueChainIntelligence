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
      Capability: Capability || []
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

// Optional: Get all submissions
app.get('/api/submissions', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json([]);
  const submissions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  res.json(submissions);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
