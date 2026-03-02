import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

/**
 * Config stored at ~/.late/config.json.
 * Env vars LATE_API_KEY and LATE_API_URL take precedence over file values.
 */
export interface LateConfig {
  apiKey?: string;
  baseUrl?: string;
}

const CONFIG_DIR = join(homedir(), '.late');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/** Read config from disk. Returns empty object if file doesn't exist. */
function readConfigFile(): LateConfig {
  try {
    if (!existsSync(CONFIG_FILE)) return {};
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw) as LateConfig;
  } catch {
    return {};
  }
}

/** Write config to disk, merging with existing values. */
export function writeConfig(updates: Partial<LateConfig>): void {
  const existing = readConfigFile();
  const merged = { ...existing, ...updates };

  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
}

/**
 * Get resolved config. Env vars override file values.
 * Priority: env var > config file > default.
 */
export function getConfig(): LateConfig {
  const file = readConfigFile();

  return {
    apiKey: process.env.LATE_API_KEY || file.apiKey,
    // SDK default is https://getlate.dev/api (it adds /v1/ prefix to paths internally)
    baseUrl: process.env.LATE_API_URL || file.baseUrl,
  };
}

/** Get API key or exit with error. */
export function requireApiKey(): string {
  const { apiKey } = getConfig();
  if (!apiKey) {
    console.error(JSON.stringify({
      error: true,
      message: 'No API key configured. Run "late auth:set" or set LATE_API_KEY env var.',
    }));
    process.exit(1);
  }
  return apiKey;
}
