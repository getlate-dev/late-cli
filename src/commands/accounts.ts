import type { Argv } from 'yargs';
import { createClient } from '../client.js';
import { output } from '../utils/output.js';
import { handleError } from '../utils/errors.js';

/** Register account commands: accounts:list, accounts:get, accounts:health */
export function registerAccountCommands(yargs: Argv): Argv {
  return yargs
    .command(
      'accounts:list',
      'List connected social accounts',
      (y) =>
        y
          .option('profileId', { type: 'string', describe: 'Filter by profile ID' })
          .option('platform', { type: 'string', describe: 'Filter by platform' }),
      async (argv) => {
        try {
          const late = createClient();
          const query: Record<string, any> = {};
          if (argv.profileId) query.profileId = argv.profileId;

          const { data } = await late.accounts.listAccounts({ query });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'accounts:get <id>',
      'Get account details',
      (y) => y.positional('id', { type: 'string', describe: 'Account ID', demandOption: true }),
      async (argv) => {
        try {
          const late = createClient();
          // SDK has getAccountHealth for single account details
          const { data } = await late.accounts.getAccountHealth({ path: { accountId: argv.id! } });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'accounts:health',
      'Check health of all connected accounts',
      (y) =>
        y
          .option('profileId', { type: 'string', describe: 'Filter by profile ID' })
          .option('platform', { type: 'string', describe: 'Filter by platform' })
          .option('status', { type: 'string', describe: 'Filter by status (healthy, warning, error)' }),
      async (argv) => {
        try {
          const late = createClient();
          const query: Record<string, any> = {};
          if (argv.profileId) query.profileId = argv.profileId;
          if (argv.platform) query.platform = argv.platform;
          if (argv.status) query.status = argv.status;

          const { data } = await late.accounts.getAllAccountsHealth({ query });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    );
}
