import { Tier } from "../../lib/enums";
import type { REPOSITORIES } from "../../lib/repositories";

type TierSectionProps = {
  tier: string;
  repos: typeof REPOSITORIES;
  selectedRepos: string[];
  loading: boolean;
  onToggleRepo: (repoName: string) => void;
};

export default function TierSection({
  tier,
  repos,
  selectedRepos,
  loading,
  onToggleRepo,
}: TierSectionProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case Tier.ACTIVE:
        return "border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-l-green-400";
      case Tier.OCCASIONAL:
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400";
      case Tier.LEGACY:
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-l-yellow-400";
      case Tier.ARCHIVED:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-800/50 dark:border-l-gray-400";
      default:
        return "border-l-gray-300 bg-gray-50 dark:bg-gray-800/50 dark:border-l-gray-500";
    }
  };

  const getTierTextColor = (tier: string) => {
    switch (tier) {
      case Tier.ACTIVE:
        return "text-green-700 dark:text-green-400";
      case Tier.OCCASIONAL:
        return "text-blue-700 dark:text-blue-400";
      case Tier.LEGACY:
        return "text-yellow-700 dark:text-yellow-400";
      case Tier.ARCHIVED:
        return "text-gray-700 dark:text-gray-400";
      default:
        return "text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className={`border-l-4 pl-4 pr-4 py-3 rounded-r-lg ${getTierColor(tier)}`}>
      <h3
        className={`text-base font-semibold mb-3 uppercase tracking-wide ${getTierTextColor(tier)}`}
      >
        {tier} ({repos.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {repos.map((repo) => (
          <div
            key={repo.name}
            className="bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm p-3 hover:shadow-md transition-shadow"
          >
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRepos.includes(repo.name)}
                onChange={() => onToggleRepo(repo.name)}
                className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500 rounded cursor-pointer"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {repo.name}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
