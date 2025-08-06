## Contributing

### Prerequisites

- [Node.js](https://nodejs.org) (v20+)
- [Bun](https://bun.sh) (package manager)
- [Just](https://github.com/casey/just) (command runner)
- [Ni](https://github.com/antfu-collective/ni) (package manager resolver)

### Setup

```bash
git clone https://github.com/sablier-labs/github-searcher.git
cd github-searcher
bun install
```

### Available Commands

```bash
just --list                 # Show all available commands
just build                  # Build the TypeScript package
just full-check             # Run all code checks
just full-write             # Run all code fixes
just test                   # Run test suite
```

### Development Workflow

1. Fork the repository
1. Create a feature branch
1. Make your changes
1. Run `just full-check` to verify code quality
1. Submit a pull request

## Adding a New Repository

Add the repository to the [`repositories.ts`](./app/lib/repositories.ts) file, and then create a PR.
