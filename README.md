# Sablier MCP Server

An MCP (Model Context Protocol) server built with [mcp-framework](https://mcp-framework.com/) that provides centralized
access to issues and discussions across all Sablier Labs repositories. This server is designed for internal use by
Sablier Labs employees and staff to quickly find if topics have been previously discussed.

## Features

- **Cross-repository search**: Search for topics across 25 Sablier Labs repositories
- **Issues and discussions**: Search both GitHub issues and discussions
- **Secure authentication**: Uses GitHub Personal Access Token (not exposed in API)
- **Flexible queries**: Filter by repository, content type, and result limit
- **Recent results first**: Results sorted by most recently updated

## Installation

1. Clone this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file:

   ```bash
   cp .env.example .env
   ```

4. Set your GitHub token in `.env`:

   ```
   GITHUB_TOKEN=your_github_token_here
   ```

5. Build the server:
   ```bash
   npm run build
   ```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## GitHub Token Requirements

Your GitHub token needs the following scopes:

- `repo` (for accessing private repositories)
- `public_repo` (for accessing public repositories)

## MCP Tools

### `search_topics`

Search for topics across Sablier Labs repositories.

**Parameters:**

- `query` (required): Search term to find in issue/discussion titles and content
- `repositories` (optional): Array of specific repositories to search (e.g., ["sablier-labs/lockup"])
- `type` (optional): "issues", "discussions", or "both" (default: "both")
- `limit` (optional): Maximum number of results to return

**Example:**

```json
{
  "query": "payment streaming",
  "type": "both",
  "limit": 10
}
```

### `list_repos`

Lists all monitored Sablier Labs repositories.

### `get_repo_info`

Get detailed information about a specific repository.

**Parameters:**

- `repository` (required): Repository name in "owner/name" format

## Monitored Repositories

The server monitors all 25 Sablier Labs repositories:

- sablier-labs/command-center
- sablier-labs/discussions
- sablier-labs/lockup
- sablier-labs/flow
- sablier-labs/airdrops
- sablier-labs/solsab
- sablier-labs/evm-utils
- sablier-labs/docs
- sablier-labs/sdk
- sablier-labs/interfaces
- sablier-labs/indexers
- sablier-labs/devkit
- sablier-labs/gha-utils
- sablier-labs/onchain-analytics
- sablier-labs/legacy-interfaces
- sablier-labs/legacy-contracts
- sablier-labs/sablier-labs.github.io
- sablier-labs/audits
- sablier-labs/business-contracts
- sablier-labs/scripts
- sablier-labs/deployments
- sablier-labs/github-labels
- sablier-labs/benchmarks
- sablier-labs/sandbox
- sablier-labs/v2-periphery

## Security

- GitHub token is stored securely in environment variables
- Token is never exposed through the MCP API
- Server is intended for internal Sablier Labs use only

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```
