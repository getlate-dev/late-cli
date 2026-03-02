---
name: late
description: Schedule and manage social media posts across 13 platforms from the CLI
version: 0.1.0
homepage: https://docs.getlate.dev
tags: [social-media, scheduling, instagram, tiktok, twitter, linkedin, facebook, threads, youtube, bluesky, pinterest, reddit, snapchat, telegram]
metadata:
  env:
    - LATE_API_KEY (required) - Your Late API key from https://getlate.dev/settings/api
    - LATE_API_URL (optional) - Defaults to https://getlate.dev/api
---

# Late CLI

Schedule and publish social media posts across 13 platforms (Instagram, TikTok, X/Twitter, LinkedIn, Facebook, Threads, YouTube, Bluesky, Pinterest, Reddit, Snapchat, Telegram, Google Business) from any terminal or AI agent.

## Setup

```bash
npm install -g late
late auth:set --key "sk-your-api-key"
late auth:check  # verify it works
```

Or set the env var directly: `export LATE_API_KEY="sk-your-api-key"`

## Core Workflow

The typical flow for scheduling a post:

```bash
# 1. See your profiles
late profiles:list

# 2. See connected social accounts
late accounts:list

# 3. Schedule a post
late posts:create --text "Hello world!" --accounts <accountId1>,<accountId2> --scheduledAt "2025-01-15T10:00:00Z"

# 4. Check post status
late posts:list --status scheduled

# 5. View analytics (requires analytics add-on)
late analytics:posts --profileId <profileId>
```

## Output Format

All commands output JSON by default (for AI agents and piping). Add `--pretty` for indented output.

Errors always return: `{"error": true, "message": "...", "status": 401}`

## Commands Reference

### Authentication

```bash
# Save API key
late auth:set --key "sk-your-api-key"

# Optionally set custom API URL
late auth:set --key "sk-..." --url "https://custom.api.url/api/v1"

# Verify key works
late auth:check
```

### Profiles

```bash
# List all profiles
late profiles:list

# Create a profile
late profiles:create --name "My Brand"

# Get profile details
late profiles:get <profileId>

# Update profile
late profiles:update <profileId> --name "New Name"

# Delete profile (must have no connected accounts)
late profiles:delete <profileId>
```

### Accounts (Social Media Connections)

```bash
# List all connected accounts
late accounts:list

# Filter by profile or platform
late accounts:list --profileId <id> --platform instagram

# Get single account
late accounts:get <accountId>

# Check health of all accounts (rate limits, token expiry)
late accounts:health
```

### Posts

```bash
# Publish immediately
late posts:create --text "Hello!" --accounts <id1>,<id2>

# Schedule for later
late posts:create --text "Scheduled post" --accounts <id> --scheduledAt "2025-06-01T14:00:00Z"

# Save as draft
late posts:create --text "Draft idea" --accounts <id> --draft

# With media
late posts:create --text "Check this out" --accounts <id> --media "https://example.com/image.jpg"

# With title (YouTube, Reddit)
late posts:create --text "Description" --accounts <id> --title "My Video Title"

# List posts with filters
late posts:list --status published --page 1 --limit 20
late posts:list --profileId <id> --from "2025-01-01" --to "2025-01-31"
late posts:list --search "product launch"

# Get post details
late posts:get <postId>

# Delete a post
late posts:delete <postId>

# Retry a failed post
late posts:retry <postId>
```

### Analytics (requires analytics add-on)

```bash
# Post analytics
late analytics:posts --profileId <id>
late analytics:posts --postId <postId>
late analytics:posts --platform instagram --sortBy engagement

# Daily metrics
late analytics:daily --accountId <id> --from "2025-01-01" --to "2025-01-31"

# Best posting times
late analytics:best-time --accountId <id>
```

### Media

```bash
# Upload a file (returns URL for use in posts:create --media)
late media:upload ./photo.jpg
late media:upload ./video.mp4
```

## Platform-Specific Examples

### Instagram Reel
```bash
late media:upload ./reel.mp4
# Use the returned URL:
late posts:create --text "New reel!" --accounts <instagramAccountId> --media "<returned-url>"
```

### Multi-Platform Post
```bash
late posts:create \
  --text "Big announcement!" \
  --accounts <instagramId>,<twitterId>,<linkedinId> \
  --media "https://example.com/image.jpg" \
  --scheduledAt "2025-06-01T09:00:00Z" \
  --timezone "America/New_York"
```

### Threads + Twitter Simultaneous
```bash
late posts:create --text "Thoughts on AI agents..." --accounts <threadsId>,<twitterId>
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

- Always call `late accounts:list` first to get valid account IDs before creating posts
- Use `late accounts:health` to check if accounts are rate-limited before posting
- Post IDs from `late posts:create` can be used with `late posts:get` to check publish status
- For multi-image posts, upload each file with `late media:upload` first, then pass all URLs comma-separated to `--media`
- Schedule posts at least 5 minutes in the future for reliable delivery
