---
name: zernio
description: Schedule and manage social media posts across 13 platforms from the CLI
version: 0.2.0
homepage: https://docs.zernio.com
tags: [social-media, scheduling, instagram, tiktok, twitter, linkedin, facebook, threads, youtube, bluesky, pinterest, reddit, snapchat, telegram]
metadata:
  env:
    - ZERNIO_API_KEY (required) - Your Zernio API key from https://zernio.com/settings/api
    - ZERNIO_API_URL (optional) - Defaults to https://zernio.com/api
---

# Zernio CLI

Schedule and publish social media posts across 13 platforms (Instagram, TikTok, X/Twitter, LinkedIn, Facebook, Threads, YouTube, Bluesky, Pinterest, Reddit, Snapchat, Telegram, Google Business) from any terminal or AI agent.

## Setup

```bash
npm install -g @zernio/cli

# Log in via browser (recommended)
zernio auth:login

# Or set your API key manually
zernio auth:set --key "sk_your-api-key"

# Verify it works
zernio auth:check
```

Or set the env var directly: `export ZERNIO_API_KEY="sk_your-api-key"`

## Core Workflow

The typical flow for scheduling a post:

```bash
# 1. See your profiles
zernio profiles:list

# 2. See connected social accounts
zernio accounts:list

# 3. Schedule a post
zernio posts:create --text "Hello world!" --accounts <accountId1>,<accountId2> --scheduledAt "2025-01-15T10:00:00Z"

# 4. Check post status
zernio posts:list --status scheduled

# 5. View analytics (requires analytics add-on)
zernio analytics:posts --profileId <profileId>
```

## Output Format

All commands output JSON by default (for AI agents and piping). Add `--pretty` for indented output.

Errors always return: `{"error": true, "message": "...", "status": 401}`

## Commands Reference

### Authentication

```bash
# Log in via browser (opens browser, creates API key automatically)
zernio auth:login

# Or with a custom device name
zernio auth:login --device-name "my-server"

# Save API key manually
zernio auth:set --key "sk_your-api-key"

# Optionally set custom API URL
zernio auth:set --key "sk_..." --url "https://custom.api.url/api/v1"

# Verify key works
zernio auth:check
```

### Profiles

```bash
# List all profiles
zernio profiles:list

# Create a profile
zernio profiles:create --name "My Brand"

# Get profile details
zernio profiles:get <profileId>

# Update profile
zernio profiles:update <profileId> --name "New Name"

# Delete profile (must have no connected accounts)
zernio profiles:delete <profileId>
```

### Accounts (Social Media Connections)

```bash
# List all connected accounts
zernio accounts:list

# Filter by profile or platform
zernio accounts:list --profileId <id> --platform instagram

# Get single account
zernio accounts:get <accountId>

# Check health of all accounts (rate limits, token expiry)
zernio accounts:health
```

### Posts

```bash
# Publish immediately
zernio posts:create --text "Hello!" --accounts <id1>,<id2>

# Schedule for later
zernio posts:create --text "Scheduled post" --accounts <id> --scheduledAt "2025-06-01T14:00:00Z"

# Save as draft
zernio posts:create --text "Draft idea" --accounts <id> --draft

# With media
zernio posts:create --text "Check this out" --accounts <id> --media "https://example.com/image.jpg"

# With title (YouTube, Reddit)
zernio posts:create --text "Description" --accounts <id> --title "My Video Title"

# List posts with filters
zernio posts:list --status published --page 1 --limit 20
zernio posts:list --profileId <id> --from "2025-01-01" --to "2025-01-31"
zernio posts:list --search "product launch"

# Get post details
zernio posts:get <postId>

# Delete a post
zernio posts:delete <postId>

# Retry a failed post
zernio posts:retry <postId>
```

### Analytics (requires analytics add-on)

```bash
# Post analytics
zernio analytics:posts --profileId <id>
zernio analytics:posts --postId <postId>
zernio analytics:posts --platform instagram --sortBy engagement

# Daily metrics
zernio analytics:daily --accountId <id> --from "2025-01-01" --to "2025-01-31"

# Best posting times
zernio analytics:best-time --accountId <id>
```

### Media

```bash
# Upload a file (returns URL for use in posts:create --media)
zernio media:upload ./photo.jpg
zernio media:upload ./video.mp4
```

## Platform-Specific Examples

### Instagram Reel
```bash
zernio media:upload ./reel.mp4
# Use the returned URL:
zernio posts:create --text "New reel!" --accounts <instagramAccountId> --media "<returned-url>"
```

### Multi-Platform Post
```bash
zernio posts:create \
  --text "Big announcement!" \
  --accounts <instagramId>,<twitterId>,<linkedinId> \
  --media "https://example.com/image.jpg" \
  --scheduledAt "2025-06-01T09:00:00Z" \
  --timezone "America/New_York"
```

### Threads + Twitter Simultaneous
```bash
zernio posts:create --text "Thoughts on AI agents..." --accounts <threadsId>,<twitterId>
```

## Supported Platforms

Instagram, TikTok, X (Twitter), LinkedIn, Facebook, Threads, YouTube, Bluesky, Pinterest, Reddit, Snapchat, Telegram, Google Business Profile.

## Error Handling

Common errors and their meaning:
- `401` - Invalid or missing API key
- `402` - Feature requires paid add-on (e.g., analytics)
- `403` - Plan limit reached or insufficient permissions
- `404` - Resource not found
- `429` - Rate limited (account in cooldown)

## Tips for AI Agents

- Always call `zernio accounts:list` first to get valid account IDs before creating posts
- Use `zernio accounts:health` to check if accounts are rate-limited before posting
- Post IDs from `zernio posts:create` can be used with `zernio posts:get` to check publish status
- For multi-image posts, upload each file with `zernio media:upload` first, then pass all URLs comma-separated to `--media`
- Schedule posts at least 5 minutes in the future for reliable delivery
