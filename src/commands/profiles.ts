import type { Argv } from 'yargs';
import { createClient } from '../client.js';
import { output } from '../utils/output.js';
import { handleError } from '../utils/errors.js';

/** Register profile commands: profiles:list, profiles:create, profiles:get, profiles:update, profiles:delete */
export function registerProfileCommands(yargs: Argv): Argv {
  return yargs
    .command(
      'profiles:list',
      'List all profiles',
      (y) => y,
      async (argv) => {
        try {
          const late = createClient();
          const { data } = await late.profiles.listProfiles();
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'profiles:create',
      'Create a new profile',
      (y) =>
        y
          .option('name', { type: 'string', describe: 'Profile name', demandOption: true })
          .option('description', { type: 'string', describe: 'Profile description' })
          .option('color', { type: 'string', describe: 'Profile color' }),
      async (argv) => {
        try {
          const late = createClient();
          const body: { name: string; description?: string; color?: string } = { name: argv.name };
          if (argv.description) body.description = argv.description;
          if (argv.color) body.color = argv.color;

          const { data } = await late.profiles.createProfile({ body });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'profiles:get <id>',
      'Get profile details',
      (y) => y.positional('id', { type: 'string', describe: 'Profile ID', demandOption: true }),
      async (argv) => {
        try {
          const late = createClient();
          const { data } = await late.profiles.getProfile({ path: { profileId: argv.id! } });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'profiles:update <id>',
      'Update a profile',
      (y) =>
        y
          .positional('id', { type: 'string', describe: 'Profile ID', demandOption: true })
          .option('name', { type: 'string', describe: 'New name' })
          .option('description', { type: 'string', describe: 'New description' })
          .option('color', { type: 'string', describe: 'New color' })
          .option('isDefault', { type: 'boolean', describe: 'Set as default profile' }),
      async (argv) => {
        try {
          const late = createClient();
          const body: Record<string, unknown> = {};
          if (argv.name !== undefined) body.name = argv.name;
          if (argv.description !== undefined) body.description = argv.description;
          if (argv.color !== undefined) body.color = argv.color;
          if (argv.isDefault !== undefined) body.isDefault = argv.isDefault;

          const { data } = await late.profiles.updateProfile({
            path: { profileId: argv.id! },
            body: body as any,
          });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'profiles:delete <id>',
      'Delete a profile',
      (y) => y.positional('id', { type: 'string', describe: 'Profile ID', demandOption: true }),
      async (argv) => {
        try {
          const late = createClient();
          const { data } = await late.profiles.deleteProfile({ path: { profileId: argv.id! } });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    );
}
