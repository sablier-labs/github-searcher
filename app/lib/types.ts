import type { components } from "@octokit/openapi-types";
import type * as enums from "./enums";

export type GitHubIssue = components["schemas"]["issue"];

export type GitHubDiscussion = {
  author?: { login: string } | null;
  body?: string | null;
  closed: boolean;
  createdAt: string;
  number: number;
  title: string;
  updatedAt: string;
  url: string;
  labels?: {
    nodes?: Array<{ name: string }>;
  } | null;
};

export type DiscussionQueryResponse = {
  repository?: {
    discussions?: {
      nodes?: GitHubDiscussion[];
      pageInfo?: {
        hasNextPage: boolean;
        endCursor?: string | null;
      };
    };
  };
};

export type Repository = {
  fullName: string;
  name: string;
  owner: string;
  tier: Tier;
};

export type SearchContentType = "issues" | "discussions" | "both";

export type SearchQuery = {
  query: string;
  limit?: number;
  repositories?: string[];
  type?: SearchContentType;
};

/**
 * Unified search result that normalizes both GitHub issues (REST API) and discussions (GraphQL)
 * into a consistent format. We don't use GitHub's search result types (issue-search-result-item, etc.)
 * because they are endpoint-specific and don't cover our cross-API use case.
 */
export type SearchResult = {
  author: string;
  body?: string;
  createdAt: string;
  labels?: string[];
  number: number;
  repository: string;
  state?: string;
  title: string;
  type: "issue" | "discussion";
  updatedAt: string;
  url: string;
};

export type Tier = `${enums.Tier}` | enums.Tier;
