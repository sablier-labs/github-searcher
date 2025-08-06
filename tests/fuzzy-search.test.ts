import { describe, expect, it, vi } from "vitest";
import type { SearchResult } from "../common/types";

// Mock the dependencies
vi.mock("../common/repositories.js", () => ({
  REPOSITORIES: [],
}));

vi.mock("lodash", () => ({
  default: {
    sortBy: <T>(arr: T[]) => arr,
  },
}));

vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    graphql: {
      paginate: vi.fn(),
    },
    paginate: vi.fn(),
    rest: {
      issues: {
        listForRepo: vi.fn(),
      },
    },
  })),
}));

// Import after mocks are set up
import { GitHubClient } from "../common/github-client";

// Create a test class that extends GitHubClient to access private methods for testing
class TestableGitHubClient extends GitHubClient {
  // Make the private fuzzySearch method public for testing
  public testFuzzySearch(items: SearchResult[], query: string): SearchResult[] {
    // @ts-expect-error - accessing private method for testing
    return this.fuzzySearch(items, query);
  }
}

describe("Fuzzy Search Logic", () => {
  // Create a testable instance with a dummy token
  const client = new TestableGitHubClient("dummy-token");

  // Helper to create SearchResult objects for testing
  const createSearchResult = (
    title: string,
    body: string = "",
    labels: string[] = [],
  ): SearchResult => ({
    author: "testuser",
    body,
    createdAt: "2025-01-01T00:00:00Z",
    labels,
    number: 1,
    repository: "test/repo",
    state: "open",
    title,
    type: "issue",
    updatedAt: "2025-01-01T00:00:00Z",
    url: "https://github.com/test/repo/issues/1",
  });

  it("should return empty array for no matches", () => {
    const items = [createSearchResult("Bug Report"), createSearchResult("Feature Request")];

    const results = client.testFuzzySearch(items, "nonexistent");
    expect(results).toHaveLength(0);
  });

  it("should return all items for empty query", () => {
    const items = [
      createSearchResult("Issue 1"),
      createSearchResult("Issue 2"),
      createSearchResult("Issue 3"),
    ];

    const results = client.testFuzzySearch(items, "");
    expect(results).toHaveLength(3);
  });

  it("should match exact titles", () => {
    const items = [
      createSearchResult("Bug in Authentication System"),
      createSearchResult("Feature Request"),
      createSearchResult("Documentation Update"),
    ];

    const results = client.testFuzzySearch(items, "Bug in Authentication System");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Bug in Authentication System");
  });

  it("should match partial titles (case insensitive)", () => {
    const items = [
      createSearchResult("Bug in Authentication System"),
      createSearchResult("User Authentication Module"),
      createSearchResult("Feature Request"),
    ];

    const results = client.testFuzzySearch(items, "authentication");
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.title)).toContain("Bug in Authentication System");
    expect(results.map((r) => r.title)).toContain("User Authentication Module");
  });

  it("should match content in body", () => {
    const items = [
      createSearchResult("Issue 1", "This has authentication problems"),
      createSearchResult("Issue 2", "Database connection fails"),
      createSearchResult("Issue 3", "UI authentication dialog broken"),
    ];

    const results = client.testFuzzySearch(items, "authentication");
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.title)).toContain("Issue 1");
    expect(results.map((r) => r.title)).toContain("Issue 3");
  });

  it("should handle typos and fuzzy matching", () => {
    const items = [
      createSearchResult("Authentication Bug"),
      createSearchResult("Authorization Error"),
      createSearchResult("Feature Request"),
    ];

    // Should match "Authentication" even with typo, and may also match "Authorization"
    const results = client.testFuzzySearch(items, "authenticaton");
    expect(results.length).toBeGreaterThan(0);
    expect(results.map((r) => r.title)).toContain("Authentication Bug");
  });

  it("should match labels", () => {
    const items = [
      createSearchResult("Issue 1", "Some content", ["bug", "authentication"]),
      createSearchResult("Issue 2", "Some content", ["feature", "ui"]),
      createSearchResult("Issue 3", "Some content", ["bug", "database"]),
    ];

    const results = client.testFuzzySearch(items, "authentication");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Issue 1");
  });

  it("should handle multiple word queries", () => {
    const items = [
      createSearchResult("User Login System", "Authentication module for users"),
      createSearchResult("Login Bug", "User cannot login"),
      createSearchResult("System Error", "Database connection failed"),
    ];

    const results = client.testFuzzySearch(items, "user login");
    expect(results).toHaveLength(2);
    // Should include both items that contain both "user" and "login"
    expect(results.map((r) => r.title)).toContain("User Login System");
    expect(results.map((r) => r.title)).toContain("Login Bug");
  });

  it("should prioritize title matches over body matches", () => {
    const items = [
      createSearchResult("Other Issue", "authentication problems in the system"),
      createSearchResult("Authentication Bug", "some other content"),
    ];

    const results = client.testFuzzySearch(items, "authentication");
    expect(results).toHaveLength(2);
    // The item with "Authentication" in title should come first
    expect(results[0].title).toBe("Authentication Bug");
  });

  it("should handle special characters", () => {
    const items = [
      createSearchResult("Fix @mention bug"),
      createSearchResult("Add #hashtag support"),
      createSearchResult("Regular issue"),
    ];

    const mentionResults = client.testFuzzySearch(items, "@mention");
    expect(mentionResults).toHaveLength(1);
    expect(mentionResults[0].title).toBe("Fix @mention bug");

    const hashtagResults = client.testFuzzySearch(items, "#hashtag");
    expect(hashtagResults).toHaveLength(1);
    expect(hashtagResults[0].title).toBe("Add #hashtag support");
  });

  it("should handle typos better than simple string matching", () => {
    const items = [
      createSearchResult("Authentication System", "Login module"),
      createSearchResult("Authorization Flow", "Permission checks"),
      createSearchResult("User Interface", "Frontend components"),
    ];

    // Fuse.js should handle the typo in "authenticaton"
    const results = client.testFuzzySearch(items, "authenticaton");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain("Authentication");
  });

  it("should rank results by relevance", () => {
    const items = [
      createSearchResult("Minor authentication issue", "small bug in auth module"),
      createSearchResult("Authentication System Redesign", "complete overhaul of authentication"),
      createSearchResult("Other issue", "mentions authentication briefly"),
    ];

    const results = client.testFuzzySearch(items, "authentication system");
    // Should rank the item with both "authentication" and "system" in title highest
    expect(results[0].title).toBe("Authentication System Redesign");
  });
});
