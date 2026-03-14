# lmstudio-model-switch

Fast model switching between LM Studio local and Kimi API for OpenClaw.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![OpenClaw](https://img.shields.io/badge/OpenClaw-%E2%89%A52026.3.12-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 🚀 Quick Start

```bash
# Install
git clone https://github.com/openclaw-community/lmstudio-model-switch \
  ~/.openclaw/workspace/skills/lmstudio-model-switch

# Use
/switch-model status    # Check current model
/switch-model local     # Switch to LM Studio
/switch-model api       # Switch to Kimi API
```

## ✨ Features

- **One-command switching** between local and API models
- **Automatic backup** of configuration before changes
- **Service restart** handling
- **Status monitoring** with available models list
- **Safe defaults** with fallback options

## 📖 Usage

### Commands

| Command | Description | Example |
|---------|-------------|---------|
| `status` | Show current model and providers | `/switch-model status` |
| `local` | Switch to LM Studio default | `/switch-model local` |
| `local <model>` | Switch to specific local model | `/switch-model local mistral-small-24b` |
| `api` / `kimi` | Switch to Kimi K2.5 API | `/switch-model api` |

### When to Use Local (LM Studio)

🔒 **Privacy-first tasks:**
- Authentication tokens handling
- Password/credential management
- Sensitive personal data
- Proprietary code

⚡ **Low-latency needs:**
- Real-time interactions
- VRAM available (>6GB)
- Offline capability required

### When to Use API (Kimi)

🧠 **Quality-first tasks:**
- Complex reasoning
- Long contexts (>100k tokens)
- Maximum performance
- Cloud reliability

💻 **Resource constraints:**
- Low VRAM (<6GB)
- GPU intensive tasks running
- LM Studio unavailable

## 🛠️ Requirements

- OpenClaw ≥ 2026.3.12
- LM Studio running (for local mode)
- Kimi API key configured (for API mode)
- systemd user service

## 🔧 Troubleshooting

**LM Studio not responding?**
```bash
curl http://127.0.0.1:1234/api/v0/models
```

**Switch failed?**
Check JSON validity:
```bash
python3 -m json.tool ~/.openclaw/openclaw.json
```

**Gateway won't restart?**
```bash
systemctl --user status openclaw-gateway
```

## 📝 Configuration

Add to `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "lmstudio-model-switch": {
      "enabled": true
    }
  }
}
```

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

MIT © WarMech - OpenClaw Community

---

Made with 🦞 for the OpenClaw ecosystem
