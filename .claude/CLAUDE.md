# Sablier MCP Server

This is an MCP server for searching issues and discussions across Sablier Labs repositories.

## Project-Specific Guidelines

- This server is for **internal Sablier Labs use only**
- GitHub token must be kept secure and never exposed in API responses

## Development Commands

Use `just` for all development tasks:

- `just build` - Build the project
- `just test` - Run tests
- `just full-check` - Run all code checks
- `just full-write` - Run all code fixes
- `just tsc-check` - Run TypeScript checks

Dependencies can be installed with `ni`.

## Formatting

Run `just biome-write` after generating TypeScript code.
