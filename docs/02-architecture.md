# Architecture

## Technology Stack

### Frontend

| Komponen       | Teknologi                |
| :------------- | :----------------------- |
| UI Framework   | React 19, Vite           |
| Styling        | Tailwind CSS v4          |
| Components     | shadcn/ui                |
| State          | Zustand                  |
| Data Fetching  | TanStack Query           |
| Tables         | TanStack Table           |
| Charts         | Recharts                 |
| Forms          | React Hook Form          |
| Animation      | Framer Motion            |
| Icons          | Lucide React             |

### Backend & Runtime

| Komponen            | Teknologi                  |
| :------------------ | :------------------------- |
| Runtime             | Bun                        |
| Web Framework       | Hono (REST + WebSocket)    |
| Database            | SQLite + Drizzle ORM       |
| System Integration  | systeminformation, pidusage, fs-extra, systemctl |
| Logger              | Pino (dengan rotasi)       |

## Architecture Flow

```
Browser
     │
     ▼
React + Vite (Frontend)
     │
 REST / WebSocket (Adaptive, dengan reconnect)
     │
     ▼
Hono API (Bun Backend)
     │
 ├── Core Modules (SQLite, systeminformation, network, audit log)
 └── Plugin Engine (Dynamic Load + Permission Enforcement)
      ├── node-pty (Terminal Plugin)
      ├── Docker SDK (Docker Plugin)
      └── File System (File Manager Plugin)
```

## Performa Backend

`systeminformation` nyaman tapi beberapa fungsinya (mis. deteksi hardware lengkap) relatif berat untuk polling frekuensi tinggi di perangkat 1 core/1GB. Untuk data yang dipoll setiap 1-2 detik (CPU/RAM/network), pertimbangkan baca langsung dari `/proc` dan cache hasil systeminformation yang statis (board info, dsb) alih-alih memanggilnya ulang tiap tick.
