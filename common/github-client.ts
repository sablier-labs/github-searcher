import { Octokit } from "@octokit/rest";
import Fuse from "fuse.js";
import _ from "lodash";
import { logger } from "mcp-framework";
import { REPOSITORIES } from "./repositories";
import type {
  DiscussionQueryResponse,
  GitHubDiscussion,
  Repository,
  SearchQuery,
  SearchResult,
} from "./types";

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /* -------------------------------------------------------------------------- */
  /*                                  PUBLIC                                    */
  /* -------------------------------------------------------------------------- */

  async getRepositoryInfo(fullName: string) {
    const [owner, name] = fullName.split("/");
    try {
      const { data } = await this.octokit.rest.repos.get({ owner, repo: name });
      return data;
    } catch (error) {
      console.error(`Error getting repository info for ${fullName}:`, error);
      return null;
    }
  }

  async searchAcrossRepositories(query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    // Default to ACTIVE repositories if no repositories specified or empty array
    const repositories =
      query.repositories && query.repositories.length > 0
        ? REPOSITORIES.filter((repo) => query.repositories?.includes(repo.name))
        : REPOSITORIES.filter((repo) => repo.tier === "active");

    const searchTypes =
      query.type === "issues"
        ? ["issues"]
        : query.type === "discussions"
          ? ["discussions"]
          : ["issues", "discussions"];

    await Promise.all(
      _.map(repositories, async (repo) => {
        for (const searchType of searchTypes) {
          try {
            if (searchType === "issues") {
              const allIssues = await this.fetchAllIssues(repo);
              const searchResults = this.fuzzySearch(allIssues, query.query);
              results.push(...searchResults);
            } else if (searchType === "discussions") {
              const allDiscussions = await this.fetchAllDiscussions(repo);
              const searchResults = this.fuzzySearch(allDiscussions, query.query);
              results.push(...searchResults);
            }
          } catch (error) {
            console.error(`Error searching ${searchType} in ${repo.fullName}:`, error);
          }
        }
      }),
    );

    const sortedResults = results.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return query.limit ? sortedResults.slice(0, query.limit) : sortedResults;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   PRIVATE                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * ARCHITECTURE NOTE:
   * The GitHubClient is now separated into two phases:
   * 1. FETCHING: These methods (fetchAllIssues, fetchAllDiscussions) handle pagination
   *    and retrieve ALL data from repositories, continuing until no more pages exist.
   * 2. SEARCHING: The fuzzySearch method performs local search on the fetched data.
   *
   * This separation allows for:
   * - Complete data retrieval (no 100-item limits)
   * - Better search performance (local fuzzy search vs API filtering)
   * - Potential caching of fetched data for subsequent searches
   */

  private fuzzySearch(items: SearchResult[], query: string): SearchResult[] {
    // If no query provided, return all items
    if (!query.trim()) {
      return items;
    }

    // Configure Fuse.js for searching issues/discussions
    const fuseOptions = {
      distance: 100, // How far from the beginning of text to search
      includeScore: true,
      keys: [
        { name: "title", weight: 0.7 }, // Title is more important
        { name: "body", weight: 0.3 }, // Body is less important
        { name: "labels", weight: 0.2 }, // Labels have some relevance
      ],
      minMatchCharLength: 2, // Minimum character length for matches
      shouldSort: true,
      threshold: 0.4, // Lower = more strict, higher = more permissive
    };

    const fuse = new Fuse(items, fuseOptions);
    const results = fuse.search(query);

    // Return the items from the search results (Fuse wraps them in { item, score })
    return results.map((result) => result.item);
  }

  /**
   * Fetch all discussions from a repository using pagination
   */
  private async fetchAllDiscussions(repo: Repository): Promise<SearchResult[]> {
    const allDiscussions: SearchResult[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    const query = `#graphql
      query($owner: String!, $name: String!, $first: Int!, $after: String) {
        repository(owner: $owner, name: $name) {
          discussions(first: $first, after: $after, orderBy: { field: UPDATED_AT, direction: DESC }) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              body
              createdAt
              number
              title
              updatedAt
              url
              author {
                login
              }
              labels(first: 10) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    `;

    while (hasNextPage) {
      try {
        logger.info(
          `Fetching discussions for ${repo.fullName}${cursor ? ` (cursor: ${cursor})` : ""}`,
        );

        const response: DiscussionQueryResponse =
          await this.octokit.graphql<DiscussionQueryResponse>(query, {
            after: cursor,
            first: 100,
            name: repo.name,
            owner: repo.owner,
          });

        const discussionsData = response.repository?.discussions;
        const discussions: GitHubDiscussion[] = discussionsData?.nodes || [];
        const pageInfo = discussionsData?.pageInfo;

        // Convert discussions to SearchResult format
        const searchResults = discussions.map((discussion: GitHubDiscussion) => ({
          author: discussion.author?.login || "unknown",
          body: discussion.body || "",
          createdAt: discussion.createdAt,
          labels: discussion.labels?.nodes?.map((label: { name: string }) => label.name) || [],
          number: discussion.number,
          repository: repo.fullName,
          title: discussion.title,
          type: "discussion" as const,
          updatedAt: discussion.updatedAt,
          url: discussion.url,
        }));

        allDiscussions.push(...searchResults);

        // Update pagination state
        hasNextPage = pageInfo?.hasNextPage || false;
        cursor = pageInfo?.endCursor || null;

        logger.info(
          `Fetched ${discussions.length} discussions from ${repo.fullName}. Total: ${allDiscussions.length}`,
        );
      } catch (error) {
        console.error(`GraphQL error for ${repo.fullName}:`, error);
        break;
      }
    }

    return allDiscussions;
  }

  /**
   * Fetch all issues from a repository using pagination
   */
  private async fetchAllIssues(repo: Repository): Promise<SearchResult[]> {
    const allIssues: SearchResult[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        logger.info(`Fetching issues for ${repo.fullName} (page: ${page})`);

        const { data } = await this.octokit.rest.issues.listForRepo({
          owner: repo.owner,
          page,
          per_page: 100,
          repo: repo.name,
          state: "all",
        });

        // Convert issues to SearchResult format (filter out pull requests)
        const searchResults = data
          .filter((issue) => !issue.pull_request)
          .map((issue) => ({
            author: issue.user?.login || "unknown",
            body: issue.body || "",
            createdAt: issue.created_at,
            labels: issue.labels.map((label) =>
              typeof label === "string" ? label : label.name || "",
            ),
            number: issue.number,
            repository: repo.fullName,
            state: issue.state,
            title: issue.title,
            type: "issue" as const,
            updatedAt: issue.updated_at || "",
            url: issue.html_url,
          }));

        allIssues.push(...searchResults);

        // Check if we have more pages
        hasMorePages = data.length === 100;
        page++;

        logger.info(
          `Fetched ${data.length} issues from ${repo.fullName} (${searchResults.length} actual issues). Total: ${allIssues.length}`,
        );
      } catch (error) {
        console.error(`REST API error for ${repo.fullName}:`, error);
        break;
      }
    }

    return allIssues;
  }
}
