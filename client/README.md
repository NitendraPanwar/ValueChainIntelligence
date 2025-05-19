# Value Chain Intelligence

A React-based web application for exploring value chain capabilities and intelligence, powered by Beyond Axis.

## Features

- **Excel-driven UI**: Reads from `VC_Capability_Master.xlsx` (in `/public`) to dynamically generate the homepage and value chain pages.
- **Homepage**: Five frames (one per column from the "Homepage" sheet), each value as a toggle button. Mutually exclusive selection logic is configurable in `src/config.js`.
- **Value Chain Page**:
  - After selecting a Business Type and clicking "Let's GO!", displays all matching entries from the "Value Chain Master" sheet where the "Value Chain" column matches the selected Business Type.
  - Each match is shown in a horizontally scrollable frame with the Name as header and Description as body.
  - **Next button logic:** For each frame, when you click "Next", the app searches the "Capability Master" sheet for all rows where:
    - "Industry-Specific Variants" matches the selected Business Type, and
    - "Value Chain Stage" matches the frame's Name.
    - All matching "Capability Name" values are displayed as buttons under the corresponding frame.
  - Each frame includes an interactive 4-star rating widget.
  - Star rating definitions are shown at the bottom in a single row, visually indicating the meaning of each rating.
- **Responsive, modern UI**: Clean, mobile-friendly layout with visually appealing design.
- **Easy deployment**: Ready for static hosting (e.g., GitHub Pages).

## Getting Started

### Prerequisites
- Node.js (v16 or later recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd ValueChainIntelligence/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Place your `VC_Capability_Master.xlsx` file in the `public/` directory (already present for demo).

### Running Locally

```bash
npm run dev
```

- Open the local URL shown in your terminal (typically http://localhost:5173).

### Building for Production

```bash
npm run build
```

- The static site will be generated in the `dist/` folder.

### Deploying to GitHub Pages

1. Set the `base` path in `vite.config.js` if deploying to a subpath.
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy the contents of the `dist/` folder to your GitHub Pages branch (e.g., `gh-pages`).

## Project Structure

- `src/App.jsx` — Main React app, including homepage and value chain logic.
- `src/config.js` — Configurable mutually exclusive frame logic.
- `public/VC_Capability_Master.xlsx` — Excel data source.
- `src/App.css` — Main styles.

## Customization
- To change mutually exclusive selection logic, edit `mutuallyExclusiveHeaders` in `src/config.js`.
- To update Excel data, replace `VC_Capability_Master.xlsx` in `public/`.

## Feedback & Contributions
Pull requests and feedback are welcome!

---

**Powered by Beyond Axis**
