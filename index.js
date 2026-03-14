#!/usr/bin/env node
/**
 * lmstudio-model-switch
 * Fast model switching between LM Studio local and Kimi API
 */

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
      // Backup first
      const backupPath = `${CONFIG_PATH}.bak.${Date.now()}`;
      fs.copyFileSync(CONFIG_PATH, backupPath);
      
      // Save new config
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
        models.push({ type: 'api', id: `kimi-coding/${m.id}`, name: m.name });
      });
    }
    
    return models;
  }

  switchModel(modelId) {
    const oldModel = this.getCurrentModel();
    
    // Update config
    if (!this.config.agents) this.config.agents = {};
    if (!this.config.agents.defaults) this.config.agents.defaults = {};
    if (!this.config.agents.defaults.model) this.config.agents.defaults.model = {};
    
    this.config.agents.defaults.model.primary = modelId;
    
    // Save
    if (this.saveConfig()) {
      console.log(`✓ Switched: ${oldModel} → ${modelId}`);
      
      // Restart service
      try {
        execSync('systemctl --user restart openclaw-gateway.service', { stdio: 'ignore' });
        console.log('✓ Gateway restarted');
      } catch (err) {
        console.warn('! Could not restart gateway automatically');
      }
      
      return true;
    }
    return false;
  }

  showStatus() {
    const current = this.getCurrentModel();
    const models = this.getAvailableModels();
    
    console.log('=== Model Status ===');
    console.log(`Current: ${current}`);
    console.log('');
    console.log('Available models:');
    models.forEach(m => {
      const marker = m.id === current ? '→' : ' ';
      console.log(`  ${marker} ${m.id} (${m.name}) [${m.type}]`);
    });
  }
}

// Main
const switcher = new ModelSwitcher();
const action = process.argv[2];
const arg = process.argv[3];

switch (action) {
  case 'status':
    switcher.showStatus();
    break;
    
  case 'local':
    const localModel = arg || 'qwen/qwen3.5-9b';
    switcher.switchModel(`lmstudio/${localModel}`);
    break;
    
  case 'api':
  case 'kimi':
    switcher.switchModel('kimi-coding/k2p5');
    break;
    
  default:
    console.log('Usage: switch-model [status|local|api|kimi] [model-id]');
    console.log('');
    console.log('Examples:');
    console.log('  switch-model status');
    console.log('  switch-model local');
    console.log('  switch-model local qwen/qwen3-30b');
    console.log('  switch-model api');
    break;
}
