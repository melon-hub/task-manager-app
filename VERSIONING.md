# Versioning Strategy

## Overview
This project follows **Semantic Versioning 2.0.0** (SemVer) with the format: `MAJOR.MINOR.PATCH`

## Version Number Format
- **MAJOR**: Breaking changes that are incompatible with previous versions
- **MINOR**: New features added in a backwards-compatible manner
- **PATCH**: Backwards-compatible bug fixes

Current Version: `0.1.0` (Pre-release/MVP phase)
Next Version: `0.2.0` (Pending release with major UI improvements)

## Git Tag Format
We use annotated tags with the following convention:
- Release tags: `v{MAJOR}.{MINOR}.{PATCH}` (e.g., `v0.1.0`, `v1.0.0`)
- Pre-release tags: `v{MAJOR}.{MINOR}.{PATCH}-{PRERELEASE}` (e.g., `v0.2.0-alpha.1`)
- Release candidate tags: `v{MAJOR}.{MINOR}.{PATCH}-rc.{N}` (e.g., `v1.0.0-rc.1`)

## Release Process

### 1. Update Version Number
```bash
# Update package.json version
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```

### 2. Create Release Notes
- Update CHANGELOG.md with all changes
- Group changes by category (Features, Bug Fixes, Breaking Changes)
- Include migration guide for breaking changes

### 3. Create Git Tag
```bash
# Create annotated tag
git tag -a v0.1.0 -m "Release version 0.1.0"

# Push tag to GitHub
git push origin v0.1.0
```

### 4. Create GitHub Release
1. Go to GitHub repository → Releases → Create new release
2. Choose the tag you just created
3. Add release title: `v{VERSION} - {RELEASE_NAME}`
4. Copy release notes from CHANGELOG.md
5. Mark as pre-release if applicable

## Version Milestones

### Pre-1.0 (Current Phase)
- `0.1.0` - Initial MVP release
- `0.2.0` - Major UI/UX improvements (adaptive cards, improved labels, inline metadata)
- `0.3.0` - Advanced features (full search, filters, enhanced assignees)
- `0.4.0` - Dashboard refactoring with dual-purpose view
- `0.5.0` - Performance optimizations
- `0.6.0` - Beta release with all planned features

### 1.0 Release Criteria
- All planned features implemented
- Comprehensive test coverage
- Performance targets met
- Documentation complete
- No critical bugs

### Post-1.0
- `1.x.0` - Feature additions (backwards compatible)
- `2.0.0` - Major redesign or architecture changes

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch for features

### Supporting Branches
- `feature/*` - New features (merge to develop)
- `bugfix/*` - Bug fixes (merge to develop)
- `hotfix/*` - Emergency fixes (merge to main & develop)
- `release/*` - Release preparation

### Example Workflow
```bash
# Create feature branch
git checkout -b feature/add-time-tracking

# Work on feature...

# Merge to develop
git checkout develop
git merge feature/add-time-tracking

# Create release branch
git checkout -b release/0.2.0

# Update version, docs, etc.
npm version minor

# Merge to main
git checkout main
git merge release/0.2.0

# Tag release
git tag -a v0.2.0 -m "Release version 0.2.0"
git push origin main --tags
```

## Changelog Format

Each release should have an entry in CHANGELOG.md:

```markdown
## [0.2.0] - 2025-01-10

### Added
- Time tracking feature for cards
- Bulk operations for card management
- Export functionality for boards

### Changed
- Improved drag and drop performance
- Updated UI theme with better contrast

### Fixed
- Card position not saving correctly
- Memory leak in board view

### Security
- Updated dependencies to patch vulnerabilities
```

## Version Badge
Add version badge to README.md:
```markdown
![Version](https://img.shields.io/github/package-json/v/melon-hub/task-manager-app)
![Release](https://img.shields.io/github/v/release/melon-hub/task-manager-app)
```

## Automation (Future)
Consider implementing:
- Automated version bumping with conventional commits
- Automated changelog generation
- CI/CD pipeline for releases
- Automated GitHub release creation