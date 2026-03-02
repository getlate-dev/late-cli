# Late CLI

Schedule and manage social media posts across 13 platforms from the terminal.

Built for developers and AI agents. Outputs JSON by default.

## Install

```bash
npm install -g late
```

## Quick Start

```bash
# 1. Set your API key (get one at https://getlate.dev/settings/api)
late auth:set --key "sk-your-api-key"

# 2. List your accounts
late accounts:list --pretty

# 3. Schedule a post
late posts:create --text "Hello from the CLI!" --accounts <accountId> --scheduledAt "2025-06-01T10:00:00Z"
```

## Commands

| Command | Description |
|---------|-------------|
| `late auth:set --key <key>` | Save API key |
| `late auth:check` | Verify API key |
| `late profiles:list` | List profiles |
| `late profiles:create --name <name>` | Create profile |
| `late profiles:get <id>` | Get profile |
| `late profiles:update <id>` | Update profile |
| `late profiles:delete <id>` | Delete profile |
| `late accounts:list` | List social accounts |
| `late accounts:get <id>` | Get account details |
| `late accounts:health` | Check account health |
| `late posts:create` | Create/schedule a post |
| `late posts:list` | List posts |
| `late posts:get <id>` | Get post details |
| `late posts:delete <id>` | Delete a post |
| `late posts:retry <id>` | Retry failed post |
| `late analytics:posts` | Post analytics |
| `late analytics:daily` | Daily metrics |
| `late analytics:best-time` | Best posting times |
| `late media:upload <file>` | Upload media file |

## Configuration

Config is stored at `~/.late/config.json`. Environment variables take precedence:

| Env Var | Description |
|---------|-------------|
| `LATE_API_KEY` | API key (required) |
| `LATE_API_URL` | Custom API base URL |

## AI Agent Integration

This CLI ships with a `SKILL.md` file for AI agent discovery (Claude Code, OpenClaw, etc.). AI agents can use the CLI to schedule posts, check analytics, and manage social accounts programmatically.

## Supported Platforms

Instagram, TikTok, X (Twitter), LinkedIn, Facebook, Threads, YouTube, Bluesky, Pinterest, Reddit, Snapchat, Telegram, Google Business Profile.

## License

MIT
