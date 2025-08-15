type ResultsHeaderProps = {
  count: number;
};

export default function ResultsHeader({ count }: ResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Search Results
        <span className="ml-3 text-lg font-medium text-gray-500 dark:text-gray-400">({count})</span>
      </h2>
    </div>
  );
}
