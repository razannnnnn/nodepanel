# Operational Concerns

## Log Rotation

journal/log viewer dan Pino logger wajib punya retensi & rotasi otomatis — penting karena eMMC/SD card di STB/RPi cepat aus dan cepat penuh.

## Self-Update NodePanel

Mekanisme update Core sendiri (bukan hanya `apt upgrade` sistem), idealnya dengan **rollback** jika update gagal.

## Backup Settings DB

SQLite settings/audit log di-backup terpisah dari Backups Plugin (yang fokus ke data user), agar konfigurasi panel sendiri tidak hilang.

## Uninstall Script

One-line install script perlu pasangan **uninstall yang bersih**: services, systemd unit, file config.

## Storage Wear pada eMMC/SD

- Hindari write berlebihan ke disk
- Log rotation untuk mencegah log membengkak
- Cache di RAM untuk data polling frekuensi tinggi
- Backup settings DB secara periodik ke lokasi terpisah
