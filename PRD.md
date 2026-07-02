# NodePanel PRD

## Modern Lightweight Linux Server Dashboard

**Version:** 1.1 (Optimized Core)
**Status:** Draft — Revisi
**Target Platform:** Armbian, Debian, Ubuntu (ARM64 & x86_64)

> **Catatan revisi dari v1.0:** Versi ini menambahkan safety guard untuk aksi destruktif, model keamanan plugin, strategi reconnect WebSocket, operational concerns (log rotation, self-update, backup), RBAC dasar, serta target performa yang lebih realistis dan terukur per komponen. Prioritas fitur ditandai P0 (wajib MVP), P1 (penting, bisa menyusul cepat), P2 (nice-to-have).

---

## 1. Vision

NodePanel adalah dashboard web modern untuk server Linux ringan seperti STB Armbian, Raspberry Pi, Orange Pi, Mini PC, dan VPS. Fokus utama: administrasi server yang cepat, ringan, modern, dan mudah digunakan tanpa mengorbankan performa maupun keamanan.

NodePanel bukan pengganti Proxmox atau Cockpit — melainkan panel administrasi ringan dengan antarmuka modern, arsitektur _Core + Plugin_, dan model keamanan yang jelas untuk perangkat yang sering diakses jarak jauh tanpa konsol fisik.

---

## 2. Goals & Non-Goals

### Goals

- Startup < 2 detik
- RAM idle rendah, terukur per komponen (lihat §12)
- CPU idle < 1%
- Monitoring realtime adaptif
- Modular & extensible (Core + Plugin) dengan **permission yang ditegakkan**, bukan sekadar dideklarasikan
- Aman untuk perangkat headless: aksi destruktif selalu punya konfirmasi + audit log
- Responsive & mobile friendly

### Non-Goals (v1)

- AI Assistant
- VPN Manager
- Hypervisor / Virtual Machine Manager
- Kubernetes
- Database Hosting
- Multi-tenant / multi-organization (RBAC v1 hanya single-admin + user tambahan opsional, lihat §8)

---

## 3. Target Device

| Kategori        | Spesifikasi                                                                     |
| :-------------- | :------------------------------------------------------------------------------ |
| **Supported**   | STB Armbian, Raspberry Pi, Orange Pi, Debian Server, Ubuntu Server, VPS Linux   |
| **Minimum**     | ARM64 / x86_64, Dual Core CPU, RAM 1 GB, storage eMMC/SD (perhatikan wear, §13) |
| **Recommended** | Quad Core CPU, RAM 2 GB+, SSD/eMMC                                              |

**Catatan:** Pada perangkat 1GB RAM, target RAM di §12 harus divalidasi dengan benchmark nyata sebelum rilis — bukan asumsi.

---

## 4. UI/UX Identity

### Design Philosophy

Fast, Clean, Minimal, Developer First, Enterprise Look, Low Resource Usage.

### Theme & Colors (Arctic Slate)

| Element          | Color Code |
| :--------------- | :--------- |
| **Background**   | `#0B1017`  |
| **Sidebar**      | `#101722`  |
| **Card**         | `#141D2A`  |
| **Primary**      | `#78A9FF`  |
| **Success**      | `#4ADE80`  |
| **Danger**       | `#F87171`  |
| **Text Primary** | `#E6EDF7`  |

### Typography & Icons

- **UI Font:** Geist
- **Monospace Font:** Geist Mono
- **Icon Library:** Lucide React
- **Fallback:** sediakan system-font fallback (agar tidak menambah initial load di koneksi VPS lambat)

---

## 5. Core Features (V1 Base)

### Dashboard & Monitoring — P0

- Widgets: CPU, RAM, Storage, Temperature, Network, Uptime
- Charts: CPU, Memory, Network, Disk I/O
- Quick Actions: Reboot, Shutdown, Restart Service, System Update
  - **Wajib:** modal konfirmasi eksplisit (ketik nama host / "confirm") untuk Reboot & Shutdown
  - **Wajib:** setiap aksi dicatat di audit log (siapa, kapan, aksi apa) — lihat §8
  - System Update: tampilkan daftar paket yang akan berubah sebelum eksekusi, bukan langsung `apt upgrade -y`

### System Management — P0

- System Info: Hostname, Kernel, CPU, Memory, Board, Architecture, OS Version
- Processes: Search, Sort, Kill Process (dengan konfirmasi), Change Priority, CPU/Mem Usage
- Services: `systemctl` wrapper (Start, Stop, Restart, Enable, Disable)
- Storage: Disk Usage, Partitions, Filesystem, Mount Points
- Network: Interfaces, RX/TX, Gateway, DNS, IP Public/Private
- Logs Viewer: `journalctl` & `syslog` (Search, Filter, Download) + **retention policy** (lihat §13)
- Package Manager: `apt` wrapper (Update, Upgrade, Install, Remove) dengan preview perubahan

---

## 6. Official Plugins (Modular Features)

Fitur yang butuh resource lebih besar atau akses sistem sensitif dipisah sebagai plugin opsional.

| Plugin           | Fungsi                                                                | Level Akses                    |
| :--------------- | :-------------------------------------------------------------------- | :----------------------------- |
| **Terminal**     | Web terminal via `node-pty`, multi-tab, auto-reconnect                | Shell penuh — risiko tertinggi |
| **File Manager** | Upload/Download/Rename/Move/Compress/chmod/chown                      | Filesystem                     |
| **Docker**       | Containers, Images, Volumes, Networks, Logs, Console                  | `docker.sock` — setara root    |
| **Firewall**     | GUI untuk `iptables`/`ufw`                                            | Network/system                 |
| **Cron Jobs**    | Create/Edit/Delete/Enable/Disable                                     | Scheduler                      |
| **Backups**      | Backup config, DB settings, Docker volumes; restore; schedule; export | Filesystem + storage eksternal |

**Catatan keamanan:** Terminal dan Docker plugin secara efektif setara akses root ke host. Instalasi keduanya wajib menampilkan peringatan eksplisit tentang cakupan akses sebelum aktivasi.

---

## 7. Realtime & WebSocket Strategy

**Adaptive Polling:**

- **Active (tab dilihat):** interval 1–2 detik
- **Idle/Background:** interval 5–10 detik, atau dijeda penuh setelah N menit tanpa interaksi
- **Data:** CPU, RAM, Network, Disk, Temperature, Docker Status

**Resiliency (baru):**

- Reconnect otomatis dengan exponential backoff (mis. 1s → 2s → 5s → 10s, cap 30s)
- Fallback ke REST polling jika WebSocket gagal berulang kali
- Indikator status koneksi di UI (connected / reconnecting / offline) agar user tidak salah baca data basi sebagai data realtime

---

## 8. Security

- Session-based Authentication & Password Hashing (argon2/bcrypt)
- **RBAC dasar (baru):** role `admin` dan `viewer` minimal — viewer tidak bisa eksekusi aksi destruktif
- **Audit Log (baru):** semua aksi destruktif (reboot, shutdown, kill process, service stop, package remove, plugin install) tercatat dengan timestamp, user, dan hasil
- **Plugin Permission Enforcement (baru):** permission di `plugin.json` ditegakkan oleh Plugin Engine (mis. plugin tanpa permission `docker.sock` tidak bisa memanggil Docker API), bukan sekadar metadata deklaratif
- Secrets (session secret, API token) disimpan terenkripsi, bukan plaintext di SQLite
- CSRF Protection & Rate Limiting
- HTTPS Ready (self-signed / Let's Encrypt)
- 2FA (TOTP) — **P1**, direkomendasikan mengingat banyak deployment headless/internet-facing

---

## 9. Technology Stack

### Frontend

- React 19, Vite, Tailwind CSS v4
- shadcn/ui, Framer Motion, Lucide React
- Zustand, TanStack Query, TanStack Table
- Recharts, React Hook Form

### Backend & Runtime

- Bun (Runtime)
- Hono (Web Framework + WebSocket)
- SQLite + Drizzle ORM (Settings/Logs/Audit)
- Integrasi Sistem: `systeminformation`, `pidusage`, `fs-extra`, `systemctl`
- Logger: Pino (dengan rotasi, lihat §13)

**Catatan performa:** `systeminformation` nyaman tapi beberapa fungsinya (mis. deteksi hardware lengkap) relatif berat untuk polling frekuensi tinggi di perangkat 1 core/1GB. Untuk data yang dipoll setiap 1–2 detik (CPU/RAM/network), pertimbangkan baca langsung dari `/proc` dan cache hasil `systeminformation` yang statis (board info, dsb) alih-alih memanggilnya ulang tiap tick.

---

## 10. Plugin Architecture

Plugin dapat menginjeksi: Sidebar Menu, Routes, Pages, Widgets, dan Backend API — dieksekusi melalui Plugin Engine yang **menegakkan** permission, bukan hanya membacanya.

**Contoh Manifest (`plugin.json`):**

```json
{
  "name": "nodepanel-plugin-docker",
  "version": "1.0.0",
  "author": "NodePanel Team",
  "permissions": ["docker.sock", "network"],
  "apiVersion": "1.x",
  "entry": "dist/index.js",
  "checksum": "sha256:..."
}
```

**Tambahan untuk v1.1:**

- `apiVersion`: mencegah plugin lama memanggil API Core yang sudah berubah/breaking
- `checksum`: verifikasi integritas sebelum load, terutama penting saat Plugin Marketplace (v1.2) aktif
- Plugin berjalan dalam proses/worker terisolasi jika memungkinkan, agar crash plugin tidak menjatuhkan Core

---

## 11. Architecture Flow

```text
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

---

## 12. Performance Target

| Metric                         | Target                          |
| ------------------------------ | ------------------------------- |
| **Startup**                    | < 2 sec                         |
| **Idle RAM — Core saja**       | 40–60 MB                        |
| **Idle RAM — Core + 1 plugin** | 60–100 MB (validasi per plugin) |
| **Idle CPU**                   | < 1%                            |
| **Dashboard Load**             | < 1 sec                         |
| **WebSocket Latency**          | < 100 ms                        |
| **WebSocket Reconnect**        | < 5 sec pada jaringan normal    |

Target RAM dipecah per komponen agar realistis dan bisa diverifikasi lewat benchmark aktual di perangkat 1GB, bukan diasumsikan dari awal.

---

## 13. Operational Concerns (baru)

- **Log Rotation:** journal/log viewer dan Pino logger wajib punya retensi & rotasi otomatis — penting karena eMMC/SD card di STB/RPi cepat aus dan cepat penuh
- **Self-Update NodePanel:** mekanisme update Core sendiri (bukan hanya `apt upgrade` sistem), idealnya dengan rollback jika update gagal
- **Backup Settings DB:** SQLite settings/audit log di-backup terpisah dari Backups Plugin (yang fokus ke data user), agar konfigurasi panel sendiri tidak hilang
- **Uninstall Script:** one-line install script (§14) perlu pasangan uninstall yang bersih (services, systemd unit, file config)

---

## 14. Security & Deployment Requirements

- Session-based Authentication & Password Hashing
- RBAC dasar (admin/viewer)
- Audit log untuk aksi destruktif
- CSRF Protection & Rate Limiting
- HTTPS Ready (Self-signed / Let's Encrypt)
- One-line install script (Armbian/Debian) + uninstall script

---

## 15. Future Roadmap

### Version 1.1 (revisi prioritas)

- **Notification Center — dinaikkan prioritas** (terkait erat dengan audit log & aksi destruktif di §8)
- **Health Score — dinaikkan prioritas** (nilai keamanan operasional tinggi untuk perangkat headless)
- Multi Server Support
- Theme Customizer

### Version 1.2

- Plugin Marketplace (dengan verifikasi checksum & review keamanan minimal)
- Remote Node Management
- Scheduled Reports

---

## 16. Success Criteria

- Modern UI dengan performa sekelas aplikasi native, tervalidasi lewat benchmark nyata di perangkat 1GB RAM (bukan target aspirasional)
- Stabil berjalan 24/7 pada perangkat ARM 1GB tanpa memory leak selama minimal 7 hari uji ketahanan
- Tidak ada aksi destruktif yang bisa dieksekusi tanpa konfirmasi eksplisit dan tercatat di audit log
- Ekosistem plugin berjalan dengan permission yang benar-benar ditegakkan, bukan hanya dideklarasikan
- Proses deployment sangat mudah: one-line install _dan_ uninstall untuk Armbian/Debian
