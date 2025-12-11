# Project Management

> **For AI Agents**: Read this folder and all subfolders before starting any work.

## Folder Structure

```
project-management/
├── README.md                 ← You are here (start here!)
├── project-context/          ← Background info about the project
│   └── orbit-pwa-context.md  ← Full technical context
├── project-planning/         ← Implementation plans
│   └── pwa-conversion-plan.md ← Detailed step-by-step plan
└── project-todo/             ← Task tracking
    └── pwa-conversion-todo.md ← Checklist to mark progress
```

## Quick Start for Agents

### 1. Read Context First
```
project-context/orbit-pwa-context.md
```
Contains: Tech stack, directory structure, key files, design system, database schema, auth flow, and all technical details needed to understand the project.

### 2. Read the Plan
```
project-planning/pwa-conversion-plan.md
```
Contains: Step-by-step implementation guide, files to create/modify, code examples, and success criteria.

### 3. Track Progress
```
project-todo/pwa-conversion-todo.md
```
Contains: Checklist of all tasks. **Update this file as you complete work!**

## Current Project: PWA Conversion

**Goal**: Convert Orbit webapp to a Progressive Web App

**Scope**:
- Basic offline support (cached assets, offline indicator)
- Installability on Android & iOS
- Fast subsequent loads
- No push notifications (for now)

**Project Location**: `../orbit/`

## How to Update Todo

When you complete a task, change:
```markdown
- [ ] Task description
```
To:
```markdown
- [x] Task description
```

Also update the Completion Status table at the bottom of the todo file.

## Important Notes

- The webapp is in the `orbit/` directory (sibling to this folder)
- GitHub backup: https://github.com/nicojaroszewski/orbit-messenger
- Restore point commit: `bad7bae`
- All commands should run from the `orbit/` directory
