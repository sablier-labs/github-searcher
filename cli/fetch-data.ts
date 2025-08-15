import fs from "node:fs/promises";
import { join } from "node:path";
import { Octokit } from "@octokit/rest";
import dayjs from "dayjs";
import { REPOSITORIES } from "../app/lib/repositories";
import type { DiscussionQueryResponse, Repository, SearchResult } from "../app/lib/types";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PUBLIC_DIR = join(process.cwd(), "public");
const DATA_FILE = join(PUBLIC_DIR, "github-data.json");

if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN environment variable is required");
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// GraphQL query for fetching repository discussions
const DISCUSSIONS_QUERY = `#graphql
  query($owner: String!, $repo: String!, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      discussions(first: 100, after: $cursor, orderBy: { field: UPDATED_AT, direction: DESC }) {
         pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          number
          title
          body
          createdAt
          updatedAt
          url
          closed
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

async function fetchAllIssues(): Promise<SearchResult[]> {
  console.log("🐛 Fetching issues...");
  const issues: SearchResult[] = [];

  const fetchRepoIssues = async (repo: Repository) => {
    let page = 1;
    while (true) {
      try {
        const { data } = await octokit.issues.listForRepo({
          owner: repo.owner,
          page,
          per_page: 100,
          repo: repo.name,
          state: "all",
        });

        if (data.length === 0) break;

        data.forEach((issue) => {
          if (!issue.pull_request) {
            issues.push({
              author: issue.user?.login || "unknown",
              body: issue.body || "",
              createdAt: issue.created_at,
              labels: issue.labels.map((l) => (typeof l === "string" ? l : l.name || "")),
              number: issue.number,
              repository: repo.fullName,
              state: issue.state,
              title: issue.title,
              type: "issue" as const,
              updatedAt: issue.updated_at || "",
              url: issue.html_url,
            });
          }
        });

        page++;
      } catch (error) {
        console.warn(`⚠️ Failed to fetch issues for ${repo.name}:`, error);
        break;
      }
    }
  };

  const issuePromises = REPOSITORIES.map(fetchRepoIssues);
  await Promise.all(issuePromises);

  console.log(`✅ Fetched ${issues.length} issues`);
  return issues;
}

async function fetchAllDiscussions(): Promise<SearchResult[]> {
  console.log("💬 Fetching discussions...");
  const discussions: SearchResult[] = [];

  const fetchRepoDiscussions = async (repo: Repository) => {
    let cursor: string | null = null;

    while (true) {
      try {
        const response: DiscussionQueryResponse = await octokit.graphql(DISCUSSIONS_QUERY, {
          cursor,
          owner: repo.owner,
          repo: repo.name,
        });

        const discussionData = response.repository?.discussions;
        if (!discussionData || !discussionData.nodes) break;

        discussionData.nodes.forEach((discussion) => {
          discussions.push({
            author: discussion.author?.login || "unknown",
            body: discussion.body || "",
            createdAt: discussion.createdAt,
            labels: discussion.labels?.nodes?.map((label) => label.name) || [],
            number: discussion.number,
            repository: repo.fullName,
            state: discussion.closed ? "closed" : "open",
            title: discussion.title,
            type: "discussion" as const,
            updatedAt: discussion.updatedAt,
            url: discussion.url,
          });
        });

        if (!discussionData.pageInfo?.hasNextPage) break;
        cursor = discussionData.pageInfo?.endCursor ?? null;
      } catch (error) {
        console.warn(`⚠️ Failed to fetch discussions for ${repo.name}:`, error);
        break;
      }
    }
  };

  const discussionPromises = REPOSITORIES.map(fetchRepoDiscussions);
  await Promise.all(discussionPromises);

  console.log(`✅ Fetched ${discussions.length} discussions`);
  return discussions;
}

async function fetchData() {
  console.log("🚀 Starting index build...");
  const startTime = Date.now();

  const [issues, discussions] = await Promise.all([fetchAllIssues(), fetchAllDiscussions()]);

  // biome-ignore assist/source/useSortedKeys: metadata at the top
  const data = {
    metadata: {
      buildTime: dayjs().toISOString(),
      counts: {
        discussions: discussions.length,
        issues: issues.length,
      },
    },
    discussions,
    issues,
  };

  const stringifiedData = JSON.stringify(data);
  await fs.writeFile(DATA_FILE, stringifiedData);

  console.log("\n📊 Data index statistics:");
  console.log(`  - Issues: ${issues.length}`);
  console.log(`  - Discussions: ${discussions.length}`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Data index built successfully in ${elapsed}s`);
}

fetchData().catch((error) => {
  console.error("❌ Failed to build data index:", error);
  process.exit(1);
});
