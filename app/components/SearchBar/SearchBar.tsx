"use client";

import { useState } from "react";
import { Tier } from "../../lib/enums";
import { REPOSITORIES } from "../../lib/repositories";
import type { SearchContentType } from "../../lib/types";
import ContentTypeSelector from "./ContentTypeSelector";
import RepositorySelector from "./RepositorySelector";
import SearchInput from "./SearchInput";

type SearchBarProps = {
  loading: boolean;
  onSearch: (query: string, type: SearchContentType, repositories?: string[]) => void;
};

export default function SearchBar({ loading, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchContentType>("both");
  const [selectedRepos, setSelectedRepos] = useState<string[]>(() =>
    REPOSITORIES.filter((repo) => repo.tier === Tier.ACTIVE).map((repo) => repo.name),
  );
  const [isRepoSectionExpanded, setIsRepoSectionExpanded] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, type, selectedRepos.length > 0 ? selectedRepos : undefined);
      setIsRepoSectionExpanded(false);
    }
  };

  const toggleRepo = (repoName: string) => {
    setSelectedRepos((prev) =>
      prev.includes(repoName) ? prev.filter((r) => r !== repoName) : [...prev, repoName],
    );
  };

  const selectAllRepos = () => {
    setSelectedRepos(REPOSITORIES.map((repo) => repo.name));
  };

  const clearAllRepos = () => {
    setSelectedRepos([]);
  };

  const useDefaults = () => {
    setSelectedRepos(
      REPOSITORIES.filter((repo) => repo.tier === Tier.ACTIVE).map((repo) => repo.name),
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-slate-700"
    >
      <SearchInput
        query={query}
        loading={loading}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
      />

      <ContentTypeSelector type={type} loading={loading} onTypeChange={setType} />

      <RepositorySelector
        selectedRepos={selectedRepos}
        isExpanded={isRepoSectionExpanded}
        loading={loading}
        onToggleRepo={toggleRepo}
        onToggleExpanded={() => setIsRepoSectionExpanded(!isRepoSectionExpanded)}
        onSelectAll={selectAllRepos}
        onClearAll={clearAllRepos}
        onUseDefaults={useDefaults}
      />
    </form>
  );
}
