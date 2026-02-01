# CLAUDE.md - Project Guide

This is a custom Lovelace card for Home Assistant that visualizes entity activity data as a calendar heatmap (GitHub contribution graph style).

## Quick Reference

```bash
npm install          # Install dependencies
npm run build        # Build for production
npm run build:watch  # Build with watch mode for development
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run test         # Run Jest tests
```

## Project Structure

```
src/
├── index.js                    # Entry point - registers custom element
├── calendar-heatmap-card.js    # Main LitElement component
├── constants.js                # Centralized configuration
├── utils/                      # Utility functions (date, format, color)
├── services/                   # Home Assistant API integration
├── data/                       # Data processing logic
└── ui/                         # UI components (LitElement-based)
    └── lit-components/         # Grid, labels, header, detail view

dist/                           # Build output (calendar-heatmap-card.js)
```

## Branching and Merging

### Branch Structure
- **`main`** - Production branch, triggers releases
- **`develop`** - Development branch for integration
- **`master`** - Legacy branch (deprecated, use `main` for releases)

### Workflow
1. Create feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. Make changes and commit using **Conventional Commits**:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug in heatmap"
   ```

3. Push and create PR to `develop`:
   ```bash
   git push origin feature/my-feature
   gh pr create --base develop
   ```

4. After review, merge to `develop`, then create PR from `develop` to `main`:
   ```bash
   gh pr create --base main --head develop
   ```

### Conventional Commits (Required)
- `feat:` - New feature (MINOR version bump)
- `fix:` - Bug fix (PATCH version bump)
- `docs:` - Documentation only
- `style:` - Code formatting
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Test additions
- `chore:` - Build/tooling changes

For breaking changes, add footer:
```
feat: new API format

BREAKING CHANGE: requires Home Assistant 2024.0+
```

## Releases

Releases are **fully automated** via semantic-release when commits reach `main`:

1. Push/merge to `main` triggers release workflow
2. semantic-release analyzes commit messages
3. Version determined automatically from commits
4. Files updated: `package.json`, `manifest.json`, `src/constants.js`, `CHANGELOG.md`
5. GitHub release created with build artifacts

**No manual version bumping needed** - just follow Conventional Commits.

### Check Release Status
```bash
gh release list --limit 5
gh run list --workflow=release.yml --limit 5
```

## Testing

Jest with jsdom environment for browser simulation:

```bash
npm run test                 # Run all tests
npm run test -- --watch      # Watch mode
npm run test -- --coverage   # With coverage report
```

Tests are in `src/__tests__/` - add tests for new features.

## CI/CD Workflows

### CI (`ci.yml`)
- Triggers: PRs and pushes to `main`
- Steps: Install → Lint → Test → Build

### Release (`release.yml`)
- Triggers: Push to `main`
- Steps: Install → Lint → Build → Gzip → semantic-release

### HACS Validation (`hacs.yml`)
- Triggers: Push, PR, and daily schedule
- Validates HACS compatibility

### Check CI Status
```bash
gh run list --limit 10
gh run view <run-id>
gh run view <run-id> --log-failed
```

## GitHub CLI Commands

```bash
# Issues
gh issue list
gh issue view <number>
gh issue create

# Pull Requests
gh pr list
gh pr view <number>
gh pr create --base develop
gh pr merge <number>

# CI/Releases
gh run list
gh release list
gh release view <tag>

# Workflows
gh workflow list
gh workflow run ci.yml
```

## Code Quality

- **ESLint** + **Prettier** enforced via pre-commit hooks
- Single quotes, semicolons, 80-char width, 2-space indent
- Git hooks via Husky automatically lint/format on commit

## Build Output

- `dist/calendar-heatmap-card.js` - Minified bundle (~56KB)
- `dist/calendar-heatmap-card.js.gz` - Gzipped (~16KB)
- `dist/calendar-heatmap-card.js.map` - Source maps

## Key Dependencies

- **lit** (^2.7.0) - Web components framework (only production dep)
- **Rollup** - Bundler
- **semantic-release** - Automated releases
- **Jest** - Testing

## Home Assistant Integration

- Minimum HA version: 2023.8.0
- Install via HACS or copy `dist/calendar-heatmap-card.js` to `config/www/`
- Add as resource in Lovelace dashboard

## Open Issues

```bash
gh issue list --state open
```

Current: #9 - Feature Request: Binary/Habit-Tracker Mode
