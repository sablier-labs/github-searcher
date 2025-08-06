import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { searchIndex } from "../../lib/search-index";
import type { SearchQuery } from "../../lib/types";

export async function POST(request: NextRequest) {
  try {
    const query: SearchQuery = await request.json();

    // Perform search using the pre-indexed data
    const results = await searchIndex.search(query);

    return NextResponse.json({
      metadata: searchIndex.getMetadata(),
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Load the index and return metadata
    await searchIndex.loadIndex();
    const metadata = searchIndex.getMetadata();

    return NextResponse.json({ metadata });
  } catch (error) {
    console.error("Failed to get index metadata:", error);
    return NextResponse.json({ error: "Failed to load index metadata" }, { status: 500 });
  }
}
