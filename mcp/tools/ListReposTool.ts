import { MCPTool } from "mcp-framework";
import { REPOSITORIES } from "../../common/repositories";

// biome-ignore lint/complexity/noBannedTypes: empty object is fine
type ListReposInput = {};

class ListReposTool extends MCPTool<ListReposInput> {
  name = "list_repos";
  description = "List all Sablier Labs repositories that this server monitors";

  schema = {};

  async execute() {
    return {
      repositories: REPOSITORIES.map((repo) => ({
        fullName: repo.fullName,
        name: repo.name,
        owner: repo.owner,
      })),
      totalRepositories: REPOSITORIES.length,
    };
  }
}

export default ListReposTool;
