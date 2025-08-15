type RepositoryCompactViewProps = {
  selectedRepos: string[];
};

export default function RepositoryCompactView({ selectedRepos }: RepositoryCompactViewProps) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex flex-wrap gap-2">
        {selectedRepos.length > 0 ? (
          selectedRepos.map((repoName) => (
            <span
              key={repoName}
              className="px-3 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-full text-sm text-gray-700 dark:text-gray-300"
            >
              {repoName}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400 italic">
            No repositories selected
          </span>
        )}
      </div>
    </div>
  );
}
