import type { REPOSITORIES } from "../../../common/repositories";

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
      case "ACTIVE":
        return "border-l-green-500 bg-green-50";
      case "OCCASIONAL":
        return "border-l-blue-500 bg-blue-50";
      case "LEGACY":
        return "border-l-yellow-500 bg-yellow-50";
      case "ARCHIVED":
        return "border-l-gray-500 bg-gray-50";
      default:
        return "border-l-gray-300 bg-gray-50";
    }
  };

  const getTierTextColor = (tier: string) => {
    switch (tier) {
      case "ACTIVE":
        return "text-green-700";
      case "OCCASIONAL":
        return "text-blue-700";
      case "LEGACY":
        return "text-yellow-700";
      case "ARCHIVED":
        return "text-gray-700";
      default:
        return "text-gray-700";
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
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 hover:shadow-md transition-shadow"
          >
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRepos.includes(repo.name)}
                onChange={() => onToggleRepo(repo.name)}
                className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500 rounded cursor-pointer"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700">{repo.name}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
