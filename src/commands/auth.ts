import type { Argv } from 'yargs';
import { getConfig, writeConfig, requireApiKey } from '../utils/config.js';
import { output, outputError } from '../utils/output.js';
import { handleError } from '../utils/errors.js';
import Late from '@getlatedev/node';

/** Register auth commands: auth:set, auth:check */
export function registerAuthCommands(yargs: Argv): Argv {
  return yargs
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
