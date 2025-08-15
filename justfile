# See https://github.com/sablier-labs/devkit/blob/main/just/base.just
import "./node_modules/@sablier/devkit/just/base.just"


# ---------------------------------------------------------------------------- #
#                                 DEPENDENCIES                                 #
# ---------------------------------------------------------------------------- #

# Bun: https://github.com/oven-sh/bun
bun := require("bun")


# ---------------------------------------------------------------------------- #
#                               ENVIRONMENT VARS                               #
# ---------------------------------------------------------------------------- #

GITHUB_TOKEN := env("GITHUB_TOKEN")

# ---------------------------------------------------------------------------- #
#                                    RECIPES                                   #
# ---------------------------------------------------------------------------- #

# Default recipe
default:
    just --list

# Fetch the data from GitHub (issues and discussions)
fetch-data:
    GITHUB_TOKEN={{ GITHUB_TOKEN }} na tsx cli/fetch-data.ts

# Clean the .next directory
clean:
    bunx del-cli .next

# ---------------------------------------------------------------------------- #
#                                      APP                                     #
# ---------------------------------------------------------------------------- #

# Start the Next.js app
[group("app")]
@build:
    na next build

# Start the Next.js app in dev mode
[group("app")]
@dev:
    na next dev --turbopack

# Start the Next.js app
[group("app")]
start:
    #!/usr/bin/env sh
    if [ ! -d .next ]; then
        na next build
    fi
    na next start
