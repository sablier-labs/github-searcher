"use client";

import dayjs from "dayjs";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SearchBar from "./components/SearchBar/SearchBar";
import SearchResults from "./components/SearchResults/SearchResults";
import type { SearchResult } from "./lib/types";

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexMetadata, setIndexMetadata] = useState<{
    buildTime: string;
    counts: {
      issues: number;
      discussions: number;
    };
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results.length]);

  const handleSearch = async (
    query: string,
    type: "issues" | "discussions" | "both",
    repositories?: string[],
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        body: JSON.stringify({
          limit: 100,
          query,
          repositories,
          type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results);
      setIndexMetadata(data.metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Image
              src="https://raw.githubusercontent.com/sablier-labs/branding/refs/heads/main/icon/svg/icon.svg"
              alt="Sablier Logo"
              width={48}
              height={48}
            />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Sablier GitHub Searcher
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Search across all Sablier Labs issues and discussions on GitHub. Find conversations,
            feature requests, bug reports, and community discussions using keywords.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <SearchResults ref={resultsRef} results={results} loading={loading} />

        {indexMetadata && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Data last indexed at: {dayjs(indexMetadata.buildTime).format("D MMM YYYY")} •{" "}
            {indexMetadata.counts.issues} issues • {indexMetadata.counts.discussions} discussions
          </div>
        )}

        <footer className="mt-16 text-center">
          <a
            href="https://github.com/sablier-labs/github-searcher"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <Image
              src="https://svgrepo.com/show/303615/github-icon-1-logo.svg"
              alt="GitHub"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Source code
          </a>
        </footer>
      </div>
    </main>
  );
}
