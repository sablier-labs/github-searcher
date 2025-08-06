import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { GitHubClient } from "../../../common/github-client";
import type { SearchContentType } from "../../../common/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const type = searchParams.get("type") as SearchContentType;
  const repositories = searchParams.get("repositories");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
  }

  try {
    const client = new GitHubClient(githubToken);

    const results = await client.searchAcrossRepositories({
      query,
      repositories: repositories ? repositories.split(",") : undefined,
      type: type || "both",
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
