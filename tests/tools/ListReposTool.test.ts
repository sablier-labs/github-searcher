import { beforeEach, describe, expect, it, vi } from "vitest";
import ListReposTool from "../../mcp/tools/ListReposTool";

vi.mock("../../common/repositories.js", () => ({
  REPOSITORIES: [
    {
      fullName: "sablier-labs/test-repo-1",
      name: "test-repo-1",
      owner: "sablier-labs",
    },
    {
      fullName: "sablier-labs/test-repo-2",
      name: "test-repo-2",
      owner: "sablier-labs",
    },
  ],
}));

describe("ListReposTool", () => {
  let tool: ListReposTool;

  beforeEach(() => {
    tool = new ListReposTool();
  });

  describe("Properties", () => {
    it("should have correct name", () => {
      expect(tool.name).toBe("list_repos");
    });

    it("should have empty schema", () => {
      expect(tool.schema).toEqual({});
    });
  });

  describe("Execution", () => {
    it("should return all repositories with correct format", async () => {
      const result = await tool.execute();

      expect(result).toEqual({
        repositories: [
          {
            fullName: "sablier-labs/test-repo-1",
            name: "test-repo-1",
            owner: "sablier-labs",
          },
          {
            fullName: "sablier-labs/test-repo-2",
            name: "test-repo-2",
            owner: "sablier-labs",
          },
        ],
        totalRepositories: 2,
      });
    });

    it("should return correct total repositories count", async () => {
      const result = await tool.execute();
      expect(result.totalRepositories).toBe(2);
    });

    it("should map repository properties correctly", async () => {
      const result = await tool.execute();

      result.repositories.forEach((repo, index) => {
        expect(repo).toHaveProperty("fullName");
        expect(repo).toHaveProperty("name");
        expect(repo).toHaveProperty("owner");
        expect(repo.fullName).toBe(`sablier-labs/test-repo-${index + 1}`);
        expect(repo.name).toBe(`test-repo-${index + 1}`);
        expect(repo.owner).toBe("sablier-labs");
      });
    });

    it("should handle empty repositories list", async () => {
      vi.resetModules();
      vi.doMock("../../common/repositories.js", () => ({
        REPOSITORIES: [],
      }));

      const { default: FreshListReposTool } = await import("../../mcp/tools/ListReposTool.js");
      const freshTool = new FreshListReposTool();

      const result = await freshTool.execute();

      expect(result).toEqual({
        repositories: [],
        totalRepositories: 0,
      });

      vi.resetModules();
    });
  });

  describe("Type safety", () => {
    it("should extend MCPTool", () => {
      expect(tool).toHaveProperty("name");
      expect(tool).toHaveProperty("description");
      expect(tool).toHaveProperty("schema");
      expect(tool).toHaveProperty("execute");
    });

    it("should not require input parameters", async () => {
      const resultWithoutParams = await tool.execute();
      expect(resultWithoutParams).toBeDefined();
    });
  });
});
