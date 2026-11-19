# Backend LLM untuk graphify extract

Urutan deteksi otomatis bila `--backend` tidak diberikan: Gemini, Kimi, Claude, OpenAI, DeepSeek,
Azure, Bedrock, Ollama. graphify mencetak variabel yang memilih backend. Paksa dengan `--backend` atau
`GRAPHIFY_BACKEND=<nama>`; matikan semua LLM dengan `GRAPHIFY_BACKEND=none`.

| Backend | Variabel | Extra | Lokasi data | Catatan |
|---|---|---|---|---|
| gemini | `GEMINI_API_KEY` atau `GOOGLE_API_KEY` | `gemini` | Google | |
| kimi | `MOONSHOT_API_KEY` | `kimi` | Moonshot AI (Tiongkok) | sebutkan lokasi data |
| claude | `ANTHROPIC_API_KEY` (opsional `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`) | `anthropic` | Anthropic | `GRAPHIFY_CLAUDE_PROMPT_CACHE=0` bila gateway menolak cache |
| openai | `OPENAI_API_KEY` (opsional `OPENAI_BASE_URL`, `OPENAI_MODEL`) | `openai` | OpenAI atau server kompatibel | juga untuk llama.cpp, vLLM, LM Studio lokal |
| deepseek | `DEEPSEEK_API_KEY` | `openai` | DeepSeek | |
| azure | `AZURE_OPENAI_API_KEY` + `AZURE_OPENAI_ENDPOINT` | `openai` | Azure | |
| bedrock | kredensial AWS (IAM) | `bedrock` | AWS | tanpa API key |
| ollama | `OLLAMA_BASE_URL` | `ollama` | lokal | satu-satunya pilihan untuk data yang tidak boleh keluar |
| claude-cli | CLI `claude` | - | Anthropic (langganan) | dipakai graphify sebagai cadangan pelabelan; `GRAPHIFY_CLAUDE_CLI_MODEL` |

Opsi berguna `graphify extract`:

- `--mode deep`: lebih banyak edge INFERRED.
- `--token-budget N`: batas token per potongan (default 60.000).
- `--max-concurrency N`: potongan paralel (default 4; 1 untuk model lokal).
- `--api-timeout S`: batas waktu per permintaan (default 600 detik).
- `--force`: abaikan cache dan manifest, proses ulang semuanya.

Jangan pernah meminta pengguna menempel API key di chat. Key masuk lewat variabel lingkungan atau
fitur kredensial lingkungan cloud.
