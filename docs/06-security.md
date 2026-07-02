# Security

## Authentication & Authorization

- Session-based Authentication & Password Hashing (argon2/bcrypt)
- **RBAC dasar:** role `admin` dan `viewer` — viewer tidak bisa eksekusi aksi destruktif
- **2FA (TOTP)** — P1, direkomendasikan mengingat banyak deployment headless/internet-facing

## Audit Log

Semua aksi destruktif tercatat dengan timestamp, user, dan hasil:

- Reboot & Shutdown
- Kill process
- Service stop
- Package remove
- Plugin install

## Plugin Permission Enforcement

Permission di `plugin.json` ditegakkan oleh Plugin Engine — bukan sekadar metadata deklaratif. Plugin tanpa permission `docker.sock` tidak bisa memanggil Docker API.

## Data Protection

- Secrets (session secret, API token) disimpan terenkripsi, bukan plaintext di SQLite
- CSRF Protection & Rate Limiting
- HTTPS Ready (self-signed / Let's Encrypt)

## Deployment Requirements

- Session-based Authentication & Password Hashing
- RBAC dasar (admin/viewer)
- Audit log untuk aksi destruktif
- CSRF Protection & Rate Limiting
- HTTPS Ready (Self-signed / Let's Encrypt)
- One-line install script + uninstall script
