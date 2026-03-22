import Late from '@zernio/node';
import { getConfig, requireApiKey } from './utils/config.js';

/**
 * Create a Zernio SDK client instance using config from ~/.zernio/config.json or env vars.
 * Call this at the start of every command handler.
 */
export function createClient(): Late {
  const apiKey = requireApiKey();
  const config = getConfig();

  return new Late({
    apiKey,
    baseURL: config.baseUrl || undefined,
  });
}
