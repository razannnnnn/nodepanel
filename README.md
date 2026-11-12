# NodePanel

Modern lightweight Linux server dashboard for STB Armbian, Raspberry Pi, Orange Pi, Mini PC, and VPS. Built with Bun + Hono + React, designed for fast headless server administration.

## Features

- **Dashboard** — CPU, RAM, Storage, Network, Temperature, Uptime widgets with real-time charts
- **System Management** — Info, Processes, Services, Storage, Network, Logs, Package Manager
- **Real-time Monitoring** — WebSocket with adaptive polling and auto-reconnect
- **Security** — RBAC (admin/viewer), audit log, confirmation modals for destructive actions
- **Plugin System** — Core + Plugin architecture with runtime permission enforcement
- **Plugins** — Terminal (web shell), Docker Manager, File Manager, Firewall, Cron, Backups

## Tech Stack

| Layer | Stack |
|-------|-------|
| Runtime | [Bun](https://bun.sh) |
| Backend | [Hono](https://hono.dev) (REST + WebSocket) |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| UI | shadcn/ui, Framer Motion, Lucide React |
| State | Zustand, TanStack Query |
| Charts | Recharts |
| Database | SQLite + Drizzle ORM |
| Logger | Pino |

## Quick Start (Development)

```bash
# Install dependencies
bun install

# Run backend (port 3001)
bun run dev:server

# Run frontend (Vite dev server)
bun run dev
```

## One-Line Install (Production)

```bash
curl -fsSL https://raw.githubusercontent.com/razannnnnn/nodepanel/main/install.sh | sudo bash
```

This installs Bun, clones the project to `/opt/nodepanel`, sets up systemd, and starts the panel on port `3001`.

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/razannnnnn/nodepanel/main/uninstall.sh -o ~/uninstall.sh
sudo bash ~/uninstall.sh
```

This stops and disables the service, removes the systemd unit, and deletes `/opt/nodepanel`.

The data directory `/etc/nodepanel` is **kept** by default, so reinstalling keeps your users, audit log, and logs. To remove it as well:

```bash
sudo bash ~/uninstall.sh --purge
```

`--purge` asks you to type `yes` before deleting the database. Add `--yes` to skip that prompt in automation.

| Command | Service + `/opt/nodepanel` | `/etc/nodepanel` | `bun` symlink |
|---|:--:|:--:|:--:|
| `uninstall.sh` | removed | kept | kept |
| `uninstall.sh --purge` | removed | removed | removed if it points into a `.bun` install |

Never removed in either mode: apt packages, the Bun runtime in `~/.bun`, and swap.

Back up the database first if you intend to purge and might reinstall later:

```bash
sudo tar czf ~/nodepanel-data.tar.gz -C /etc nodepanel
```

## Project Structure

```
nodepanel/
├── server/          # Hono backend (routes, middleware, lib)
│   ├── routes/      # API route handlers
│   ├── middleware/   # Auth middleware
│   ├── lib/          # System utilities
│   ├── config.ts     # App configuration
│   ├── db.ts         # SQLite setup
│   └── ws.ts         # WebSocket handler
├── src/             # React frontend
│   ├── components/  # UI components
│   ├── pages/       # Route pages
│   ├── hooks/       # Custom hooks
│   ├── stores/      # Zustand stores
│   ├── layout/      # App shell (sidebar, topbar)
│   └── styles/      # Global CSS
├── docs/            # Documentation
└── install.sh       # Production install script
```

## Default Login

After installation, access at `http://<your-ip>:3001`:

- **User:** `admin`
- **Pass:** `nodepanel`

## Performance Targets

| Metric | Target |
|--------|--------|
| Startup | < 2s |
| Idle RAM (Core) | 40-60 MB |
| Idle CPU | < 1% |
| Dashboard load | < 1s |

## Target Devices

- Armbian STB (S905, S912, H6, etc.)
- Raspberry Pi (3B+, 4, 5)
- Orange Pi / Rockchip boards
- Mini PC (x86_64)
- VPS (any Linux with systemd)

## License

MIT
