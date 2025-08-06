import { Tier } from "./enums";
import type { Repository } from "./types";

/**
 * Helper function to create a repository object with consistent owner.
 */
function define(name: string, tier: Tier = Tier.ACTIVE): Repository {
  return {
    fullName: `sablier-labs/${name}`,
    name,
    owner: "sablier-labs",
    tier,
  };
}

export const REPOSITORIES: Repository[] = [
  /* -------------------------------------------------------------------------- */
  /*                                   ACTIVE                                   */
  /* -------------------------------------------------------------------------- */
  define("airdrops", Tier.ACTIVE),
  define("command-center", Tier.ACTIVE),
  define("docs", Tier.ACTIVE),
  define("evm-utils", Tier.ACTIVE),
  define("flow", Tier.ACTIVE),
  define("indexers", Tier.ACTIVE),
  define("interfaces", Tier.ACTIVE),
  define("lockup", Tier.ACTIVE),
  define("sdk", Tier.ACTIVE),
  define("solsab", Tier.ACTIVE),
  /* -------------------------------------------------------------------------- */
  /*                                 OCCASIONAL                                 */
  /* -------------------------------------------------------------------------- */
  define("audits", Tier.OCCASIONAL),
  define("benchmarks", Tier.OCCASIONAL),
  define("business-contracts", Tier.OCCASIONAL),
  define("deployments", Tier.OCCASIONAL),
  define("devkit", Tier.OCCASIONAL),
  define("discussions", Tier.OCCASIONAL),
  define("gha-utils", Tier.ACTIVE),
  define("github-labels", Tier.OCCASIONAL),
  define("scripts", Tier.OCCASIONAL),
  define("sablier-labs.github.io", Tier.OCCASIONAL),
  define("sandbox", Tier.OCCASIONAL),
  /* -------------------------------------------------------------------------- */
  /*                                   LEGACY                                   */
  /* -------------------------------------------------------------------------- */
  define("legacy-contracts", Tier.LEGACY),
  define("legacy-interfaces", Tier.LEGACY),
  define("onchain-analytics", Tier.LEGACY),
  /* -------------------------------------------------------------------------- */
  /*                                  ARCHIVED                                  */
  /* -------------------------------------------------------------------------- */
  define("v2-periphery", Tier.ARCHIVED),
];
