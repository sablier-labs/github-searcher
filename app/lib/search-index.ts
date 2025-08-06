import fs from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";
import { Index } from "flexsearch";
import { Tier } from "./enums";
import { REPOSITORIES } from "./repositories";
import type { SearchQuery, SearchResult } from "./types";

type IndexData = {
  issues: SearchResult[];
  discussions: SearchResult[];
  metadata: {
    buildTime: string;
    counts: {
      issues: number;
      discussions: number;
    };
  };
};

class SearchIndex {
  private data: IndexData | null = null;
  private issueIndex: Index | null = null;
  private discussionIndex: Index | null = null;
  private loading = false;

  async loadIndex(): Promise<void> {
    if (this.data || this.loading) return;

    this.loading = true;
    try {
      const indexPath = path.join(process.cwd(), "public", "github-data.json");
      const indexData = await fs.readFile(indexPath, "utf-8");
      this.data = JSON.parse(indexData);
      this.buildSearchIndices();
    } finally {
      this.loading = false;
    }
  }

  private buildSearchIndices(): void {
    if (!this.data) return;

    // Create FlexSearch index for issues
    this.issueIndex = new Index({
      cache: true,
      resolution: 9,
      tokenize: "forward",
    });

    // Create FlexSearch index for discussions
    this.discussionIndex = new Index({
      cache: true,
      resolution: 9,
      tokenize: "forward",
    });

    // Index issues
    this.data.issues.forEach((issue, idx) => {
      const searchableText = `${issue.title} ${issue.body} ${issue.labels?.join(" ") || ""}`;
      this.issueIndex?.add(idx, searchableText);
    });

    // Index discussions
    this.data.discussions.forEach((discussion, idx) => {
      const searchableText = `${discussion.title} ${discussion.body} ${discussion.labels?.join(" ") || ""}`;
      this.discussionIndex?.add(idx, searchableText);
    });
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    await this.loadIndex();

    if (!this.data || !this.issueIndex || !this.discussionIndex) {
      console.error("Search indices not loaded");
      return [];
    }

    const results: SearchResult[] = [];
    const searchTypes =
      query.type === "issues"
        ? ["issues"]
        : query.type === "discussions"
          ? ["discussions"]
          : ["issues", "discussions"];

    // If no query provided, return all items
    if (!query.query?.trim()) {
      if (searchTypes.includes("issues")) {
        results.push(...this.filterByRepositories(this.data.issues, query.repositories));
      }
      if (searchTypes.includes("discussions")) {
        results.push(...this.filterByRepositories(this.data.discussions, query.repositories));
      }
    } else {
      // Search with FlexSearch
      if (searchTypes.includes("issues")) {
        const issueIndices = this.issueIndex.search(query.query, { limit: 1000 });
        const issueResults = issueIndices
          .map((idx) => this.data?.issues[Number(idx)])
          .filter((item): item is SearchResult => item !== undefined);
        results.push(...this.filterByRepositories(issueResults, query.repositories));
      }

      if (searchTypes.includes("discussions")) {
        const discussionIndices = this.discussionIndex.search(query.query, { limit: 1000 });
        const discussionResults = discussionIndices
          .map((idx) => this.data?.discussions[Number(idx)])
          .filter((item): item is SearchResult => item !== undefined);
        results.push(...this.filterByRepositories(discussionResults, query.repositories));
      }
    }

    // Sort by state first (open before closed), then by updated date (newest first)
    const sortedResults = results.sort((a, b) => {
      // First, sort by state
      if (a.state && b.state) {
        if (a.state === "open" && b.state !== "open") return -1;
        if (a.state !== "open" && b.state === "open") return 1;
      } else if (a.state === "open") {
        return -1;
      } else if (b.state === "open") {
        return 1;
      }

      // If states are the same or both undefined, sort by updated date
      return dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf();
    });

    return query.limit ? sortedResults.slice(0, query.limit) : sortedResults;
  }

  private filterByRepositories(items: SearchResult[], repositories?: string[]): SearchResult[] {
    let targetRepositories = repositories;

    if (!targetRepositories || targetRepositories.length === 0) {
      targetRepositories = REPOSITORIES.filter((repo) => repo.tier === Tier.ACTIVE).map(
        (repo) => repo.name,
      );
    }

    // Convert repository names to full names (e.g., "lockup" -> "sablier-labs/lockup")
    const fullNames = targetRepositories.map((name) =>
      name.includes("/") ? name : `sablier-labs/${name}`,
    );

    return items.filter((item) => fullNames.includes(item.repository));
  }

  getMetadata(): IndexData["metadata"] | null {
    return this.data?.metadata || null;
  }
}

export const searchIndex = new SearchIndex();
