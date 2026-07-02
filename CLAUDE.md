# NodePanel — Context for Claude

## What is NodePanel?

NodePanel is a modern lightweight Linux server dashboard for headless ARM devices (STB Armbian, Raspberry Pi, Orange Pi) and VPS. Think lightweight alternative to Cockpit, built with modern tooling.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Bun | Fast startup, built-in TS support, native SQLite |
| Backend framework | Hono | Lightweight, excellent WS support, Bun-native |
| Frontend framework | React 19 + Vite | Fast HMR, modern ecosystem |
| Styling | Tailwind CSS v4 | Zero-runtime, consistent design system |
| Database | SQLite + Drizzle ORM | Zero-dependency, migration support |
| State management | Zustand + TanStack Query | Minimal boilerplate, caching built-in |
| Real-time | Adaptive WebSocket polling | Balance of freshness and resource usage |

## File Structure Convention

```
src/
├── api/           # Route handlers per resource
├── components/
│   ├── ui/        # Shared UI components (shadcn)
│   └── features/  # Feature-specific components
├── hooks/         # Shared React hooks
├── stores/        # Zustand stores
├── lib/           # Utilities, API client
├── plugins/       # Plugin system
└── types/         # TypeScript type definitions
```

## Git Workflow

- Setiap fitur baru dikerjakan di branch `feat/<nama-fitur>` (contoh: `feat/file-manager`)
- Branch `main` hanya berisi kode yang sudah stabil dan teruji
- Fitur harus di-test dan berfungsi penuh sebelum di-merge ke `main`

## Critical Rules

1. All destructive actions (reboot, shutdown, kill, service stop, package remove) must have:
   - Explicit modal confirmation (type hostname or "confirm")
   - Audit log entry (user, timestamp, action, result)
2. Plugin permissions are enforced at runtime — a plugin without `docker.sock` permission cannot access Docker API
3. High-frequency polling (>1s interval) reads `/proc` directly, not through `systeminformation`
4. Static system info (board, kernel, etc.) is cached after first read
5. WebSocket must handle reconnection with exponential backoff and show connection status in UI
6. Secrets (session secret, tokens) are encrypted at rest

## UI Rules

- Dark theme only: Arctic Slate (`#0B1017` background)
- Font: Geist (UI), Geist Mono (code), system fallback
- Layout: Sidebar navigation, content area, optional widget grid
- Mobile responsive: sidebar collapses
- Loading states for all async operations
- Error boundaries per feature section

## Plugin Manifest Structure

```json
{
  "name": "nodepanel-plugin-<name>",
  "version": "1.0.0",
  "permissions": ["<scope>"],
  "apiVersion": "1.x",
  "entry": "dist/index.js",
  "checksum": "sha256:<hash>"
}
```

## Performance Constraints

- Startup < 2s
- Idle RAM: 40-60 MB (core), 60-100 MB (+plugin)
- Idle CPU < 1%
- Dashboard render < 1s
- WS latency < 100ms
- Target device: 1 GB RAM, dual-core ARM64/x86_64

## Project Docs

Detailed breakdown in `docs/`:

| File | Content |
|------|---------|
| [01-vision.md](/docs/01-vision.md) | Vision, goals, success criteria |
| [02-architecture.md](/docs/02-architecture.md) | Tech stack, architecture flow |
| [03-core-features.md](/docs/03-core-features.md) | Dashboard & system management |
| [04-plugins.md](/docs/04-plugins.md) | Plugin list, manifest, engine |
| [05-realtime-websocket.md](/docs/05-realtime-websocket.md) | Polling, reconnect strategy |
| [06-security.md](/docs/06-security.md) | Auth, RBAC, audit, permission |
| [07-ui-ux.md](/docs/07-ui-ux.md) | Theme, colors, typography |
| [08-performance.md](/docs/08-performance.md) | Specs, benchmarks |
| [09-operations.md](/docs/09-operations.md) | Log rotation, self-update, backup |
| [10-roadmap.md](/docs/10-roadmap.md) | v1.1, v1.2 plans |

## Current Phase

Pre-implementation. Full PRD breakdown in `docs/`.
