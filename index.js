#!/usr/bin/env node
/**
 * lmstudio-model-switch
 * Fast model switching between LM Studio local, Kimi API, and Anthropic Claude
 *
 * ─────────────────────────────────────────────
 *  MODEL REFERENCE — edit these to match your setup
 * ─────────────────────────────────────────────
 *
 *  LOCAL (LM Studio — port 1234)
 *    DEFAULT_LOCAL_MODEL   → default model when no arg is given to /switch-model local
 *                            Format: "<author>/<model-id>" as shown in LM Studio
 *    Example alternatives:
 *      "qwen/qwen3.5-9b"            (current default)
 *      "mistral/mistral-small-3.1"
 *      "google/gemma-3-12b"
 *
 *  API — KIMI (Moonshot AI)
 *    KIMI_MODEL            → full model alias used by OpenClaw
 *    Valid values:
 *      "kimi-coding/k2p5"   → Kimi K2.5 (default)
 *
 *  API — ANTHROPIC CLAUDE
 *    CLAUDE_MODEL          → full model alias used by OpenClaw
 *    Valid values (as of 2026-03):
 *      "anthropic/claude-sonnet-4-6"   → Claude Sonnet 4.6 (balanced, recommended)
 *      "anthropic/claude-opus-4-5"     → Claude Opus 4.5 (max quality, slower)
 *      "anthropic/claude-haiku-3-5"    → Claude Haiku 3.5 (fastest, cheapest)
 *    Check latest aliases: https://docs.openclaw.ai or /status in your agent
 *
 * ─────────────────────────────────────────────
 */
const DEFAULT_LOCAL_MODEL = 'qwen/qwen3.5-9b';
const KIMI_MODEL          = 'kimi-coding/k2p5';
const CLAUDE_MODEL        = 'anthropic/claude-sonnet-4-6';
// ─────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/openclaw.json');

class ModelSwitcher {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error loading config:', err.message);
      process.exit(1);
    }
  }

  saveConfig() {
    try {
      const backupPath = `${CONFIG_PATH}.bak.${Date.now()}`;
      fs.copyFileSync(CONFIG_PATH, backupPath);
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2));
      return true;
    } catch (err) {
      console.error('Error saving config:', err.message);
      return false;
    }
  }

  getCurrentModel() {
    return this.config.agents?.defaults?.model?.primary || 'unknown';
  }

  getAvailableModels() {
    const providers = this.config.models?.providers || {};
    const models = [];

    if (providers.lmstudio?.models) {
      providers.lmstudio.models.forEach(m => {
        models.push({ type: 'local', id: `lmstudio/${m.id}`, name: m.name });
      });
    }

    if (providers['kimi-coding']?.models) {
      providers['kimi-coding'].models.forEach(m => {
        models.push({ type: 'api/kimi', id: `kimi-coding/${m.id}`, name: m.name });
      });
    }

    if (providers['anthropic']?.models) {
      providers['anthropic'].models.forEach(m => {
        models.push({ type: 'api/anthropic', id: `anthropic/${m.id}`, name: m.name });
      });
    }

    return models;
  }

  switchModel(modelId) {
    const oldModel = this.getCurrentModel();

    if (!this.config.agents) this.config.agents = {};
    if (!this.config.agents.defaults) this.config.agents.defaults = {};
    if (!this.config.agents.defaults.model) this.config.agents.defaults.model = {};

    this.config.agents.defaults.model.primary = modelId;

    if (this.saveConfig()) {
      console.log(`✓ Switched: ${oldModel} → ${modelId}`);
      try {
        execSync('systemctl --user restart openclaw-gateway.service', { stdio: 'ignore' });
        console.log('✓ Gateway restarted');
      } catch (err) {
        console.warn('! Could not restart gateway automatically');
        console.warn('  Run: systemctl --user restart openclaw-gateway');
      }
      return true;
    }
    return false;
  }

  showStatus() {
    const current = this.getCurrentModel();
    const models  = this.getAvailableModels();

    console.log('=== Model Status ===');
    console.log(`Current: ${current}`);
    console.log('');
    console.log('Available models (from openclaw.json providers):');
    models.forEach(m => {
      const marker = m.id === current ? '→' : ' ';
      console.log(`  ${marker} ${m.id} (${m.name}) [${m.type}]`);
    });
    console.log('');
    console.log('Configured defaults in this skill:');
    console.log(`  local   → lmstudio/${DEFAULT_LOCAL_MODEL}`);
    console.log(`  kimi    → ${KIMI_MODEL}`);
    console.log(`  claude  → ${CLAUDE_MODEL}`);
  }
}

// ─── Main ───────────────────────────────────
const switcher = new ModelSwitcher();
const action   = process.argv[2];
const arg      = process.argv[3];

switch (action) {
  case 'status':
    switcher.showStatus();
    break;

  case 'local':
    switcher.switchModel(`lmstudio/${arg || DEFAULT_LOCAL_MODEL}`);
    break;

  case 'api':
  case 'kimi':
    switcher.switchModel(KIMI_MODEL);
    break;

  case 'claude':
  case 'anthropic':
    // Allows optional override: /switch-model claude anthropic/claude-haiku-3-5
    switcher.switchModel(arg || CLAUDE_MODEL);
    break;

  default:
    console.log('Usage: switch-model <command> [model-id]');
    console.log('');
    console.log('Commands:');
    console.log('  status              Show current model and providers');
    console.log('  local [model]       Switch to LM Studio (default: ' + DEFAULT_LOCAL_MODEL + ')');
    console.log('  api | kimi          Switch to Kimi K2.5 API');
    console.log('  claude | anthropic  Switch to Anthropic Claude (default: ' + CLAUDE_MODEL + ')');
    console.log('');
    console.log('Examples:');
    console.log('  switch-model status');
    console.log('  switch-model local');
    console.log('  switch-model local mistral/mistral-small-3.1');
    console.log('  switch-model kimi');
    console.log('  switch-model claude');
    console.log('  switch-model claude anthropic/claude-haiku-3-5');
    break;
}
