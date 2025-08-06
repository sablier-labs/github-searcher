import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GitHubClient } from "../../common/github-client";
import type { SearchResult } from "../../common/types";
import SearchTopicsTool from "../../mcp/tools/SearchTopicsTool";

// Mock the GitHubClient module
vi.mock("../../common/github-client.js", () => ({
  GitHubClient: vi.fn(),
}));

// Mock environment variable
const originalEnv = process.env;

describe("SearchTopicsTool", () => {
  let tool: SearchTopicsTool;
  let mockSearchAcrossRepositories: ReturnType<typeof vi.fn>;

  const mockResults: SearchResult[] = [
    {
      author: "PaulRBerg",
      body: "Discussion about architectural decisions",
      createdAt: "2025-01-01T10:00:00Z",
      labels: [],
      number: 123,
      repository: "sablier-labs/lockup",
      state: "open",
      title: "Architecture Discussion: bespoke NFT contracts",
      type: "discussion",
      updatedAt: "2025-02-02T10:00:00Z",
      url: "https://github.com/sablier-labs/lockup/discussions/123",
    },
    {
      author: "razgraf",
      body: "This is a long description about a feature request that needs to be implemented in the next release. It involves multiple components and requires careful planning and coordination between teams. Additional details about the implementation strategy and timeline.",
      createdAt: "2025-01-03T10:00:00Z",
      labels: ["priority: 2", "type: feature"],
      number: 45,
      repository: "sablier-labs/flow",
      title: "Feature Request: yield-bearing streams",
      type: "issue",
      updatedAt: "2025-02-04T10:00:00Z",
      url: "https://github.com/sablier-labs/flow/issues/45",
    },
    {
      author: "maxdesalle",
      body: undefined,
      createdAt: "2025-01-05T10:00:00Z",
      labels: ["priority: 1", "type: bug"],
      number: 67,
      repository: "sablier-labs/sdk",
      state: "closed",
      title: "Bug Report: addresses not loaded correctly from CSV",
      type: "issue",
      updatedAt: "2025-02-06T10:00:00Z",
      url: "https://github.com/sablier-labs/sdk/issues/67",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset environment
    process.env = { ...originalEnv, GITHUB_TOKEN: "test-token" };

    // Setup mock for GitHubClient
    mockSearchAcrossRepositories = vi.fn().mockResolvedValue(mockResults);

    (GitHubClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      searchAcrossRepositories: mockSearchAcrossRepositories,
    }));

    tool = new SearchTopicsTool();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Constructor", () => {
    it("should throw error when GITHUB_TOKEN is not set", () => {
      delete process.env.GITHUB_TOKEN;

      expect(() => new SearchTopicsTool()).toThrow("GITHUB_TOKEN environment variable is required");
    });

    it("should create GitHubClient when GITHUB_TOKEN is set", () => {
      expect(GitHubClient).toHaveBeenCalledWith("test-token");
    });
  });

  describe("Properties", () => {
    it("should have correct name", () => {
      expect(tool.name).toBe("search_topics");
    });

    it("should have correct schema", () => {
      expect(tool.schema).toHaveProperty("query");
      expect(tool.schema).toHaveProperty("repositories");
      expect(tool.schema).toHaveProperty("type");
      expect(tool.schema).toHaveProperty("limit");
    });
  });

  describe("Execution", () => {
    it("should handle undefined body in issue", async () => {
      const result = await tool.execute({ query: "test" });

      const thirdResult = result.results[2];
      expect(thirdResult.preview).toBeUndefined();
    });

    it("should handle empty results", async () => {
      mockSearchAcrossRepositories.mockResolvedValueOnce([]);

      const result = await tool.execute({ query: "nonexistent" });

      expect(result).toEqual({
        query: "nonexistent",
        results: [],
        totalResults: 0,
      });
    });

    it("should handle search errors gracefully", async () => {
      mockSearchAcrossRepositories.mockRejectedValueOnce(new Error("API Error"));

      await expect(tool.execute({ query: "test" })).rejects.toThrow("API Error");
    });

    it("should search with query only", async () => {
      const result = await tool.execute({ query: "test query" });

      expect(mockSearchAcrossRepositories).toHaveBeenCalledWith({
        limit: undefined,
        query: "test query",
        repositories: undefined,
        type: undefined,
      });

      expect(result.query).toBe("test query");
      expect(result.totalResults).toBe(3);
      expect(result.results).toHaveLength(3);
    });

    it("should search with specific repositories", async () => {
      const repositories = ["sablier-labs/lockup", "sablier-labs/flow"];

      await tool.execute({
        query: "test",
        repositories,
      });

      expect(mockSearchAcrossRepositories).toHaveBeenCalledWith({
        limit: undefined,
        query: "test",
        repositories,
        type: undefined,
      });
    });

    it("should apply limit to results", async () => {
      await tool.execute({
        limit: 5,
        query: "test",
      });

      expect(mockSearchAcrossRepositories).toHaveBeenCalledWith({
        limit: 5,
        query: "test",
        repositories: undefined,
        type: undefined,
      });
    });

    it("should search with type filter for issues only", async () => {
      await tool.execute({
        query: "bug",
        type: "issues",
      });

      expect(mockSearchAcrossRepositories).toHaveBeenCalledWith({
        limit: undefined,
        query: "bug",
        repositories: undefined,
        type: "issues",
      });
    });

    it("should search with type filter for discussions only", async () => {
      await tool.execute({
        query: "architecture",
        type: "discussions",
      });

      expect(mockSearchAcrossRepositories).toHaveBeenCalledWith({
        limit: undefined,
        query: "architecture",
        repositories: undefined,
        type: "discussions",
      });
    });

    it("should search with type filter for both issues and discussions", async () => {
      await tool.execute({
        query: "feature",
        type: "both",
      });

      expect(mockSearchAcrossRepositories).toHaveBeenCalledWith({
        limit: undefined,
        query: "feature",
        repositories: undefined,
        type: "both",
      });
    });

    it("should handle all parameters combined", async () => {
      await tool.execute({
        limit: 10,
        query: "complex search",
        repositories: ["sablier-labs/lockup"],
        type: "issues",
      });

      expect(mockSearchAcrossRepositories).toHaveBeenCalledWith({
        limit: 10,
        query: "complex search",
        repositories: ["sablier-labs/lockup"],
        type: "issues",
      });
    });

    it("should map all result fields correctly", async () => {
      const result = await tool.execute({ query: "test" });

      expect(result.results[0]).toEqual({
        author: "PaulRBerg",
        createdAt: "2025-01-01T10:00:00Z",
        labels: [],
        preview: "Discussion about architectural decisions",
        repository: "sablier-labs/lockup",
        state: "open",
        title: "Architecture Discussion: bespoke NFT contracts",
        type: "discussion",
        updatedAt: "2025-02-02T10:00:00Z",
        url: "https://github.com/sablier-labs/lockup/discussions/123",
      });
    });

    it("should truncate long body text to preview", async () => {
      const result = await tool.execute({ query: "test" });

      const secondResult = result.results[1];
      // Body is > 200 chars, so it gets truncated at 200 chars with "..."
      const body = mockResults[1].body || "";
      const expectedPreview = body.substring(0, 200) + "...";
      expect(secondResult.preview).toBe(expectedPreview);
    });

    it("should handle body text shorter than 200 chars", async () => {
      const result = await tool.execute({ query: "test" });

      const firstResult = result.results[0];
      expect(firstResult.preview).toBe("Discussion about architectural decisions");
    });
  });

  describe("Type safety", () => {
    it("should extend MCPTool", () => {
      expect(tool).toHaveProperty("name");
      expect(tool).toHaveProperty("description");
      expect(tool).toHaveProperty("schema");
      expect(tool).toHaveProperty("execute");
    });

    it("should handle missing query parameter", async () => {
      // The tool doesn't validate query parameter, it passes undefined
      // @ts-expect-error - Testing missing required parameter
      const result = await tool.execute({});

      expect(result.query).toBeUndefined();
      expect(mockSearchAcrossRepositories).toHaveBeenCalledWith({
        limit: undefined,
        query: undefined,
        repositories: undefined,
        type: undefined,
      });
    });

    it("should accept optional parameters", async () => {
      const result = await tool.execute({
        query: "test",
        // All other params are optional
      });

      expect(result).toBeDefined();
    });
  });
});
