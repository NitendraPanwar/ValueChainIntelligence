# Contributing to Value Chain Intelligence

Thank you for your interest in contributing to the Value Chain Intelligence project! This document provides guidelines and instructions for contributing.

## Table of Contents
- [Getting Started](#getting-started)
- [Git Workflow](#git-workflow)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)

## Getting Started

1. **Fork the repository** (if you don't have write access)
   - Visit https://github.com/NitendraPanwar/ValueChainIntelligence
   - Click the "Fork" button in the top right

2. **Clone your fork locally:**
   ```sh
   git clone https://github.com/YOUR-USERNAME/ValueChainIntelligence.git
   cd ValueChainIntelligence
   ```

3. **Add the upstream repository:**
   ```sh
   git remote add upstream https://github.com/NitendraPanwar/ValueChainIntelligence.git
   ```

4. **Verify your remotes:**
   ```sh
   git remote -v
   ```
   You should see both `origin` (your fork) and `upstream` (original repo)

5. **Install dependencies** (see main README.md for detailed setup)

## Git Workflow

### Standard Development Workflow

1. **Sync with upstream before starting new work:**
   ```sh
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Create a new branch for your feature/fix:**
   ```sh
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and commit regularly:**
   ```sh
   git add .
   git commit -m "Descriptive commit message"
   ```

4. **Keep your branch updated with main:**
   ```sh
   git fetch upstream
   git rebase upstream/main
   ```
   Or use merge if you prefer:
   ```sh
   git merge upstream/main
   ```

5. **Push your changes to your fork:**
   ```sh
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

### Working on an Existing Branch

If you need to continue work on an existing branch:

```sh
# Switch to the branch
git checkout existing-branch-name

# Pull latest changes
git pull origin existing-branch-name

# Continue working...
git add .
git commit -m "Your changes"
git push origin existing-branch-name
```

### Resolving Merge Conflicts

When conflicts occur during rebase or merge:

1. **Identify conflicted files:**
   ```sh
   git status
   ```

2. **Open conflicted files and look for conflict markers:**
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Incoming changes
   >>>>>>> branch-name
   ```

3. **Edit the file to resolve conflicts**, removing the markers

4. **Mark as resolved and continue:**
   ```sh
   git add path/to/resolved/file
   git rebase --continue  # if rebasing
   # or
   git commit             # if merging
   ```

## Branch Naming Conventions

Use descriptive branch names that follow these patterns:

- **Features:** `feature/description-of-feature`
  - Example: `feature/add-user-authentication`
  
- **Bug fixes:** `fix/description-of-bug`
  - Example: `fix/login-button-not-responding`
  
- **Hotfixes:** `hotfix/critical-issue`
  - Example: `hotfix/security-vulnerability`
  
- **Documentation:** `docs/what-is-documented`
  - Example: `docs/api-documentation`
  
- **Refactoring:** `refactor/what-is-refactored`
  - Example: `refactor/database-connection-logic`

## Commit Message Guidelines

Write clear, concise commit messages that explain **what** and **why**:

### Format
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no code change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Examples

**Good commit messages:**
```
feat: add MongoDB connection pooling

Implemented connection pooling to improve database performance
and reduce connection overhead during high traffic periods.

Closes #123
```

```
fix: resolve null pointer in user profile

Fixed issue where user profile page crashed when accessing
users without profile pictures.
```

```
docs: update setup instructions in README

Added detailed Git workflow and troubleshooting section
to help new contributors get started.
```

**Bad commit messages:**
```
updated stuff
fixed bug
changes
WIP
```

## Pull Request Process

1. **Ensure your code follows the project's code style**

2. **Update documentation** if you've changed APIs or added features

3. **Test your changes thoroughly:**
   - Run the backend: `cd server && node index.js`
   - Run the frontend: `cd client && npm run dev`
   - Verify functionality in the browser

4. **Write a clear PR description:**
   - What does this PR do?
   - Why is this change needed?
   - How has it been tested?
   - Screenshots (if UI changes)

5. **Link related issues** using keywords:
   - `Closes #123`
   - `Fixes #456`
   - `Resolves #789`

6. **Request review** from maintainers

7. **Address review feedback** promptly

8. **Squash commits** if requested before merging

## Code Style Guidelines

### JavaScript/React
- Use **ES6+ syntax** (arrow functions, destructuring, etc.)
- Use **functional components** with hooks (not class components)
- Follow **camelCase** for variables and functions
- Follow **PascalCase** for component names
- Use **meaningful variable names**

### Example
```javascript
// Good
const fetchUserData = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

// Avoid
const func = async (x) => {
  const r = await fetch(`/api/users/${x}`);
  return r.json();
};
```

### File Organization
- Keep components in separate files
- Group related files in directories
- Use index.js for directory exports when appropriate

### CSS
- Use consistent naming (follow existing patterns)
- Keep styles modular and reusable
- Avoid inline styles unless necessary

## Testing

### Manual Testing
Before submitting a PR, test your changes:

1. **Backend testing:**
   ```sh
   cd server
   node index.js
   ```
   - Verify API endpoints work
   - Check console for errors

2. **Frontend testing:**
   ```sh
   cd client
   npm run dev
   ```
   - Test all affected UI components
   - Verify responsive design
   - Check browser console for errors
   - Test in multiple browsers if possible

### Writing Tests
- Add tests for new features when possible
- Follow existing test patterns
- Test edge cases and error conditions

## Environment Setup

### Required Environment Variables

**Server (.env in server/ directory):**
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

**Client (.env in client/ directory):**
```
VITE_API_URL=http://localhost:3000
```

### Common Setup Issues

**Issue: MongoDB connection fails**
- Verify your MONGODB_URI is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure your database user has proper permissions

**Issue: Frontend can't connect to backend**
- Verify backend is running on the correct port
- Check VITE_API_URL in client/.env
- Look for CORS issues in browser console

**Issue: Dependencies won't install**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Check Node.js version compatibility

## Getting Help

If you have questions or need help:

1. Check existing [Issues](https://github.com/NitendraPanwar/ValueChainIntelligence/issues)
2. Create a new issue with the `question` label
3. Reach out to the maintainers

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others when you can
- Follow project guidelines

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

Thank you for contributing to Value Chain Intelligence! 🚀
