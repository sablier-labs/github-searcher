import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { GitHubClient } from "../../common/github-client";
import { REPOSITORIES } from "../../common/repositories";

type GetRepoInfoInput = {
  repository: string;
};

class GetRepoInfoTool extends MCPTool<GetRepoInfoInput> {
  name = "get_repo_info";
  description = "Get detailed information about a specific Sablier Labs repository";

  schema = {
    repository: {
      description: "Repository name, e.g., 'lockup'",
      type: z.string(),
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

  async execute({ repository }: GetRepoInfoInput) {
    const fullName = REPOSITORIES.find((r) => r.name === repository)?.fullName;
    if (!fullName) {
      throw new Error(`Repository ${repository} not found`);
    }
    const repoInfo = await this.githubClient.getRepositoryInfo(fullName);
    if (!repoInfo) {
      throw new Error(`Repository ${repository} not found`);
    }

    return {
      createdAt: repoInfo.created_at,
      description: repoInfo.description,
      forks: repoInfo.forks_count,
      fullName: repoInfo.full_name,
      language: repoInfo.language,
      name: repoInfo.name,
      openIssues: repoInfo.open_issues_count,
      private: repoInfo.private,
      stars: repoInfo.stargazers_count,
      updatedAt: repoInfo.updated_at,
      url: repoInfo.html_url,
    };
  }
}

export default GetRepoInfoTool;
