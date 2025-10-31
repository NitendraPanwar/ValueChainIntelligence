# Git Setup Quick Reference Guide

This is a quick reference guide for setting up and working with Git for the Value Chain Intelligence project.

## First Time Setup

### Install Git

**Windows:**
- Download from https://git-scm.com/download/win
- Run the installer and follow the prompts
- Verify: `git --version`

**Mac:**
```sh
# Using Homebrew
brew install git

# Or download from https://git-scm.com/download/mac
```

**Linux (Ubuntu/Debian):**
```sh
sudo apt-get update
sudo apt-get install git
```

### Configure Git

Set up your identity (required before making commits):

```sh
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Verify your configuration:
```sh
git config --list
```

## Setting Up This Repository

### Method 1: Clone Existing Repository (Recommended)

```sh
# Clone the repository
git clone https://github.com/NitendraPanwar/ValueChainIntelligence.git

# Navigate into the directory
cd ValueChainIntelligence

# Check the status
git status
```

### Method 2: Initialize New Local Repository

```sh
# Create and navigate to your project directory
mkdir ValueChainIntelligence
cd ValueChainIntelligence

# Initialize Git
git init

# Add files
git add .

# Make first commit
git commit -m "Initial commit"

# Connect to remote repository (if applicable)
git remote add origin https://github.com/yourusername/ValueChainIntelligence.git
git branch -M main
git push -u origin main
```

## Daily Git Workflow

### Check Status
```sh
git status                    # See what files have changed
git log --oneline -10        # See recent commits
```

### Create a Feature Branch
```sh
git checkout -b feature/my-feature    # Create and switch to new branch
```

### Make Changes and Commit
```sh
git add .                     # Stage all changes
git add specific-file.js      # Stage specific file
git commit -m "Add new feature"   # Commit with message
```

### Push Changes
```sh
git push origin feature/my-feature    # Push to remote branch
```

### Pull Latest Changes
```sh
git pull origin main          # Pull from main branch
```

### Switch Branches
```sh
git branch                    # List all local branches
git checkout main             # Switch to main branch
git checkout -b new-branch    # Create and switch to new branch
```

## Common Scenarios

### Scenario 1: Starting a New Feature

```sh
# 1. Ensure you're on main and it's up to date
git checkout main
git pull origin main

# 2. Create a new feature branch
git checkout -b feature/user-authentication

# 3. Make your changes and commit
git add .
git commit -m "Add user authentication"

# 4. Push to remote
git push origin feature/user-authentication
```

### Scenario 2: Updating Your Branch with Latest Main

```sh
# Option A: Using merge
git checkout feature/my-feature
git merge main

# Option B: Using rebase (cleaner history)
git checkout feature/my-feature
git rebase main
```

### Scenario 3: Fixing Merge Conflicts

```sh
# 1. Pull latest changes (conflict occurs)
git pull origin main

# 2. See which files have conflicts
git status

# 3. Open conflicted files and look for:
#    <<<<<<< HEAD
#    Your changes
#    =======
#    Incoming changes
#    >>>>>>> branch-name

# 4. Edit files to resolve conflicts, then:
git add resolved-file.js
git commit -m "Resolve merge conflicts"
```

### Scenario 4: Undo Local Changes

```sh
# Discard changes to a specific file
git checkout -- filename.js

# Discard all local changes
git reset --hard

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Scenario 5: View Changes

```sh
# See uncommitted changes
git diff

# See changes in a specific file
git diff filename.js

# See changes in last commit
git show

# See changes between branches
git diff main..feature/my-feature
```

## Working with Remotes

### View Remote Repositories
```sh
git remote -v                 # List all remotes
```

### Add Remote Repository
```sh
git remote add origin https://github.com/username/repo.git
```

### Change Remote URL
```sh
git remote set-url origin https://github.com/username/new-repo.git
```

### Fetch vs Pull
```sh
git fetch origin              # Download changes but don't merge
git pull origin main          # Download and merge changes
```

## Useful Git Aliases (Optional)

Add these to your `~/.gitconfig` file:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --decorate --all
```

Then use them like: `git st`, `git co main`, etc.

## Troubleshooting

### Problem: "fatal: not a git repository"
**Solution:** You're not in a Git repository. Navigate to the project folder or run `git init`.

### Problem: "Permission denied (publickey)"
**Solution:** 
```sh
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/username/repo.git
```

### Problem: "Your branch is behind 'origin/main'"
**Solution:**
```sh
git pull origin main
```

### Problem: "Please commit your changes or stash them"
**Solution:**
```sh
# Option 1: Commit changes
git add .
git commit -m "Save work in progress"

# Option 2: Stash changes temporarily
git stash
# Do your other work...
git stash pop    # Restore stashed changes
```

### Problem: Accidentally committed to wrong branch
**Solution:**
```sh
# 1. Note the commit hash
git log --oneline -5

# 2. Switch to correct branch
git checkout correct-branch

# 3. Cherry-pick the commit
git cherry-pick <commit-hash>

# 4. Go back to wrong branch and remove the commit
git checkout wrong-branch
git reset --hard HEAD~1
```

## Best Practices

1. **Commit often** - Small, focused commits are better than large ones
2. **Write clear commit messages** - Describe what and why, not how
3. **Pull before you push** - Avoid merge conflicts
4. **Use branches** - Never work directly on main
5. **Review before committing** - Use `git diff` to see what you're committing
6. **Don't commit sensitive data** - Use .gitignore for credentials and secrets

## Git Workflow Summary

```
1. Clone repository → git clone <url>
2. Create branch → git checkout -b feature/name
3. Make changes → (edit files)
4. Stage changes → git add .
5. Commit changes → git commit -m "message"
6. Push to remote → git push origin feature/name
7. Create Pull Request → (on GitHub)
8. Merge PR → (after review)
9. Delete branch → git branch -d feature/name
```

## Additional Resources

- **Official Git Documentation:** https://git-scm.com/doc
- **GitHub Guides:** https://guides.github.com/
- **Interactive Git Tutorial:** https://learngitbranching.js.org/
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

## Getting Help

For project-specific questions:
- Check the main [README.md](README.md)
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Open an issue on GitHub

For Git help:
```sh
git help                      # General help
git help <command>            # Help for specific command
git <command> --help          # Alternative help format
```

---

**Remember:** Git is a powerful tool that gets easier with practice. Don't be afraid to experiment in a test branch!
