# Vision & Goals

## Vision

NodePanel adalah dashboard web modern untuk server Linux ringan seperti STB Armbian, Raspberry Pi, Orange Pi, Mini PC, dan VPS. Fokus utama: administrasi server yang cepat, ringan, modern, dan mudah digunakan tanpa mengorbankan performa maupun keamanan.

NodePanel bukan pengganti Proxmox atau Cockpit — melainkan panel administrasi ringan dengan antarmuka modern, arsitektur Core + Plugin, dan model keamanan yang jelas untuk perangkat yang sering diakses jarak jauh tanpa konsol fisik.

## Goals

- Startup < 2 detik
- RAM idle rendah, terukur per komponen
- CPU idle < 1%
- Monitoring realtime adaptif
- Modular & extensible (Core + Plugin) dengan permission yang ditegakkan, bukan sekadar dideklarasikan
- Aman untuk perangkat headless: aksi destruktif selalu punya konfirmasi + audit log
- Responsive & mobile friendly

## Non-Goals (v1)

- AI Assistant
- VPN Manager
- Hypervisor / Virtual Machine Manager
- Kubernetes
- Database Hosting
- Multi-tenant / multi-organization

## Success Criteria

- Modern UI dengan performa sekelas aplikasi native, tervalidasi lewat benchmark nyata di perangkat 1GB RAM
- Stabil berjalan 24/7 pada perangkat ARM 1GB tanpa memory leak selama minimal 7 hari uji ketahanan
- Tidak ada aksi destruktif yang bisa dieksekusi tanpa konfirmasi eksplisit dan tercatat di audit log
- Ekosistem plugin berjalan dengan permission yang benar-benar ditegakkan, bukan hanya dideklarasikan
- Proses deployment sangat mudah: one-line install dan uninstall untuk Armbian/Debian
