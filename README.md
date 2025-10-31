# Value Chain Intelligence App

## Getting Started: Setting Up Your Local Repository

### Prerequisites
Before you begin, ensure you have the following installed on your system:
- **Git** (version 2.0 or higher) - [Download Git](https://git-scm.com/downloads)
- **Node.js** (version 16.x or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- A **MongoDB Atlas** account (for database features) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- A code editor (recommended: [VS Code](https://code.visualstudio.com/))

### Option 1: Clone the Existing Repository

If you want to work with the existing project, follow these steps:

1. **Open your terminal or command prompt**

2. **Navigate to your desired directory:**
   ```sh
   cd /path/to/your/workspace
   ```

3. **Clone the repository:**
   ```sh
   git clone https://github.com/NitendraPanwar/ValueChainIntelligence.git
   ```

4. **Navigate into the project directory:**
   ```sh
   cd ValueChainIntelligence
   ```

5. **Verify the clone was successful:**
   ```sh
   git status
   ```
   You should see: `On branch main` (or the default branch name)

6. **Install root dependencies:**
   ```sh
   npm install
   ```

7. **Set up the backend:**
   ```sh
   cd server
   npm install
   ```
   
   Create a `.env` file in the `server` directory with your MongoDB credentials:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

8. **Set up the frontend:**
   ```sh
   cd ../client
   npm install
   ```
   
   If needed, create a `.env` file in the `client` directory:
   ```
   VITE_API_URL=http://localhost:3000
   ```

### Option 2: Initialize a New Local Repository

If you're starting fresh or want to create a new Git repository from scratch:

1. **Create a new project directory:**
   ```sh
   mkdir ValueChainIntelligence
   cd ValueChainIntelligence
   ```

2. **Initialize a new Git repository:**
   ```sh
   git init
   ```
   This creates a `.git` directory that tracks your project's version history.

3. **Configure your Git identity (if not already configured):**
   ```sh
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   ```

4. **Create initial project structure:**
   - Add your project files (server, client, etc.)
   - Create a `.gitignore` file to exclude unnecessary files

5. **Stage your files:**
   ```sh
   git add .
   ```

6. **Create your first commit:**
   ```sh
   git commit -m "Initial commit"
   ```

7. **Connect to a remote repository (optional):**
   ```sh
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Basic Git Commands You'll Need

- **Check repository status:**
  ```sh
  git status
  ```

- **View commit history:**
  ```sh
  git log --oneline
  ```

- **Create a new branch:**
  ```sh
  git checkout -b feature/your-feature-name
  ```

- **Switch between branches:**
  ```sh
  git checkout branch-name
  ```

- **Pull latest changes:**
  ```sh
  git pull origin main
  ```

- **Stage and commit changes:**
  ```sh
  git add .
  git commit -m "Your commit message"
  ```

- **Push changes to remote:**
  ```sh
  git push origin branch-name
  ```

### Troubleshooting Common Git Issues

**Issue: "Permission denied (publickey)"**
- Solution: Set up SSH keys or use HTTPS with credentials
  ```sh
  git remote set-url origin https://github.com/username/repo.git
  ```

**Issue: "fatal: not a git repository"**
- Solution: Make sure you're in the correct directory or initialize Git
  ```sh
  git init
  ```

**Issue: Merge conflicts**
- Solution: Open conflicted files, resolve conflicts manually, then:
  ```sh
  git add .
  git commit -m "Resolved merge conflicts"
  ```

**Issue: Accidentally committed sensitive data**
- Solution: Remove from history (be careful with this):
  ```sh
  git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch path/to/sensitive/file" \
    --prune-empty --tag-name-filter cat -- --all
  ```
  Better: Use `.gitignore` to prevent committing sensitive files in the first place.

### Quick Start After Setup

Once your local repository is set up, you can start working:

1. **Start the backend server** (in one terminal):
   ```sh
   cd server
   node index.js
   ```
   Backend runs on: http://localhost:3000

2. **Start the frontend app** (in another terminal):
   ```sh
   cd client
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

3. **Open your browser** and navigate to the URL shown in your terminal (usually http://localhost:5173)

---

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

## MongoDB Sheet & Graph Features (2025)
- The app now supports advanced Excel import, sheet/column selection, and MongoDB integration for data persistence.
- **Sheet Relations & Graph Layout:**
  - Visualize Excel sheets as nodes in a graph, create/edit relations (edges) between sheets, and select key/reference columns.
  - Node positions (graph layout) and all relations can be saved to and loaded from MongoDB.
  - Manual buttons: "Save Relations to MongoDB", "Load Relations from MongoDB", "Save Graph (MongoDB)", and "Load Graph (MongoDB)".
  - Validation and copyable modals for all relations and errors.
- **Persistence:**
  - All relations and node positions are stored in the `SheetRelations` collection in MongoDB Atlas.
  - Loading a graph restores both the relations and the exact node layout as last saved.
- **Debugging:**
  - Debug logs are printed in the browser console when saving/loading graph data to/from MongoDB.
- See the `Load Data` page in the app for these features.

## How to Resume Work

> **Note:** If this is your first time setting up the project, please refer to the [Getting Started](#getting-started-setting-up-your-local-repository) section above for initial setup instructions.

1. **Start the backend server:**
   ```sh
   cd server
   node index.js
   ```
   The server will start on http://localhost:3000

2. **Start the frontend app** (in a new terminal):
   ```sh
   cd client
   npm run dev
   ```
   The app will start on http://localhost:5173

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