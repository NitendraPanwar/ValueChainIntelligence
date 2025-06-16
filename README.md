# Value Chain Intelligence App

## Current Progress (as of June 16, 2025)
- Modular React app with multi-step wizard flow for value chain, business complexity, and capability assessment.
- Backend (Node.js/Express) for saving and updating submissions in `submissions.json`.
- Data structure supports nested `ValueChain` array (with Name and StarRating) and preserves all previous data (Business Complexity, Annual Revenues, etc.).
- All data is merged and updated per user/session, not overwritten.
- Debug logging enabled on backend for incoming submissions.

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
- You can add new features, validations, or UI/UX improvements as needed.
- Check server logs for debugging submission data.

## To Do Next
- Add more advanced data validation, analytics, or reporting as needed.
- Enhance UI/UX or add new wizard steps.
- Integrate with other data sources or APIs if required.

---
**To resume, just follow the steps above. All state and data flow is ready for further enhancements!**