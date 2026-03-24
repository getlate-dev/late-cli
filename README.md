# Zernio CLI

Schedule and manage social media posts across 14 platforms from the terminal.

Built for developers and AI agents. Outputs JSON by default.

## Install

```bash
npm install -g @zernio/cli
```

## Quick Start

```bash
# 1. Log in via browser (recommended)
zernio auth:login

# Or set your API key manually (get one at https://zernio.com/dashboard/api-keys)
zernio auth:set --key "sk_your-api-key"

# 2. List your accounts
zernio accounts:list --pretty

# 3. Schedule a post
zernio posts:create --text "Hello from the CLI!" --accounts <accountId> --scheduledAt "2025-06-01T10:00:00Z"
```

## Authentication

### Browser login (recommended)

```bash
zernio auth:login
```

Opens your browser to authorize the CLI. An API key is created automatically and saved to `~/.zernio/config.json`. Running it again from the same device replaces the existing key.

Options:
- `--device-name <name>` - Custom device name for the API key label (defaults to your hostname)

### Manual API key

```bash
zernio auth:set --key "sk_your-api-key"
```

### Verify

```bash
zernio auth:check
```

## Commands

| Command | Description |
|---------|-------------|
| `zernio auth:login` | Log in via browser |
| `zernio auth:set --key <key>` | Save API key manually |
| `zernio auth:check` | Verify API key |
| `zernio profiles:list` | List profiles |
| `zernio profiles:create --name <name>` | Create profile |
| `zernio profiles:get <id>` | Get profile |
| `zernio profiles:update <id>` | Update profile |
| `zernio profiles:delete <id>` | Delete profile |
| `zernio accounts:list` | List social accounts |
| `zernio accounts:get <id>` | Get account details |
| `zernio accounts:health` | Check account health |
| `zernio posts:create` | Create/schedule a post |
| `zernio posts:list` | List posts |
| `zernio posts:get <id>` | Get post details |
| `zernio posts:delete <id>` | Delete a post |
| `zernio posts:retry <id>` | Retry failed post |
| `zernio analytics:posts` | Post analytics |
| `zernio analytics:daily` | Daily metrics |
| `zernio analytics:best-time` | Best posting times |
| `zernio media:upload <file>` | Upload media file |

## Configuration

Config is stored at `~/.zernio/config.json`. Environment variables take precedence:

| Env Var | Description |
|---------|-------------|
| `ZERNIO_API_KEY` | API key (required) |
| `ZERNIO_API_URL` | Custom API base URL |

## AI Agent Integration

This CLI ships with a `SKILL.md` file for AI agent discovery (Claude Code, OpenClaw, etc.). AI agents can use the CLI to schedule posts, check analytics, and manage social accounts programmatically.

## Supported Platforms

Instagram, TikTok, X (Twitter), LinkedIn, Facebook, Threads, YouTube, Bluesky, Pinterest, Reddit, Snapchat, Telegram, WhatsApp, Google Business Profile.

## License

MIT
