"use client";

import { useState } from "react";
import { Tier } from "../../../common/enums";
import { REPOSITORIES } from "../../../common/repositories";
import type { SearchContentType } from "../../../common/types";
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
  const [showSelectAllWarning, setShowSelectAllWarning] = useState(false);

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
    setShowSelectAllWarning(true);
    // Auto-hide warning after 5 seconds
    setTimeout(() => setShowSelectAllWarning(false), 5000);
  };

  const clearAllRepos = () => {
    setSelectedRepos([]);
    setShowSelectAllWarning(false);
  };

  const useDefaults = () => {
    setSelectedRepos(
      REPOSITORIES.filter((repo) => repo.tier === Tier.ACTIVE).map((repo) => repo.name),
    );
    setShowSelectAllWarning(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-8 border border-gray-200"
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
        showSelectAllWarning={showSelectAllWarning}
        loading={loading}
        onToggleRepo={toggleRepo}
        onToggleExpanded={() => setIsRepoSectionExpanded(!isRepoSectionExpanded)}
        onSelectAll={selectAllRepos}
        onClearAll={clearAllRepos}
        onUseDefaults={useDefaults}
        onDismissWarning={() => setShowSelectAllWarning(false)}
      />
    </form>
  );
}
