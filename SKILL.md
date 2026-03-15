# lmstudio-model-switch

**Fast model switching between LM Studio local, Kimi API, and Anthropic Claude for OpenClaw.**

Switch your agent's AI model on-the-fly with a single command — no manual config edits required.

---

## Installation

```bash
git clone https://github.com/Endihunn/lmstudio-model-switch \
  ~/.openclaw/workspace/skills/lmstudio-model-switch
```

---

## Usage

### Commands

| Command | Description |
|---------|-------------|
| `/switch-model status` | Show current model and available providers |
| `/switch-model local` | Switch to LM Studio (default model) |
| `/switch-model local <model>` | Switch to specific local model |
| `/switch-model api` | Switch to Kimi K2.5 API |
| `/switch-model kimi` | Alias for `/switch-model api` |
| `/switch-model claude` | Switch to Anthropic Claude (default) |
| `/switch-model anthropic` | Alias for `/switch-model claude` |
| `/switch-model claude <model>` | Switch to specific Claude variant |

### Examples

```bash
# Check current model
/switch-model status

# Switch to local LM Studio (uses DEFAULT_LOCAL_MODEL)
/switch-model local

# Switch to a specific local model
/switch-model local mistral/mistral-small-3.1

# Switch to Kimi K2.5 API
/switch-model kimi

# Switch to Anthropic Claude Sonnet (default)
/switch-model claude

# Switch to a specific Claude variant
/switch-model claude anthropic/claude-haiku-3-5
```

---

## Model Reference

> **Adjust these constants at the top of `index.js`** to match your setup.
> They are clearly labeled so any agent or user can find and edit them quickly.

### 🖥️ Local — LM Studio (`DEFAULT_LOCAL_MODEL`)

Format: `"<author>/<model-id>"` — must match exactly as shown in LM Studio.

| Value | Description |
|-------|-------------|
| `qwen/qwen3.5-9b` | **Default** — Qwen 3.5 9B Q4_K_M (~6GB VRAM) |
| `mistral/mistral-small-3.1` | Mistral Small 3.1 24B (~14GB VRAM) |
| `google/gemma-3-12b` | Gemma 3 12B |

### 🌙 API — Kimi (`KIMI_MODEL`)

| Value | Description |
|-------|-------------|
| `kimi-coding/k2p5` | **Default** — Kimi K2.5, coding-optimized |

### 🤖 API — Anthropic Claude (`CLAUDE_MODEL`)

| Value | Description |
|-------|-------------|
| `anthropic/claude-sonnet-4-6` | **Default** — Sonnet 4.6, balanced speed/quality |
| `anthropic/claude-opus-4-5` | Opus 4.5, maximum quality (slower, higher cost) |
| `anthropic/claude-haiku-3-5` | Haiku 3.5, fastest and cheapest |

> ℹ️ Claude model aliases are set in OpenClaw's model providers config.
> Verify current aliases with `/status` or check `~/.openclaw/openclaw.json`.

---

## Configuration (openclaw.json)

```json
{
  "skills": {
    "lmstudio-model-switch": {
      "enabled": true
    }
  }
}
```

For Anthropic Claude to appear in `/switch-model status`, add your API key to the providers section:

```json
{
  "models": {
    "providers": {
      "anthropic": {
        "apiKey": "sk-ant-...",
        "models": [
          { "id": "claude-sonnet-4-6", "name": "Claude Sonnet 4.6" },
          { "id": "claude-haiku-3-5",  "name": "Claude Haiku 3.5" }
        ]
      }
    }
  }
}
```

---

## How It Works

1. **Backup** — Creates timestamped backup of `openclaw.json`
2. **Edit** — Modifies `agents.defaults.model.primary`
3. **Restart** — Restarts `openclaw-gateway.service` via systemd
4. **Confirm** — Reports old → new model

---

## When to Use Each Provider

### Local (LM Studio) — Privacy-first
- Authentication tokens, passwords, credentials
- Proprietary or sensitive code
- Offline capability required
- Low-latency needs (no API round-trip)

### Kimi K2.5 API — Coding & reasoning
- Complex code generation
- Very long contexts (>100k tokens)
- When VRAM is scarce (<6GB free)

### Anthropic Claude — Quality & versatility
- Natural language tasks requiring nuance
- Document analysis, writing, summarization
- Best-in-class instruction following
- When testing API integrations with Anthropic

---

## Requirements

- OpenClaw ≥ 2026.3.12
- LM Studio on port 1234 (for `local` mode)
- Kimi API key configured (for `kimi` mode)
- Anthropic API key configured (for `claude` mode)
- systemd user services

---

## Troubleshooting

### "LM Studio not responding"
```bash
curl http://127.0.0.1:1234/api/v0/models
```

### "Switch failed — invalid JSON"
```bash
python3 -m json.tool ~/.openclaw/openclaw.json
# Restore backup:
ls ~/.openclaw/openclaw.json.bak.*
cp ~/.openclaw/openclaw.json.bak.<timestamp> ~/.openclaw/openclaw.json
```

### "Gateway won't restart"
```bash
systemctl --user status openclaw-gateway
systemctl --user restart openclaw-gateway
```

### "Claude model not recognized"
Verify the model alias exists in your `openclaw.json` providers or that your OpenClaw version supports Anthropic.
Check: `openclaw status` → Models section.

---

## Author

**WarMech / Endihunn** — OpenClaw Community

## License

MIT

---

## Changelog

**2026-03-14** — v1.1.0
- ✨ Added Anthropic Claude support (`/switch-model claude`)
- 📝 Centralized model constants at top of `index.js` for easy adjustment
- 📖 Added Model Reference table (local, kimi, claude variants)
- 🐛 `status` now shows configured skill defaults alongside available providers

**2026-03-14** — v1.0.0
- Initial release: local/API switching, backup, systemd restart
