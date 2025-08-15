import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import type { SearchResult } from "../../lib/types";
import StatusBadge from "./StatusBadge";

dayjs.extend(relativeTime);

type ResultCardProps = {
  result: SearchResult;
};

export default function ResultCard({ result }: ResultCardProps) {
  const handleClick = () => {
    window.open(result.url, "_blank", "noopener,noreferrer");
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("D MMM YYYY");
  };

  const formatRelativeTime = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };

  return (
    <article
      className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 p-6 transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 w-full min-w-0"
      onClick={handleClick}
    >
      <header className="mb-4 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {result.title}
          </h3>
          <div className="flex items-center gap-2">
            <StatusBadge type="type" value={result.type} />
            {result.state && <StatusBadge type="state" value={result.state} />}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Image
              src="https://svgrepo.com/show/303615/github-icon-1-logo.svg"
              alt="GitHub"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <span className="font-medium">{result.repository}</span>
          </div>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span>@{result.author}</span>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span
            title={`Created: ${formatDate(result.createdAt)}, Updated: ${formatDate(result.updatedAt)}`}
          >
            {formatRelativeTime(result.updatedAt)}
          </span>
        </div>
      </header>

      {result.body && (
        <div className="mb-4 min-w-0">
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3 overflow-hidden break-words w-full min-w-0">
            {result.body}
          </div>
        </div>
      )}

      {result.labels && result.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {result.labels.map((label) => (
            <span
              key={label}
              className="px-2 py-1 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-md text-xs border border-gray-200 dark:border-slate-600"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <footer className="flex items-center justify-end">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-hover:underline transition-all duration-200">
          <span>Open in GitHub</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </footer>
    </article>
  );
}
