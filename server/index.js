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
  const { name, businessType, label } = req.body;
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
    submissions.push({ name, businessType, label, timestamp: new Date().toISOString() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));
    return res.json({ success: true, message: 'Saved.' });
  } else {
    return res.json({ success: false, message: 'Duplicate entry. Not saved.' });
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
