# NodePanel — Gemini Context

You are helping build NodePanel, a modern lightweight Linux server dashboard for ARM SBCs (STB Armbian, Raspberry Pi, Orange Pi) and VPS.

## Stack

- **Runtime:** Bun
- **Backend:** Hono (REST + WebSocket)
- **Frontend:** React 19, Vite, Tailwind CSS v4, shadcn/ui
- **Database:** SQLite + Drizzle ORM
- **Realtime:** Adaptive WebSocket polling (1-2s active, 5-10s idle) with exponential backoff reconnection
- **System:** systeminformation, pidusage, fs-extra

## Architecture

- Core + Plugin system. Plugins inject sidebar menus, routes, pages, widgets, and backend APIs.
- Plugin Engine enforces permissions at runtime (not just declaratively).
- High-frequency polling reads `/proc` directly; static hardware info cached.
- Destructive actions always require explicit confirmation + audit log entry.

## Git Workflow

- Fitur baru dikerjakan di branch `feat/<nama-fitur>` (misal: `feat/backup-plugin`)
- `main` adalah branch stabil — tidak ada development langsung di `main`
- Merge hanya setelah fitur di-test dan berfungsi penuh

## Design System

- **Theme:** Arctic Slate (dark only)
- **Colors:** `#0B1017` bg, `#78A9FF` primary, `#4ADE80` success, `#F87171` danger
- **Font:** Geist (UI), Geist Mono (code), system font fallback
- **Icons:** Lucide React

## Key Constraints

- **No `any`, no `@ts-ignore`, no `@ts-expect-error`** — strict TypeScript
- Idle RAM target: 40-60 MB core, 60-100 MB with one plugin
- Startup under 2 seconds
- All destructive actions logged in audit trail (who, when, what)
- Adaptive WebSocket: reconnect with exponential backoff (1s→2s→5s→10s→cap 30s), fallback to REST polling
- RBAC: admin (full) / viewer (read-only)
- Mobile responsive

## References

Detailed documentation available in `docs/`:

| Document | Content |
|----------|---------|
| [01-vision.md](/docs/01-vision.md) | Vision, Goals, Success Criteria |
| [02-architecture.md](/docs/02-architecture.md) | Tech stack, architecture flow |
| [03-core-features.md](/docs/03-core-features.md) | Dashboard & System Management |
| [04-plugins.md](/docs/04-plugins.md) | Official plugins, manifest schema |
| [05-realtime-websocket.md](/docs/05-realtime-websocket.md) | Adaptive polling, reconnect |
| [06-security.md](/docs/06-security.md) | Auth, RBAC, audit log |
| [07-ui-ux.md](/docs/07-ui-ux.md) | Arctic Slate theme, typography |
| [08-performance.md](/docs/08-performance.md) | Target device, performance targets |
| [09-operations.md](/docs/09-operations.md) | Log rotation, backup, uninstall |
| [10-roadmap.md](/docs/10-roadmap.md) | v1.1 and v1.2 roadmap |

## Project Status

Pre-implementation. Full PRD breakdown available in `docs/`.
