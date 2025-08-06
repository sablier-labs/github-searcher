"use client";

import { forwardRef } from "react";
import type { SearchResult } from "../../../common/types";
import LoadingIndicator from "./LoadingIndicator";
import ResultsHeader from "./ResultsHeader";
import ResultCard from "./ResultCard";

type SearchResultsProps = {
  results: SearchResult[];
  loading: boolean;
};

const SearchResults = forwardRef<HTMLDivElement, SearchResultsProps>(
  ({ results, loading }, ref) => {
    if (loading) {
      return <LoadingIndicator />;
    }

    if (results.length === 0) {
      return null;
    }

    return (
      <div ref={ref} className="mt-12">
        <ResultsHeader count={results.length} />
        
        <div className="grid gap-6">
          {results.map((result) => (
            <ResultCard key={result.url} result={result} />
          ))}
        </div>
      </div>
    );
  },
);

SearchResults.displayName = "SearchResults";

export default SearchResults;
