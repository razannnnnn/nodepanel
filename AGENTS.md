# NodePanel — Agent Context

## Project Overview

NodePanel is a modern lightweight Linux server dashboard for STB Armbian, Raspberry Pi, Orange Pi, Mini PC, and VPS. Built for fast, headless server administration with a Core + Plugin architecture.

## Tech Stack

- **Runtime:** Bun
- **Backend:** Hono (REST + WebSocket)
- **Frontend:** React 19, Vite, Tailwind CSS v4
- **UI Library:** shadcn/ui, Framer Motion, Lucide React
- **State/Data:** Zustand, TanStack Query, TanStack Table
- **Charts:** Recharts
- **Forms:** React Hook Form
- **Database:** SQLite + Drizzle ORM
- **Logger:** Pino (with rotation)
- **System Integration:** systeminformation, pidusage, fs-extra

## Architecture

```
Browser → React + Vite → REST/WS (adaptive polling) → Hono API (Bun Backend)
  ├── Core Modules (SQLite, systeminformation, network, audit log)
  └── Plugin Engine (Dynamic Load + Permission Enforcement)
       ├── node-pty (Terminal Plugin)
       ├── Docker SDK (Docker Plugin)
       └── File System (File Manager Plugin)
```

## Key Conventions

### Code Style
- TypeScript strict mode throughout
- No `any`, `@ts-ignore`, or `@ts-expect-error`
- Prefer `const` over `let`, avoid `var`
- Use `import type` for type-only imports
- Use arrow functions for components and callbacks
- Destructure props at component declaration

### File Structure
- Feature-based grouping under `src/`
- API routes mirror resource structure (RESTful)
- Shared components in `src/components/ui/`
- Hooks in `src/hooks/`, stores in `src/stores/`
- Plugin packages prefixed `nodepanel-plugin-*`

### Backend
- Route handlers in separated files per resource
- WebSocket handling through Hono WS middleware
- Service layer between routes and system calls
- Direct `/proc` reads for high-frequency polling (CPU/RAM/network)
- Cache static `systeminformation` results (board info, etc.)
- Validation with Zod on all API inputs

### Frontend
- Tailwind CSS v4 utility classes, minimal custom CSS
- Arctic Slate theme: `#0B1017` bg, `#78A9FF` primary, `#4ADE80` success, `#F87171` danger
- Async operations with TanStack Query (loading/error/success states)
- Real-time data via WebSocket with reconnection fallback
- Modals for destructive actions with explicit confirmations

### Database
- SQLite via Drizzle ORM
- Schema changes through Drizzle migrations
- Settings, logs, and audit trail stored in SQLite

## Performance Targets

| Metric | Target |
|--------|--------|
| Startup | < 2s |
| Idle RAM (Core) | 40-60 MB |
| Idle RAM (+1 plugin) | 60-100 MB |
| Idle CPU | < 1% |
| Dashboard load | < 1s |
| WS latency | < 100ms |

## Security Rules

- All destructive actions require explicit confirmation modal + audit log entry
- Argon2/bcrypt for password hashing
- RBAC: admin (full) / viewer (read-only)
- Plugin permissions enforced at runtime by Plugin Engine
- Secrets encrypted at rest in SQLite
- CSRF protection + rate limiting on all API routes

## References

Seluruh dokumentasi proyek tersimpan di `docs/`:

| Doc | Isi |
|-----|-----|
| [01-vision.md](/docs/01-vision.md) | Vision, Goals, Non-Goals, Success Criteria |
| [02-architecture.md](/docs/02-architecture.md) | Tech stack, architecture flow |
| [03-core-features.md](/docs/03-core-features.md) | Dashboard & System Management features |
| [04-plugins.md](/docs/04-plugins.md) | Official plugins, manifest, plugin engine |
| [05-realtime-websocket.md](/docs/05-realtime-websocket.md) | Adaptive polling, reconnect strategy |
| [06-security.md](/docs/06-security.md) | Auth, RBAC, audit log, permission enforcement |
| [07-ui-ux.md](/docs/07-ui-ux.md) | Design philosophy, Arctic Slate theme |
| [08-performance.md](/docs/08-performance.md) | Target device specs, performance metrics |
| [09-operations.md](/docs/09-operations.md) | Log rotation, self-update, backup, uninstall |
| [10-roadmap.md](/docs/10-roadmap.md) | Future roadmap |

## Current Status

Project in early stage — no implementation yet. Full PRD breakdown available in `docs/`.
