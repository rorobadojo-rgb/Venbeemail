# Konfigurasi server MCP graphify

Alat yang ditawarkan server: `query_graph`, `get_node`, `get_neighbors`, `get_section`, `get_community`,
`god_nodes`, `graph_stats`, `shortest_path`, serta `list_prs`, `get_pr_impact`, `triage_prs` (butuh GitHub CLI).

## Claude Code, satu project (.mcp.json di akar repo)

```bash
claude mcp add --scope project graphify -- graphify-mcp --graph /home/user/Venbeemail/graphify-out/graph.json
```

Hasilnya kurang lebih:

```json
{
  "mcpServers": {
    "graphify": {
      "command": "graphify-mcp",
      "args": ["--graph", "/home/user/Venbeemail/graphify-out/graph.json"]
    }
  }
}
```

Catatan sesi cloud: container baru belum punya `graphify-mcp`, jadi server gagal dijalankan sampai CLI
dipasang. Untuk sesi cloud, CLI dan aturan always-on biasanya cukup.

## Claude Desktop (claude_desktop_config.json)

Claude Desktop tidak menjalankan `$(...)`. Pakai path absolut interpreter graphify:

```bash
head -1 "$(command -v graphify)" | tr -d '#!'    # contoh: /Users/nama/.local/share/uv/tools/graphifyy/bin/python
```

```json
{
  "mcpServers": {
    "graphify": {
      "command": "/Users/nama/.local/share/uv/tools/graphifyy/bin/python",
      "args": ["-m", "graphify.serve", "--graph", "/Users/nama/repo/graphify-out/graph.json"]
    }
  }
}
```

## HTTP (agen di proses atau mesin lain)

```bash
export GRAPHIFY_API_KEY="<diatur pengguna, jangan ditulis di berkas yang di-commit>"
graphify-mcp --graph /abs/graphify-out/graph.json --transport http --host 127.0.0.1 --port 8765
```

Klien mengirim header `x-api-key`. Tanpa API key, server mencetak peringatan bahwa graph terbuka tanpa
autentikasi; jangan dijalankan seperti itu di luar 127.0.0.1.
