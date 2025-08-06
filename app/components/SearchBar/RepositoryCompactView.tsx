type RepositoryCompactViewProps = {
  selectedRepos: string[];
};

export default function RepositoryCompactView({ selectedRepos }: RepositoryCompactViewProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex flex-wrap gap-2">
        {selectedRepos.length > 0 ? (
          selectedRepos.map((repoName) => (
            <span
              key={repoName}
              className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700"
            >
              {repoName}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-500 italic">No repositories selected</span>
        )}
      </div>
    </div>
  );
}
