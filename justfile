# See https://github.com/sablier-labs/devkit/blob/main/just/base.just
import "./node_modules/@sablier/devkit/just/base.just"

# ---------------------------------------------------------------------------- #
#                                    RECIPES                                   #
# ---------------------------------------------------------------------------- #

# Default recipe
default:
    just --list

# Build the Next.js app
build:
    nr build
alias b := build

# Clean the dist and .next directories
clean:
    bunx del-cli dist .next

# Setup Husky
setup:
    bun husky

# Run tests
test *args:
    bun vitest {{ args }}
alias t := test

# Run tests in watch mode
test-watch:
    bun vitest --watch
alias tw := test-watch

# Run tests with coverage
test-coverage:
    bun vitest run --coverage
alias tc := test-coverage

# Build TypeScript
tsc-build *args:
    na tsc -p tsconfig.build.json {{ args }}

# ---------------------------------------------------------------------------- #
#                                      APP                                     #
# ---------------------------------------------------------------------------- #

# Start the Next.js app
[group("app")]
@build-app:
    na next build

# Start the Next.js app in dev mode
[group("app")]
@dev-app:
    na next dev --turbopack

# Start the Next.js app
[group("app")]
@start-app:
    na next start

# ---------------------------------------------------------------------------- #
#                                      MCP                                     #
# ---------------------------------------------------------------------------- #

# Run MCP inspector
[group("mcp")]
@inspector:
    nlx @modelcontextprotocol/inspector \
        -e GITHUB_TOKEN=$GITHUB_TOKEN \
        node dist/index.js
alias i := inspector

# Start the MCP server
[group("mcp")]
@dev-mcp:
    nlx concurrently --names tsc,node --prefix-colors "blue.bold,green.bold" \
        "na tsc -p tsconfig.build.json --watch --preserveWatchOutput" \
        "node --watch --watch-preserve-output dist/index.js"
