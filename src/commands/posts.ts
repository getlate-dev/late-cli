import type { Argv } from 'yargs';
import { createClient } from '../client.js';
import { output, outputError } from '../utils/output.js';
import { handleError } from '../utils/errors.js';

/** Register post commands: posts:create, posts:list, posts:get, posts:delete, posts:retry */
export function registerPostCommands(yargs: Argv): Argv {
  return yargs
    .command(
      'posts:create',
      'Create or schedule a post',
      (y) =>
        y
          .option('text', { type: 'string', describe: 'Post content text', demandOption: true })
          .option('accounts', { type: 'string', describe: 'Comma-separated account IDs', demandOption: true })
          .option('scheduledAt', { type: 'string', describe: 'ISO 8601 date to schedule (omit to publish now)' })
          .option('draft', { type: 'boolean', describe: 'Save as draft', default: false })
          .option('media', { type: 'string', describe: 'Comma-separated media URLs' })
          .option('title', { type: 'string', describe: 'Post title (YouTube, Reddit, etc.)' })
          .option('tags', { type: 'string', describe: 'Comma-separated tags' })
          .option('hashtags', { type: 'string', describe: 'Comma-separated hashtags' })
          .option('timezone', { type: 'string', describe: 'Timezone (e.g. America/New_York)' }),
      async (argv) => {
        try {
          const late = createClient();

          // Look up accounts to resolve platform types
          const { data: accountsData } = await late.accounts.listAccounts();
          const allAccounts = (accountsData as any)?.accounts || [];
          const accountIds = argv.accounts.split(',').map((s: string) => s.trim()).filter(Boolean);

          const platforms = accountIds.map((id: string) => {
            const account = allAccounts.find((a: any) => (a._id || a.id) === id);
            if (!account) {
              outputError(`Account ${id} not found. Run "late accounts:list" to see available accounts.`, 404);
            }
            return { platform: account.platform, accountId: id };
          });

          // Build media items
          const mediaItems = argv.media
            ? argv.media.split(',').map((url: string) => {
                const trimmed = url.trim();
                const isVideo = /\.(mp4|mov|avi|webm|m4v)$/i.test(trimmed);
                return { type: (isVideo ? 'video' : 'image') as 'image' | 'video', url: trimmed };
              })
            : undefined;

          const body: Record<string, any> = {
            content: argv.text,
            platforms,
          };

          if (mediaItems?.length) body.mediaItems = mediaItems;
          if (argv.title) body.title = argv.title;
          if (argv.timezone) body.timezone = argv.timezone;
          if (argv.tags) body.tags = argv.tags.split(',').map((s: string) => s.trim());
          if (argv.hashtags) body.hashtags = argv.hashtags.split(',').map((s: string) => s.trim());

          if (argv.draft) {
            body.isDraft = true;
          } else if (argv.scheduledAt) {
            body.scheduledFor = argv.scheduledAt;
          } else {
            body.publishNow = true;
          }

          const { data } = await late.posts.createPost({ body });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'posts:list',
      'List posts',
      (y) =>
        y
          .option('profileId', { type: 'string', describe: 'Filter by profile ID' })
          .option('status', { type: 'string', describe: 'Filter by status (scheduled, published, failed, draft)' })
          .option('platform', { type: 'string', describe: 'Filter by platform' })
          .option('from', { type: 'string', describe: 'Start date (ISO 8601)' })
          .option('to', { type: 'string', describe: 'End date (ISO 8601)' })
          .option('page', { type: 'number', describe: 'Page number', default: 1 })
          .option('limit', { type: 'number', describe: 'Results per page', default: 10 }),
      async (argv) => {
        try {
          const late = createClient();
          const query: Record<string, any> = {
            page: argv.page,
            limit: argv.limit,
          };
          if (argv.profileId) query.profileId = argv.profileId;
          if (argv.status) query.status = argv.status;
          if (argv.platform) query.platform = argv.platform;
          if (argv.from) query.dateFrom = argv.from;
          if (argv.to) query.dateTo = argv.to;

          const { data } = await late.posts.listPosts({ query });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'posts:get <id>',
      'Get post details',
      (y) => y.positional('id', { type: 'string', describe: 'Post ID', demandOption: true }),
      async (argv) => {
        try {
          const late = createClient();
          const { data } = await late.posts.getPost({ path: { postId: argv.id! } });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'posts:delete <id>',
      'Delete a post',
      (y) => y.positional('id', { type: 'string', describe: 'Post ID', demandOption: true }),
      async (argv) => {
        try {
          const late = createClient();
          const { data } = await late.posts.deletePost({ path: { postId: argv.id! } });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    )
    .command(
      'posts:retry <id>',
      'Retry a failed post',
      (y) => y.positional('id', { type: 'string', describe: 'Post ID', demandOption: true }),
      async (argv) => {
        try {
          const late = createClient();
          const { data } = await late.posts.retryPost({ path: { postId: argv.id! } });
          output(data, argv.pretty as boolean);
        } catch (err) {
          handleError(err);
        }
      },
    );
}
