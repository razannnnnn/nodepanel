# Performance Target

## Target Device

| Kategori        | Spesifikasi                                                                     |
| :-------------- | :------------------------------------------------------------------------------ |
| **Supported**   | STB Armbian, Raspberry Pi, Orange Pi, Debian Server, Ubuntu Server, VPS Linux   |
| **Minimum**     | ARM64 / x86_64, Dual Core CPU, RAM 1 GB, storage eMMC/SD (perhatikan wear)      |
| **Recommended** | Quad Core CPU, RAM 2 GB+, SSD/eMMC                                              |

> **Catatan:** Pada perangkat 1GB RAM, target RAM harus divalidasi dengan benchmark nyata sebelum rilis — bukan asumsi.

## Metrics

| Metric                         | Target                          |
| ------------------------------ | ------------------------------- |
| **Startup**                    | < 2 detik                       |
| **Idle RAM — Core saja**       | 40-60 MB                        |
| **Idle RAM — Core + 1 plugin** | 60-100 MB (validasi per plugin) |
| **Idle CPU**                   | < 1%                            |
| **Dashboard Load**             | < 1 detik                       |
| **WebSocket Latency**          | < 100 ms                        |
| **WebSocket Reconnect**        | < 5 detik (jaringan normal)     |

> Target RAM dipecah per komponen agar realistis dan bisa diverifikasi lewat benchmark aktual di perangkat 1GB.
