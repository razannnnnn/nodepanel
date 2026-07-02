# Realtime & WebSocket Strategy

## Adaptive Polling

| State            | Interval       | Data yang dikirim                                    |
| :--------------- | :------------- | :--------------------------------------------------- |
| **Active**       | 1-2 detik      | CPU, RAM, Network, Disk, Temperature, Docker Status  |
| **Idle/Background** | 5-10 detik  | Sama, atau dijeda penuh setelah N menit tanpa interaksi |

## Resiliency

- Reconnect otomatis dengan **exponential backoff**: 1s → 2s → 5s → 10s, cap 30s
- **Fallback** ke REST polling jika WebSocket gagal berulang kali
- **Indikator status koneksi** di UI: connected / reconnecting / offline agar user tidak salah baca data basi sebagai data realtime

## Performance Target

| Metric                  | Target     |
| :---------------------- | :--------- |
| WebSocket Latency       | < 100 ms   |
| WebSocket Reconnect     | < 5 detik (jaringan normal) |
