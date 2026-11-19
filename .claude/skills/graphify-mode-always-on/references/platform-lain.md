# Always-on graphify di asisten lain

| Asisten | Perintah | Yang ditulis | Mekanisme |
|---|---|---|---|
| Claude Code | `graphify claude install` | bagian CLAUDE.md + hook PreToolUse/SessionStart | hook |
| CodeBuddy | `graphify codebuddy install` | CODEBUDDY.md + hook | hook |
| Gemini CLI | `graphify gemini install` | GEMINI.md + hook BeforeTool | hook |
| Codex | `graphify codex install` | bagian AGENTS.md | berkas instruksi |
| OpenCode | `graphify opencode install` | AGENTS.md + plugin tool.execute.before | plugin |
| Kilo Code | `graphify kilo install` | skill, perintah, AGENTS.md, plugin `.kilo` | plugin |
| Cursor | `graphify cursor install` | `.cursor/rules/graphify.mdc` (alwaysApply) | aturan |
| VS Code Copilot Chat | `graphify vscode install` | skill + `.github/copilot-instructions.md` | berkas instruksi |
| Aider, OpenClaw, Factory Droid, Trae | `graphify <nama> install` | bagian AGENTS.md | berkas instruksi |
| Kiro | `graphify kiro install` | skill + berkas steering | steering |
| Pi | `graphify install --platform pi` lalu `graphify pi guard install` | skill + ekstensi guard | ekstensi |
| Google Antigravity | `graphify antigravity install` | `.agents/rules`, `.agents/workflows`, skill | aturan |

Semua punya padanan `uninstall`. `graphify uninstall` mencopot dari semua platform yang terdeteksi.

Catatan:

- Codex memakai `$graphify`, bukan `/graphify`, dan butuh `multi_agent = true` di `~/.codex/config.toml`
  untuk ekstraksi paralel.
- Berkas instruksi (AGENTS.md dan sejenisnya) tidak memunculkan error saat CLI tidak ada; hanya
  platform hook yang perlu pembungkus aman.
- Satu repo dengan banyak asisten: hindari dua blok instruksi tanpa syarat untuk dua sumber graph
  berbeda (CLI dan MCP); pilih satu jalur utama.
