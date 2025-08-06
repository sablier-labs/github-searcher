import { useId } from "react";

type SearchInputProps = {
  query: string;
  loading: boolean;
  onQueryChange: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function SearchInput({ query, loading, onQueryChange }: SearchInputProps) {
  const queryId = useId();
  return (
    <div className="mb-6">
      <label htmlFor={queryId} className="block text-lg font-semibold text-gray-800 mb-3">
        Search Query
      </label>
      <div className="flex gap-3">
        <input
          id={queryId}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg transition-all duration-300 ease-in-out"
          placeholder="Enter keywords: e.g., s'liquidity market', 'feature request'...'"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-[#ff7300] text-white text-lg font-semibold rounded-lg hover:bg-[#ff9C00] disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-md relative overflow-hidden"
        >
          {loading ? (
            <>
              <span className="relative z-10">Searching...</span>
              <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-[loading_1.5s_ease-in-out_infinite] w-full origin-left scale-x-0"></div>
            </>
          ) : (
            "Search"
          )}
        </button>
      </div>
    </div>
  );
}
