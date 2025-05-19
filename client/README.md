# Value Chain Intelligence Web App

## Overview
This is a React-based web application for Value Chain Intelligence, powered by Beyond Axis. The app provides a multi-step, interactive UI for exploring value chain stages and business capabilities, reading all data from an Excel file (`VC_Capability_Master.xlsx`).

## Features
- **Homepage**: Select business context using mutually exclusive and multi-select frames. Navigation is controlled by a fixed "Let's GO!" button.
- **Value Chain Page**: Displays value chain stages for the selected business type. Each stage is shown in a horizontally scrollable frame with:
  - Fixed two-row heading for perfect alignment
  - Description text
  - Star rating widget (4-star, always bottom-aligned)
  - "Next" button to load business capabilities for each stage
- **Capabilities**: After clicking "Next", each frame displays capability buttons for the selected business type and stage. Each button features:
  - Traffic light icons (red/orange/green) indicating maturity level (Manual, Homegrown, Specific Product)
  - Single left click: Flips the button to show the maturity level (or "No MM" if unset)
  - Double click: Opens a modal to set the maturity level
- **Modal**: Shows capability name and a dropdown to select maturity level. Updates traffic light color dynamically.
- **Navigation**: After capabilities are loaded, clicking "Next" again navigates to a third page with the default header and subheader.
- **Responsive Design**: All layouts are responsive and visually consistent.
- **Maintainable Styling**: All main styles are in `App.css`.

## File Structure
- `src/App.jsx`: Main React logic, navigation, modal, flipping, and traffic light logic
- `src/App.css`: All main styles, including modal, traffic lights, and frame alignment
- `src/config.js`: Mutually exclusive headers and maturity level options
- `public/VC_Capability_Master.xlsx`: Excel data source
- `README.md`: Project documentation

## How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser to the local address shown in the terminal.

## Customization
- Update `VC_Capability_Master.xlsx` in `public/` to change value chain, stages, or capabilities.
- Adjust mutually exclusive logic or maturity levels in `src/config.js`.
- Update styles in `src/App.css` for branding or layout changes.

## Custom Textbox Formatting on Page 4

- The first formatted textbox under each selected capability displays a floating label "Buy v/s Build?" (top-centered inside the box) and shows justified, rich text content (read-only).
- The second formatted textbox below it displays a floating label "Industry Leading Platforms" (top-centered inside the box) and shows left-aligned, rich text content (read-only).
- Both textboxes support HTML formatting for their content and display a default placeholder if no content is present.
- These enhancements provide a visually clear and user-friendly review of selected capabilities on the final page.

## Status
- Homepage and Value Chain (Page 2) are fully implemented and tested.
- Third page is a placeholder for future features.

---
For questions or contributions, please contact the Beyond Axis team.
