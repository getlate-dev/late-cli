import type { Argv } from 'yargs';
import { hostname } from 'os';
import { getConfig, writeConfig, requireApiKey } from '../utils/config.js';
import { output, outputError } from '../utils/output.js';
import { handleError } from '../utils/errors.js';
import Late from '@zernio/node';

/** Default API base URL (without /v1/ suffix, matches SDK default) */
const DEFAULT_BASE_URL = 'https://zernio.com/api';

/**
 * Resolve the base URL for direct fetch calls (not through the SDK).
 * The SDK adds /v1/ internally, but for auth endpoints we call non-SDK routes
 * so we need the raw origin (e.g. https://zernio.com).
 */
function getApiOrigin(): string {
  const config = getConfig();
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  // Strip trailing /api or /api/ to get the origin
  return baseUrl.replace(/\/api\/?$/, '');
}

/**
 * Sleep for the given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Register auth commands: auth:login, auth:set, auth:check */
export function registerAuthCommands(yargs: Argv): Argv {
  return yargs
    .command(
      'auth:login',
      'Log in via browser (device authorization flow)',
      (y) =>
        y.option('device-name', {
          type: 'string',
          describe: 'Device name for the API key label',
          default: hostname(),
        }),
      async (argv) => {
        const origin = getApiOrigin();
        const deviceName = argv['device-name'] as string;

        // Step 1: Initiate the device flow
        let initiateRes: Response;
        try {
          initiateRes = await fetch(`${origin}/api/auth/cli/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceName }),
          });
        } catch (err) {
          outputError(`Failed to connect to ${origin}. Check your internet connection.`);
        }

        if (!initiateRes!.ok) {
          const data = await initiateRes!.json().catch(() => ({}));
          outputError(data.error || `Initiation failed (HTTP ${initiateRes!.status})`);
        }

        const { deviceCode, userCode, browserUrl, expiresAt, interval } =
          await initiateRes!.json();

        // Step 2: Print instructions to stderr (so stdout stays clean for JSON)
        process.stderr.write('\n');
        process.stderr.write(`  Confirmation code: ${userCode}\n\n`);
        process.stderr.write(`  Opening browser to: ${browserUrl}\n`);
        process.stderr.write(`  Waiting for authorization...\n\n`);

        // Step 3: Open browser (dynamic import since 'open' is ESM-only)
        try {
          const open = (await import('open')).default;
          await open(browserUrl);
        } catch {
          process.stderr.write(
            `  Could not open browser automatically.\n  Visit this URL manually: ${browserUrl}\n\n`,
          );
        }

        // Step 4: Poll for authorization
        const pollInterval = (interval || 5) * 1000;
        const deadline = new Date(expiresAt).getTime();

        while (Date.now() < deadline) {
          await sleep(pollInterval);

          let pollRes: Response;
          try {
            pollRes = await fetch(`${origin}/api/auth/cli/poll`, {
              headers: { Authorization: `Bearer ${deviceCode}` },
            });
          } catch {
            // Network error, retry on next interval
            continue;
          }

          // Session expired
          if (pollRes.status === 410) {
            outputError('Authorization session expired. Run `late auth:login` again.');
          }

          // Polling too fast (shouldn't happen, but handle gracefully)
          if (pollRes.status === 429) {
            continue;
          }

          if (!pollRes.ok) {
            continue;
          }

          const data = await pollRes.json();

          if (data.status === 'authorized' && data.apiKey) {
            // Save the API key
            writeConfig({ apiKey: data.apiKey });
            process.stderr.write('  Authorized! API key saved to ~/.late/config.json\n\n');
            output(
              { success: true, message: 'Logged in successfully. API key saved.' },
              argv.pretty as boolean,
            );
            return;
          }

          if (data.status === 'denied') {
            outputError('Authorization was denied.');
          }

          // status === 'pending', keep polling
        }

        // Timed out
        outputError('Authorization timed out. Run `late auth:login` again.');
      },
    )
    .command(
      'auth:set',
      'Save API key to ~/.late/config.json',
      (y) =>
        y
          .option('key', {
            type: 'string',
            describe: 'API key',
            demandOption: true,
          })
          .option('url', {
            type: 'string',
            describe: 'Custom API base URL',
          }),
      async (argv) => {
        const updates: Record<string, string> = { apiKey: argv.key };
        if (argv.url) updates.baseUrl = argv.url;

        writeConfig(updates);
        output({ success: true, message: 'API key saved to ~/.late/config.json' }, argv.pretty as boolean);
      },
    )
    .command(
      'auth:check',
      'Verify API key works',
      (y) => y,
      async (argv) => {
        try {
          const apiKey = requireApiKey();
          const config = getConfig();

          const late = new Late({
            apiKey,
            baseURL: config.baseUrl || undefined,
          });

          const { data } = await late.users.listUsers();
          output({ success: true, message: 'API key is valid', ...data }, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    );
}
