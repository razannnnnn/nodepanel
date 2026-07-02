# Core Features

Prioritas fitur: **P0** (wajib MVP), **P1** (penting, menyusul cepat), **P2** (nice-to-have).

---

## Dashboard & Monitoring — P0

- Widgets: CPU, RAM, Storage, Temperature, Network, Uptime
- Charts: CPU, Memory, Network, Disk I/O
- Quick Actions:
  - Reboot, Shutdown, Restart Service, System Update
  - **Wajib:** modal konfirmasi eksplisit (ketik nama host / "confirm") untuk Reboot & Shutdown
  - **Wajib:** setiap aksi dicatat di audit log (siapa, kapan, aksi apa)
  - System Update: tampilkan daftar paket yang akan berubah sebelum eksekusi, bukan langsung `apt upgrade -y`

## System Management — P0

| Fitur             | Detail                                                          |
| :---------------- | :-------------------------------------------------------------- |
| **System Info**   | Hostname, Kernel, CPU, Memory, Board, Architecture, OS Version  |
| **Processes**     | Search, Sort, Kill Process (konfirmasi), Change Priority, Usage |
| **Services**      | systemctl wrapper: Start, Stop, Restart, Enable, Disable         |
| **Storage**       | Disk Usage, Partitions, Filesystem, Mount Points                |
| **Network**       | Interfaces, RX/TX, Gateway, DNS, IP Public/Private              |
| **Logs Viewer**   | journalctl & syslog: Search, Filter, Download, retention policy |
| **Package Manager** | apt wrapper: Update, Upgrade, Install, Remove, preview perubahan |
