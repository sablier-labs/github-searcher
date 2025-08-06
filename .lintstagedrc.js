/**
 * @type {import("lint-staged").Configuration}
 */
module.exports = {
  "*.{cjs,js,json,jsonc,mjs,ts}": "bun biome check --write",
  "*.{cjs,js,mjs,ts}": "bun biome lint --write --only correctness/noUnusedImports",
  "*.{md,yml}": "bun prettier --cache --write",
};
