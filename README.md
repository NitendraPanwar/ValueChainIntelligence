# Value Chain Intelligence App

## Current Progress (as of June 20, 2025)
- Modular React app with multi-step wizard flow for value chain, business complexity, capability assessment, and strategic initiative management.
- Strategic Initiative flow: select value chain entry, select capabilities, check suggestions, and save initiatives with associated suggestions.
- Suggestions for each capability are displayed as checkboxes; selected suggestions are tracked and saved.
- Backend (Node.js/Express) for saving and updating submissions in `submissions.json`.
- Strategic Initiative entries are updated if initiative name and value chain entry name match; otherwise, new entries are added.
- Data structure supports nested `ValueChain` array (with Name and StarRating) and preserves all previous data (Business Complexity, Annual Revenues, etc.).
- All data is merged and updated per user/session, not overwritten.
- Debug logging enabled on backend for incoming submissions and initiatives.
- Major frontend refactor: `BuildingBlocks.jsx` is now `BusinessCapabilities.jsx` (all references updated).
- UI/UX matches original design: horizontal scroll for frames, segmented toggle (capability/business/technology), modern header/subheader.
- Strategic Initiative buttons on homepage now display as:
  - Strategic Initiative Name
  - (<valueChainEntryName>)
- Unused files (e.g., `OldHomePage.jsx`, `BuildingBlocks.jsx`) have been removed for a clean codebase.
- All navigation flows (add, saved entry, wizard) are working and tested.
- **MongoDB integration:** Backend now connects to MongoDB Atlas using environment variables in `.env`.
- **File import endpoint:** Backend supports `/api/upload-xlsx` for Excel file upload and sheet name extraction (UI pending).

## MongoDB Data Load (Keep Separate)
- **Note:** The scripts and logic for loading data into MongoDB (e.g., from Excel files) are kept separate from the main project codebase.
- To load data into MongoDB, use a dedicated script (such as `load_homepage_to_mongo.js`) outside of the main backend server.
- This ensures that data import and ETL operations do not interfere with the main application logic or runtime.
- See the `server/load_homepage_to_mongo.js` script for an example of how to load Excel data into MongoDB.
- Update and run these scripts as needed for initial data setup or bulk updates.

## How to Resume Work
1. **Start the backend server:**
   ```sh
   cd ValueChainIntelligence/server
   npm install
   node index.js
   ```
2. **Start the frontend app:**
   ```sh
   cd ../client
   npm install
   npm run dev
   ```
3. **Open the app in your browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

## Where to Continue
- All user/session data is now passed as props (`name`, `businessType`, `label`) through the flow.
- ValueChain page saves capability names and star ratings as a nested array in each submission.
- Strategic Initiative flow saves initiative details and selected suggestions per capability.
- **Next up:** Implement frontend UI for importing `.xlsx` files and displaying sheet names using `/api/upload-xlsx` endpoint.
- You can add new features, validations, or UI/UX improvements as needed.
- Check server logs for debugging submission data.
- Codebase is modular and clean; all unused files have been removed.

## To Do Next
- Add more advanced data validation, analytics, or reporting as needed.
- Enhance UI/UX or add new wizard steps.
- Integrate with other data sources or APIs if required.
- **[Planned] Refactor navigation:**
  - Update all page/view transitions to use React Router navigation (e.g., `useNavigate`, `<Link>`) instead of local state (`setPage`).
  - This will ensure the browser URL always matches the current view, enabling deep linking, browser navigation, and a more standard SPA experience.

---
**To resume, just follow the steps above. All state and data flow is ready for further enhancements!**