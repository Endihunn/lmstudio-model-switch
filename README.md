# lmstudio-model-switch

Switch your OpenClaw agent's AI model on-the-fly between **LM Studio local**, **Kimi API**, and **Anthropic Claude** — no manual config edits required.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![OpenClaw](https://img.shields.io/badge/OpenClaw-%E2%89%A52026.3.12-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

---

## 🚀 Quick Start

```bash
# Install
git clone https://github.com/Endihunn/lmstudio-model-switch \
  ~/.openclaw/workspace/skills/lmstudio-model-switch

# Use
/switch-model status    # Check current model
/switch-model local     # Switch to LM Studio
/switch-model kimi      # Switch to Kimi K2.5 API
/switch-model claude    # Switch to Anthropic Claude
```

---

## ✨ Features

- **One-command switching** between local and cloud models
- **Three providers**: LM Studio, Kimi, Anthropic Claude
- **Automatic backup** of configuration before every change
- **Service restart** handled automatically
- **Easily configurable** — all model IDs in named constants at the top of `index.js`

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `status` | Show current model and configured defaults |
| `local [model]` | Switch to LM Studio (default: `qwen/qwen3.5-9b`) |
| `api` / `kimi` | Switch to Kimi K2.5 |
| `claude` / `anthropic` | Switch to Anthropic Claude Sonnet (default) |
| `claude <model>` | Switch to specific Claude variant |

---

## 🎛️ Model Reference

All defaults are set as named constants at the **top of `index.js`** — easy to find and adjust:

```js
const DEFAULT_LOCAL_MODEL = 'qwen/qwen3.5-9b';          // LM Studio default
const KIMI_MODEL          = 'kimi-coding/k2p5';          // Kimi K2.5
const CLAUDE_MODEL        = 'anthropic/claude-sonnet-4-6'; // Claude Sonnet (default)
```

### Local — LM Studio

| `DEFAULT_LOCAL_MODEL` | Notes |
|-----------------------|-------|
| `qwen/qwen3.5-9b` | **Default** — ~6GB VRAM, Q4_K_M |
| `mistral/mistral-small-3.1` | ~14GB VRAM |
| `google/gemma-3-12b` | 12B params |

### Kimi API

| `KIMI_MODEL` | Notes |
|--------------|-------|
| `kimi-coding/k2p5` | **Default** — K2.5, coding-optimized |

### Anthropic Claude

| `CLAUDE_MODEL` | Notes |
|----------------|-------|
| `anthropic/claude-sonnet-4-6` | **Default** — balanced speed & quality |
| `anthropic/claude-opus-4-5` | Max quality, higher cost |
| `anthropic/claude-haiku-3-5` | Fastest, cheapest |

---

## 🤔 When to Use Each

| Scenario | Best Choice |
|----------|-------------|
| Private/sensitive data | `local` |
| Offline / low latency | `local` |
| Complex code generation | `kimi` |
| Very long contexts (>100k) | `kimi` |
| VRAM scarce | `kimi` or `claude` |
| Natural language, writing | `claude` |
| Instruction following | `claude` |
| Testing Anthropic API | `claude` |

---

## 🔧 Requirements

- OpenClaw ≥ 2026.3.12
- LM Studio on port 1234 (for `local`)
- Kimi API key configured (for `kimi`)
- Anthropic API key configured (for `claude`)
- systemd user services

---

## 🛠️ Troubleshooting

**LM Studio not responding?**
```bash
curl http://127.0.0.1:1234/api/v0/models
```

**Switch failed (JSON error)?**
```bash
python3 -m json.tool ~/.openclaw/openclaw.json
# Restore backup:
cp ~/.openclaw/openclaw.json.bak.<timestamp> ~/.openclaw/openclaw.json
```

**Claude model not recognized?**
Check that your Anthropic API key is in `openclaw.json` providers and the model alias matches your OpenClaw version.

---

## 📝 License

MIT © WarMech / Endihunn — OpenClaw Community

---

Made with 🦞 for the OpenClaw ecosystem
