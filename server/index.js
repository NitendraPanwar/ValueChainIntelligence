
// ...existing code...

// Place this route after app is initialized and before app.listen

// ...existing code...

// Place this route after all other routes and after app is fully initialized, but before app.listen
// (This is a safe spot for new routes)


// ...existing code...

// Place this route at the end, after all other routes and after app is fully initialized, but before app.listen

// (DO NOT place any routes before app = express())

// Get all Strategic Initiative Entries
// This must be after all app setup and before app.listen

// ...existing code...

// Place this just before app.listen
// Get Strategic Initiative and its selected capabilities by initiative name
// (Moved below app initialization)
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { getDb } = require('./mongo');
const { ObjectId } = require('mongodb');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Save submission
app.post('/api/save', async (req, res) => {
  const { name, businessType, label, businessComplexity } = req.body;
  const annualRevenues = req.body["Annual Revenues (US$)"];
  if (!name || !businessType) {
    return res.status(400).json({ error: 'Name and businessType are required.' });
  }
  // Check for duplicate in MongoDB
  try {
    const db = await getDb();
    const exists = await db.collection('Submissions').findOne({
      valueChainEntryName: name,
      businessType,
      label
    });
    if (!exists) {
      const newEntry = {
        valueChainEntryName: name, // renamed field
        businessType,
        label,
        timestamp: new Date().toISOString(),
        "Business Complexity": businessComplexity,
        "Annual Revenues (US$)": annualRevenues,
        ValueChain: [] // Initialize as empty array
      };
      await db.collection('Submissions').insertOne(newEntry);
      return res.json({ success: true, message: 'Saved.' });
    } else {
      // If duplicate, update the existing entry with new values
      const updated = { ...exists };
      if (businessComplexity !== undefined) updated["Business Complexity"] = businessComplexity;
      if (annualRevenues !== undefined) updated["Annual Revenues (US$)"] = annualRevenues;
      if (req.body.ValueChain !== undefined) {
        updated["ValueChain"] = req.body.ValueChain;
      }
      updated.timestamp = new Date().toISOString();
      await db.collection('Submissions').updateOne(
        { valueChainEntryName: name, businessType, label },
        { $set: updated },
        { upsert: true }
      );
      return res.json({ success: true, message: 'Updated.' });
    }
  } catch (err) {
    console.error('MongoDB save error:', err);
    return res.status(500).json({ error: 'Failed to save submission.' });
  }
});

// Save capability maturity assessment as nested Capability array within ValueChain
app.post('/api/saveCapabilityAssessment', async (req, res) => {
  const { name, businessType, label, valueChainName, capabilityName, assessment } = req.body;
  if (!name || !businessType || !valueChainName || !capabilityName || !assessment) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    const db = await getDb();
    // Find the correct submission
    const submission = await db.collection('Submissions').findOne({
      valueChainEntryName: name,
      businessType,
      label
    });
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }
    if (!submission.ValueChain) submission.ValueChain = [];
    // Fetch all capabilities for this ValueChain entry from MongoDB
    let allCapabilities = [];
    const capMaster = await db.collection('Capability Master').find({ "Value Chain Stage": valueChainName }).toArray();
    allCapabilities = capMaster.map(row => ({
      Name: row["Capability Name"] || '',
      StarRating: 0,
    }));
    // Find or create the correct ValueChain entry
    let vc = submission.ValueChain.find(vc => vc.Name === valueChainName);
    if (!vc) {
      vc = { Name: valueChainName, Capability: [] };
      submission.ValueChain.push(vc);
    }
    if (!vc.Capability) vc.Capability = [];
    // Merge all capabilities into this ValueChain entry (preserve existing assessments)
    for (const cap of allCapabilities) {
      if (!vc.Capability.find(c => c.Name === cap.Name)) {
        vc.Capability.push({ ...cap });
      }
    }
    // Find or add the capability
    const capIdx = vc.Capability.findIndex(c => c.Name === capabilityName);
    const capabilityObj = { Name: capabilityName, ...assessment };
    if (capIdx === -1) {
      vc.Capability.push(capabilityObj);
    } else {
      vc.Capability[capIdx] = { ...vc.Capability[capIdx], ...capabilityObj };
    }
    submission.timestamp = new Date().toISOString();
    // Update in MongoDB
    await db.collection('Submissions').updateOne(
      { valueChainEntryName: name, businessType, label },
      { $set: submission },
      { upsert: true }
    );
    return res.json({ success: true, message: 'Capability assessment saved.' });
  } catch (err) {
    console.error('MongoDB update error:', err);
    return res.status(500).json({ error: 'Failed to save capability assessment.' });
  }
});

// Save initiative (Strategic Initiative flow)
app.post('/api/save-initiative', async (req, res) => {
  const { initiativeName, initiativeOwner, initiativeScope, initiativeFunction, valueChainEntryName, valueChainEntryId, label, selectedSuggestions } = req.body;
  if (!initiativeName || !initiativeOwner || !initiativeScope || !initiativeFunction || !valueChainEntryName || !valueChainEntryId) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const db = await getDb();
    // Check for existing initiative with the same InitiativeName
    const exists = await db.collection('Strategic Initiative Entries').findOne({ InitiativeName: initiativeName });
    if (exists) {
      return res.status(409).json({ error: 'A Strategic Initiative with this name already exists.' });
    }
    // Save to Strategic Initiative Entries collection
    const newEntry = {
      InitiativeName: initiativeName,
      InitiativeOwner: initiativeOwner,
      InitiativeScope: initiativeScope,
      Function: initiativeFunction,
      ValueChainEntryName: valueChainEntryName,
      ValueChainEntryID: valueChainEntryId,
      Label: label || 'Strategic Initiative',
      Timestamp: new Date().toISOString(),
      SelectedSuggestions: selectedSuggestions || []
    };
    // Save initiative and get the insertedId
    const initiativeResult = await db.collection('Strategic Initiative Entries').insertOne(newEntry);
    const initiativeId = initiativeResult.insertedId;

    // For each selected suggestion, update the corresponding Capability
    if (Array.isArray(selectedSuggestions)) {
      for (const item of selectedSuggestions) {
        // item.capabilityName, item.frameName, item.suggestion
        await db.collection('Capabilities').updateOne(
          {
            valueChainEntryName: valueChainEntryName,
            name: item.capabilityName
          },
          {
            $set: {
              StrategicInitiativeName: initiativeName,
              StrategicInitiativeId: initiativeId,
              Suggestion: item.suggestion
            }
          }
        );
      }
    }
    return res.json({ success: true, message: 'Initiative saved.' });
  } catch (err) {
    console.error('MongoDB initiative save error:', err);
    return res.status(500).json({ error: 'Failed to save initiative.' });
  }
});

// Get all submissions from MongoDB
app.get('/api/submissions', async (req, res) => {
  try {
    const db = await getDb();
    const submissions = await db.collection('Submissions').find({}).toArray();
    res.json(submissions);
  } catch (err) {
    console.error('MongoDB submissions fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

// Push sheet data to MongoDB (replace all previous data for the sheet)
app.post('/api/mongo/push', async (req, res) => {
  try {
    const { sheetName, data } = req.body;
    if (!sheetName || !Array.isArray(data)) {
      return res.status(400).json({ error: 'sheetName and data[] are required.' });
    }
    const db = await getDb();
    const collection = db.collection(sheetName);
    // Delete all previous data for this sheet
    await collection.deleteMany({});
    // Insert new data
    if (data.length > 0) {
      await collection.insertMany(data);
    }
    res.json({ success: true, message: 'Data replaced for sheet: ' + sheetName });
  } catch (err) {
    console.error('MongoDB push error:', err);
    res.status(500).json({ error: 'Failed to push data to MongoDB.' });
  }
});

// Read sheet data from MongoDB
app.get('/api/mongo/read', async (req, res) => {
  try {
    const sheetName = req.query.sheetName;
    if (!sheetName) {
      return res.status(400).json({ error: 'sheetName is required.' });
    }
    const db = await getDb();
    const collection = db.collection(sheetName);
    const data = await collection.find({}).toArray();
    res.json({ success: true, data });
  } catch (err) {
    console.error('MongoDB read error:', err);
    res.status(500).json({ error: 'Failed to read data from MongoDB.' });
  }
});

// Save or update sheet relations and node positions for a given sheetName
app.post('/api/mongo/sheet-relations', async (req, res) => {
  try {
    const { sheetName, relations, nodePositions } = req.body;
    if (!sheetName || !Array.isArray(relations)) {
      return res.status(400).json({ error: 'sheetName and relations[] are required.' });
    }
    const db = await getDb();
    const collection = db.collection('SheetRelations');
    // Upsert by sheetName
    await collection.updateOne(
      { sheetName },
      { $set: { relations, nodePositions: nodePositions || [] } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('MongoDB sheet-relations save error:', err);
    res.status(500).json({ error: 'Failed to save sheet relations.' });
  }
});

// Load sheet relations and node positions for a given sheetName
app.get('/api/mongo/sheet-relations', async (req, res) => {
  try {
    const sheetName = req.query.sheetName;
    if (!sheetName) {
      return res.status(400).json({ error: 'sheetName is required.' });
    }
    const db = await getDb();
    const collection = db.collection('SheetRelations');
    const doc = await collection.findOne({ sheetName });
    res.json(doc ? { relations: doc.relations, nodePositions: doc.nodePositions || [] } : { relations: [], nodePositions: [] });
  } catch (err) {
    console.error('MongoDB sheet-relations load error:', err);
    res.status(500).json({ error: 'Failed to load sheet relations.' });
  }
});

// Delete a user value chain entry from MongoDB (and optionally from JSON file)
app.post('/api/mongo/deleteValueChainEntry', async (req, res) => {
  const { valueChainEntryName, businessType, label } = req.body;
  if (!valueChainEntryName || !businessType || !label) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  try {
    // Delete from MongoDB
    const db = await getDb();
    const result = await db.collection('Submissions').deleteOne({ valueChainEntryName, businessType, label });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Entry not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete value chain entry error:', err);
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
});

// Delete a ValueChainEntry from the ValueChainEntries collection
app.post('/api/delete-valuechainentry', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing id' });
  try {
    const db = await getDb();
    const result = await db.collection('ValueChainEntries').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Entry not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete ValueChainEntry error:', err);
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
});

// --- API: Buy/Build data from MongoDB ---
app.get('/api/buybuild', async (req, res) => {
  const { capabilityName, industry } = req.query;
  if (!capabilityName || !industry) {
    return res.status(400).json({ error: 'capabilityName and industry are required.' });
  }
  try {
    const db = await getDb();
    // Try exact match first
    let row = await db.collection('Buy or Build').findOne({
      'Capability Name': capabilityName,
      'Industry': industry
    });
    // If not found, try case-insensitive match (fallback)
    if (!row) {
      row = await db.collection('Buy or Build').findOne({
        $and: [
          { $expr: { $eq: [ { $toLower: '$Capability Name' }, capabilityName.toString().toLowerCase() ] } },
          { $expr: { $eq: [ { $toLower: '$Industry' }, industry.toString().toLowerCase() ] } }
        ]
      });
    }
    if (!row) return res.json({ description: '', suggestions: '', buy: '' });
    res.json({
      description: row['Buy/Build Description'] || '',
      suggestions: row['Suggestions'] || '',
      buy: row['Buy'] || ''
    });
  } catch (err) {
    console.error('BuyBuild API error:', err);
    res.status(500).json({ error: 'Failed to fetch buy/build data.' });
  }
});

// --- API: Maturity Levels from MongoDB ---
app.get('/api/maturitylevels', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.collection('Maturity Mapping').find({}).toArray();
    const businessSet = new Set();
    const technologySet = new Set();
    const mapping = [];
    for (const row of rows) {
      if (row['Business Maturity Levels']) businessSet.add(row['Business Maturity Levels']);
      if (row['Technology Maturity Levels']) technologySet.add(row['Technology Maturity Levels']);
      if (row['Business Maturity Levels'] && row['Technology Maturity Levels'] && row['Maturity Level']) {
        mapping.push({
          business: row['Business Maturity Levels'],
          technology: row['Technology Maturity Levels'],
          maturity: row['Maturity Level']
        });
      }
    }
    res.json({
      business: Array.from(businessSet),
      technology: Array.from(technologySet),
      mapping
    });
  } catch (err) {
    console.error('MaturityLevels API error:', err);
    res.status(500).json({ error: 'Failed to fetch maturity levels.' });
  }
});

// Create ValueChainEntry (called from BusinessComplexities page Next button)
app.post('/api/valuechainentry', async (req, res) => {
  const { name, businessType, label, businessComplexity } = req.body;
  let { annualRevenues } = req.body;
  if (annualRevenues === undefined) annualRevenues = '';
  if (!name || !businessType) {
    return res.status(400).json({ error: 'Name and businessType are required.' });
  }
  try {
    const db = await getDb();
    const newEntry = {
      name,
      businessType,
      label,
      businessComplexity,
      annualRevenues,
      timestamp: new Date().toISOString()
    };
    // Upsert: update if exists, insert if not
    const result = await db.collection('ValueChainEntries').updateOne(
      { name, businessType },
      { $set: newEntry },
      { upsert: true }
    );
    // Always fetch the document to get its _id
    const entry = await db.collection('ValueChainEntries').findOne({ name, businessType });
    res.json({ success: true, _id: entry ? entry._id : null });
  } catch (err) {
    console.error('ValueChainEntry create error:', err);
    res.status(500).json({ error: 'Failed to create or update ValueChainEntry.' });
  }
});

// Get all ValueChainEntries from MongoDB
app.get('/api/valuechainentries', async (req, res) => {
  try {
    const db = await getDb();
    const entries = await db.collection('ValueChainEntries').find({}).toArray();
    res.json(entries);
  } catch (err) {
    console.error('MongoDB ValueChainEntries fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch ValueChainEntries.' });
  }
});

// Create ValueChains for a ValueChainEntry (1:N)
app.post('/api/valuechains', async (req, res) => {
  const { valueChainEntryId, valueChainEntryName, valueChains } = req.body;
  if (!valueChainEntryId || !Array.isArray(valueChains)) {
    return res.status(400).json({ error: 'valueChainEntryId and valueChains[] are required.' });
  }
  try {
    const db = await getDb();
    // Fetch existing value chains for this entry
    const existing = await db.collection('ValueChains').find({ valueChainEntryId: new ObjectId(valueChainEntryId) }).toArray();
    const existingNames = new Set(existing.map(vc => (vc.name || vc.Name)));
    // For each value chain in the request
    let updatedCount = 0;
    let insertedCount = 0;
    for (const vc of valueChains) {
      const name = vc.name || vc.Name;
      // Ensure Capability array exists (initialize if not provided)
      if (!vc.Capability) vc.Capability = [];
      const valueChainDoc = {
        ...vc,
        valueChainEntryId: new ObjectId(valueChainEntryId),
        valueChainEntryName: valueChainEntryName || '',
        timestamp: new Date().toISOString(),
        Capability: vc.Capability || []
      };
      if (existingNames.has(name)) {
        // Update star rating and Capability array (and any other fields)
        await db.collection('ValueChains').updateOne(
          { valueChainEntryId: new ObjectId(valueChainEntryId), name },
          { $set: valueChainDoc }
        );
        updatedCount++;
      } else {
        // Insert new value chain with Capability array
        await db.collection('ValueChains').insertOne(valueChainDoc);
        insertedCount++;
      }
    }
    res.json({ success: true, insertedCount, updatedCount });
  } catch (err) {
    console.error('ValueChains create/update error:', err);
    res.status(500).json({ error: 'Failed to create or update ValueChains.' });
  }
});

// Get all ValueChains linked to a ValueChainEntry by entryId
app.get('/api/valuechains/:entryId', async (req, res) => {
  try {
    const db = await getDb();
    const entryId = req.params.entryId;
    let objectId;
    try {
      objectId = new ObjectId(entryId);
    } catch (e) {
      // Not a valid ObjectId, return empty array
      return res.json([]);
    }
    const query = { valueChainEntryId: objectId };
    const valueChains = await db.collection('ValueChains').find(query).toArray();
    res.json(valueChains);
  } catch (err) {
    console.error('MongoDB ValueChains fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch ValueChains.' });
  }
});

// Get all Capabilities for a ValueChain
app.get('/api/capabilities/:valueChainId', async (req, res) => {
  try {
    const db = await getDb();
    const valueChainId = req.params.valueChainId;
    let query;
    // Only use ObjectId if valueChainId is a valid ObjectId string
    if (/^[a-fA-F0-9]{24}$/.test(valueChainId)) {
      query = { valueChainId: new ObjectId(valueChainId) };
    } else {
      query = { valueChainId: valueChainId };
    }
    const capabilities = await db.collection('Capabilities').find(query).toArray();
    res.json(capabilities);
  } catch (err) {
    console.error('MongoDB Capabilities fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch Capabilities.' });
  }
});

// Create or update a Capability for a ValueChain
app.post('/api/capability', async (req, res) => {
  const { valueChainId, valueChainName, entryId, entryName, name, businessMaturity, technologyMaturity, maturityLevel, businessOwner, techOwner, valueChainEntryId, valueChainEntryName } = req.body;
  if (!valueChainId || !name) {
    return res.status(400).json({ error: 'valueChainId and name are required.' });
  }
  try {
    const db = await getDb();
    const filter = { valueChainId: typeof valueChainId === 'string' ? new ObjectId(valueChainId) : valueChainId, name };
    const updateFields = { updatedAt: new Date().toISOString() };
    if (maturityLevel !== undefined) updateFields.maturityLevel = maturityLevel;
    if (businessMaturity !== undefined) updateFields.businessMaturity = businessMaturity;
    if (technologyMaturity !== undefined) updateFields.technologyMaturity = technologyMaturity;
    if (businessOwner !== undefined) updateFields.businessOwner = businessOwner;
    if (techOwner !== undefined) updateFields.techOwner = techOwner;
    // Optionally update valueChainName, entryId, entryName if provided
    if (valueChainName !== undefined) updateFields.valueChainName = valueChainName;
    if (entryId !== undefined) updateFields.entryId = entryId;
    if (entryName !== undefined) updateFields.entryName = entryName;
    if (valueChainEntryId !== undefined) updateFields.valueChainEntryId = valueChainEntryId;
    if (valueChainEntryName !== undefined) updateFields.valueChainEntryName = valueChainEntryName;
    const update = { $set: updateFields };
    const result = await db.collection('Capabilities').updateOne(filter, update, { upsert: true });
    res.json({ success: true });
  } catch (err) {
    console.error('MongoDB Capability upsert error:', err);
    res.status(500).json({ error: 'Failed to save Capability.' });
  }
});

// Get all Capabilities in the collection
app.get('/api/capabilities', async (req, res) => {
  try {
    const db = await getDb();
    const capabilities = await db.collection('Capabilities').find({}).toArray();
    res.json(capabilities);
  } catch (err) {
    console.error('MongoDB Capabilities fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch all Capabilities.' });
  }
});

// Delete all Capabilities in the collection
app.delete('/api/capabilities', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection('Capabilities').deleteMany({});
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('MongoDB Capabilities delete error:', err);
    res.status(500).json({ error: 'Failed to delete all Capabilities.' });
  }
});

// Get a single ValueChainEntry by ID
app.get('/api/valuechainentries/:id', async (req, res) => {
  try {
    const db = await getDb();
    const entry = await db.collection('ValueChainEntries').findOne({ _id: new ObjectId(req.params.id) });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    console.error('MongoDB ValueChainEntry fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch ValueChainEntry.' });
  }
});

// Get a single ValueChain by ID
app.get('/api/valuechains/:id', async (req, res) => {
  try {
    const db = await getDb();
    const valueChain = await db.collection('ValueChains').findOne({ _id: new ObjectId(req.params.id) });
    if (!valueChain) return res.status(404).json({ error: 'ValueChain not found' });
    res.json(valueChain);
  } catch (err) {
    console.error('MongoDB ValueChain fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch ValueChain.' });
  }
});

// Get all value chains (raw)
app.get('/api/valuechains', async (req, res) => {
  try {
    const db = await getDb();
    const valueChains = await db.collection('ValueChains').find({}).toArray();
    res.json(valueChains);
  } catch (err) {
    console.error('MongoDB ValueChains fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch all ValueChains.' });
  }
});

// Delete all value chains (raw)
app.delete('/api/valuechains', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection('ValueChains').deleteMany({});
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('MongoDB ValueChains delete error:', err);
    res.status(500).json({ error: 'Failed to delete all ValueChains.' });
  }
});

// Update only maturity fields for a capability
app.post('/api/updateCapability', async (req, res) => {
  const { valueChainEntryName, valueChainName, name, businessMaturity, technologyMaturity, maturityLevel, businessOwner, techOwner } = req.body;
  if (!valueChainEntryName || !valueChainName || !name) {
    return res.status(400).json({ error: 'valueChainEntryName, valueChainName, and name are required.' });
  }
  try {
    const db = await getDb();
    const filter = { valueChainEntryName, valueChainName, name };
    const capability = await db.collection('Capabilities').findOne(filter);
    if (!capability) {
      return res.status(404).json({ error: 'Capability not found for given valueChainEntryName, valueChainName, and name.' });
    }
    const updateFields = { updatedAt: new Date().toISOString() };
    if (maturityLevel !== undefined) updateFields.maturityLevel = maturityLevel;
    if (businessMaturity !== undefined) updateFields.businessMaturity = businessMaturity;
    if (technologyMaturity !== undefined) updateFields.technologyMaturity = technologyMaturity;
    if (businessOwner !== undefined) updateFields.businessOwner = businessOwner;
    if (techOwner !== undefined) updateFields.techOwner = techOwner;
    const update = { $set: updateFields };
    await db.collection('Capabilities').updateOne({ _id: capability._id }, update);
    res.json({ success: true });
  } catch (err) {
    console.error('[UpdateCapability API] MongoDB error:', err);
    res.status(500).json({ error: 'Failed to update Capability maturity fields.' });
  }
});

// Get all Capabilities for a ValueChain Entry (by entryId)
app.get('/api/capabilities/byEntryId/:entryId', async (req, res) => {
  try {
    const db = await getDb();
    const entryId = req.params.entryId;
    let objectId;
    try {
      objectId = new ObjectId(entryId);
    } catch (e) {
      objectId = null;
    }
    // Query for both ObjectId and string representations
    const query = objectId
      ? { $or: [ { valueChainEntryId: objectId }, { valueChainEntryId: entryId } ] }
      : { valueChainEntryId: entryId };
    const capabilities = await db.collection('Capabilities').find(query).toArray();
    res.json(capabilities);
  } catch (err) {
    console.error('MongoDB Capabilities byEntryId fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch Capabilities by entryId.' });
  }
});

// Get a single Capability by its _id
app.get('/api/capabilities/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const doc = await db.collection('Capabilities').findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching capability by id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New route: fetch capability by name and valueChainEntryName
app.get('/api/capabilities/by-name-and-entry', async (req, res) => {
  const { capabilityName, valueChainEntryName } = req.query;
  console.log('[API] /api/capabilities/by-name-and-entry: Received call with query:', { capabilityName, valueChainEntryName });
  if (!capabilityName && !valueChainEntryName) {
    console.log('[API] /api/capabilities/by-name-and-entry: Missing capabilityName or valueChainEntryName');
    return res.status(400).json({ error: 'Provide at least one of capabilityName or valueChainEntryName' });
  }
  try {
    const db = await getDb();
    const query = {};
    if (capabilityName) query.name = { $regex: capabilityName, $options: 'i' };
    if (valueChainEntryName) query.valueChainEntryName = { $regex: valueChainEntryName, $options: 'i' };
    console.log('[API] /api/capabilities/by-name-and-entry: Query:', query);
    const docs = await db.collection('Capabilities').find(query).toArray();
    console.log('[API] /api/capabilities/by-name-and-entry: Found docs:', docs);
    res.json(docs);
  } catch (err) {
    console.error('[API] /api/capabilities/by-name-and-entry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- DEBUG: List Capabilities by name or valueChainEntryName (TEMPORARY) ---
app.get('/api/capabilities/debug/by-name-or-entry', async (req, res) => {
  const { capabilityName, valueChainEntryName } = req.query;
  if (!capabilityName && !valueChainEntryName) {
    return res.status(400).json({ error: 'Provide at least one of capabilityName or valueChainEntryName' });
  }
  try {
    const db = await getDb();
    const query = {};
    if (capabilityName) query.name = capabilityName;
    if (valueChainEntryName) query.valueChainEntryName = valueChainEntryName;
    const docs = await db.collection('Capabilities').find(query).toArray();
    res.json({ count: docs.length, docs });
  } catch (err) {
    console.error('[DEBUG] /api/capabilities/debug/by-name-or-entry error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get all Strategic Initiative Entries
app.get('/api/initiative/all', async (req, res) => {
  try {
    const db = await getDb();
    const initiatives = await db.collection('Strategic Initiative Entries').find({}).toArray();
    res.json(initiatives);
  } catch (err) {
    console.error('Error fetching all strategic initiatives:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Get Strategic Initiative and its selected capabilities by initiative name
app.get('/api/initiative/by-name', async (req, res) => {
  const { initiativeName } = req.query;
  if (!initiativeName) {
    return res.status(400).json({ error: 'initiativeName is required' });
  }
  try {
    const db = await getDb();
    const initiative = await db.collection('Strategic Initiative Entries').findOne({ InitiativeName: initiativeName });
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    // Optionally, fetch more details if needed
    res.json({
      initiativeName: initiative.InitiativeName,
      initiativeOwner: initiative.InitiativeOwner,
      initiativeScope: initiative.InitiativeScope,
      initiativeFunction: initiative.Function,
      valueChainEntryName: initiative.ValueChainEntryName,
      valueChainEntryId: initiative.ValueChainEntryID,
      selectedSuggestions: initiative.SelectedSuggestions || []
    });
  } catch (err) {
    console.error('Error fetching initiative by name:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
