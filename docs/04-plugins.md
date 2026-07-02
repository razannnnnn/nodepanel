# Official Plugins

Fitur yang butuh resource lebih besar atau akses sistem sensitif dipisah sebagai plugin opsional.

## Daftar Plugin

| Plugin           | Fungsi                                                               | Level Akses                    |
| :--------------- | :------------------------------------------------------------------- | :----------------------------- |
| **Terminal**     | Web terminal via node-pty, multi-tab, auto-reconnect                 | Shell penuh — risiko tertinggi |
| **File Manager** | Upload/Download/Rename/Move/Compress/chmod/chown                     | Filesystem                     |
| **Docker**       | Containers, Images, Volumes, Networks, Logs, Console                 | docker.sock — setara root      |
| **Firewall**     | GUI untuk iptables/ufw                                               | Network/system                 |
| **Cron Jobs**    | Create/Edit/Delete/Enable/Disable                                    | Scheduler                      |
| **Backups**      | Backup config, DB settings, Docker volumes; restore; schedule; export | Filesystem + storage eksternal |

> **Catatan keamanan:** Terminal dan Docker plugin secara efektif setara akses root ke host. Instalasi keduanya wajib menampilkan peringatan eksplisit tentang cakupan akses sebelum aktivasi.

## Plugin Manifest (`plugin.json`)

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

### Field Description

| Field         | Keterangan                                                              |
| :------------ | :---------------------------------------------------------------------- |
| `name`        | Nama plugin, unik                                                       |
| `version`     | Semver plugin                                                            |
| `author`      | Pembuat plugin                                                          |
| `permissions` | Permission yang dibutuhkan, ditegakkan oleh Plugin Engine               |
| `apiVersion`  | Mencegah plugin lama memanggil API Core yang sudah berubah/breaking     |
| `entry`       | Entry point plugin                                                      |
| `checksum`    | Verifikasi integritas sebelum load, penting saat Plugin Marketplace aktif |

## Plugin Architecture

Plugin dapat menginjeksi: Sidebar Menu, Routes, Pages, Widgets, dan Backend API — dieksekusi melalui Plugin Engine yang **menegakkan** permission, bukan hanya membacanya.

Keamanan:
- Permission di `plugin.json` ditegakkan oleh Plugin Engine (plugin tanpa permission `docker.sock` tidak bisa memanggil Docker API)
- Plugin berjalan dalam proses/worker terisolasi jika memungkinkan, agar crash plugin tidak menjatuhkan Core
