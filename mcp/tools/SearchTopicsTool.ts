import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { GitHubClient } from "../../common/github-client";
import type { SearchContentType } from "../../common/types";

type SearchTopicsInput = {
  query: string;
  limit?: number;
  repositories?: string[];
  type?: "issues" | "discussions" | "both";
};

class SearchTopicsTool extends MCPTool<SearchTopicsInput> {
  name = "search_topics";
  description = `Search for topics across all Sablier Labs repositories (issues and discussions).
    Use this to check if a topic has been discussed before.`;

  // biome-ignore assist/source/useSortedKeys: order matters
  schema = {
    query: {
      description: "Search query to find relevant issues and discussions",
      type: z.string(),
    },
    limit: {
      description: "Maximum number of results to return (default: no limit)",
      type: z.number().optional(),
    },
    repositories: {
      description: "Specific repository names to search (optional, defaults to all Sablier repos)",
      type: z.array(z.string()).optional(),
    },
    type: {
      description: "Type of content to search (default: both)",
      type: z.enum(["issues", "discussions", "both"]).optional(),
    },
  };

  private githubClient: GitHubClient;

  constructor() {
    super();
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error("GITHUB_TOKEN environment variable is required");
    }
    this.githubClient = new GitHubClient(githubToken);
  }

  async execute({ query, limit, repositories, type }: SearchTopicsInput) {
    const searchQuery = {
      limit,
      query,
      repositories,
      type: type as SearchContentType | undefined,
    };

    const results = await this.githubClient.searchAcrossRepositories(searchQuery);

    return {
      query: searchQuery.query,
      results: results.map((result) => ({
        author: result.author,
        createdAt: result.createdAt,
        labels: result.labels,
        preview: result.body
          ? result.body.substring(0, 200) + (result.body.length > 200 ? "..." : "")
          : undefined,
        repository: result.repository,
        state: result.state,
        title: result.title,
        type: result.type,
        updatedAt: result.updatedAt,
        url: result.url,
      })),
      totalResults: results.length,
    };
  }
}

export default SearchTopicsTool;
