import { REPOSITORIES } from "../../lib/repositories";
import RepositoryCompactView from "./RepositoryCompactView";
import TierSection from "./TierSection";

type RepositorySelectorProps = {
  selectedRepos: string[];
  isExpanded: boolean;
  loading: boolean;
  onToggleRepo: (repoName: string) => void;
  onToggleExpanded: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onUseDefaults: () => void;
};

export default function RepositorySelector({
  selectedRepos,
  isExpanded,
  loading,
  onToggleRepo,
  onToggleExpanded,
  onSelectAll,
  onClearAll,
  onUseDefaults,
}: RepositorySelectorProps) {
  const reposByTier = REPOSITORIES.reduce(
    (acc, repo) => {
      if (!acc[repo.tier]) {
        acc[repo.tier] = [];
      }
      acc[repo.tier].push(repo);
      return acc;
    },
    {} as Record<string, typeof REPOSITORIES>,
  );

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <label htmlFor="repositories" className="block text-lg font-semibold text-gray-800">
            Repositories
          </label>
          <button
            type="button"
            onClick={onToggleExpanded}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            disabled={loading}
          >
            {isExpanded ? "▼ Collapse" : "▶ Expand"}
          </button>
          {!isExpanded && (
            <span className="text-sm text-gray-600">({selectedRepos.length} selected)</span>
          )}
        </div>
        {isExpanded && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onUseDefaults}
              className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
              disabled={loading}
            >
              Use Defaults
            </button>
            <button
              type="button"
              onClick={onSelectAll}
              className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer"
              disabled={loading}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={onClearAll}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              disabled={loading}
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">Select repositories to include in your search</p>

      {isExpanded ? (
        <div className="space-y-4">
          {Object.entries(reposByTier).map(([tier, repos]) => (
            <TierSection
              key={tier}
              tier={tier}
              repos={repos}
              selectedRepos={selectedRepos}
              loading={loading}
              onToggleRepo={onToggleRepo}
            />
          ))}
        </div>
      ) : (
        <RepositoryCompactView selectedRepos={selectedRepos} />
      )}
    </div>
  );
}
