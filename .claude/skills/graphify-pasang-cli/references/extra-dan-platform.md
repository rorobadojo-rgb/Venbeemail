# Extra dan platform graphify 0.9.112

## Extra (pasang hanya yang dibutuhkan)

| Extra | Untuk | Catatan |
|---|---|---|
| `mcp` | server MCP (`graphify-mcp`) | dipasang baku |
| `watch` | `graphify watch` (rebuild otomatis) | dipasang baku |
| `pdf` | baca PDF | dipasang baku |
| `office` | `.docx`, `.xlsx` | dipasang baku |
| `svg` | `graphify export svg` | dipasang baku; menarik matplotlib |
| `sql` | ekstraksi skema `.sql` | dipasang baku |
| `video` | transkripsi video/audio (faster-whisper, yt-dlp) | besar; hanya bila diminta |
| `leiden` | komunitas Leiden (lebih stabil dari Louvain) | mengubah semua komunitas; perlu namai ulang |
| `postgres` | `--postgres DSN` | butuh akses database |
| `neo4j`, `falkordb` | `--push` ke database graph | lihat graphify-ekspor-database |
| `anthropic`, `openai`, `gemini`, `ollama`, `bedrock`, `kimi` | backend API untuk `graphify extract` | isi file dikirim ke penyedia |
| `terraform`, `pascal`, `ocaml`, `commonlisp`, `robot`, `vbnet`, `r`, `erlang`, `solidity`, `dm` | bahasa khusus | pasang bila repo memakainya |
| `chinese` | segmentasi query bahasa Mandarin | tidak relevan di repo ini |
| `all` | semua di atas | sangat besar; tidak disarankan di cloud |

`uv tool install` mengganti daftar extra, tidak menambah. Selalu tulis daftar lengkap.

## Perintah pasang untuk asisten lain

| Asisten | Perintah |
|---|---|
| Claude Code (project) | `graphify install --project` |
| Claude Code (akun) | `graphify install` |
| Codex | `graphify install --platform codex` (pakai `$graphify`, bukan `/graphify`) |
| Cursor | `graphify cursor install` |
| Gemini CLI | `graphify install --platform gemini` |
| VS Code Copilot Chat | `graphify vscode install` |
| Agent Skills umum | `graphify install --platform agents` |

Pasang skill resmi menimpa hook di `.claude/settings.json`. Sesudahnya jalankan
`bungkus_hook.py` milik skill always-on.
