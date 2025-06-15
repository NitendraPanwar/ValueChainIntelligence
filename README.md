# Value Chain Intelligence

A modern web application for Value Chain Intelligence, powered by Beyond Axis.

## Project Structure

- `client/` — React frontend (Vite, src/components, public/VC_Capability_Master.xlsx)
- `server/` — Node.js Express backend (API for saving and retrieving submissions)
- `VC & Capability Master.xlsx` — Source Excel file for business data

## Features
- Consistent header and subheader across all pages
- Homepage with four main business context buttons (Value Chain, Strategic Initiative, Management Score Card, Strategic Office)
- Add and display value chain names and business types per button context
- Data is saved to the backend and displayed as interactive buttons
- Clicking a saved entry shows its full JSON data
- Responsive, modern UI/UX
- All runtime/output files (node_modules, submissions.json) are git-ignored

## How to Run

1. **Install dependencies**
   - Frontend: `cd client && npm install`
   - Backend: `cd ../server && npm install`
2. **Start the backend**
   - `npm start` (from the `server` directory)
3. **Start the frontend**
   - `npm run dev` (from the `client` directory)
4. Open your browser to the local address shown in the terminal (usually http://localhost:5173)

## Status
- All core features implemented and tested
- Clean, maintainable, and modular codebase
- Ready for further enhancements as needed