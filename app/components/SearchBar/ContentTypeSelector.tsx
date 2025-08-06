import type { SearchContentType } from "../../../common/types";

type ContentTypeSelectorProps = {
  type: SearchContentType;
  loading: boolean;
  onTypeChange: (type: SearchContentType) => void;
};

export default function ContentTypeSelector({
  type,
  loading,
  onTypeChange,
}: ContentTypeSelectorProps) {
  return (
    <div className="mb-6">
      <label htmlFor="content-type" className="block text-lg font-semibold text-gray-800 mb-3">
        Content Type
      </label>
      <div className="flex gap-6">
        <label className="flex items-center text-base">
          <input
            type="radio"
            value="both"
            checked={type === "both"}
            onChange={(e) => onTypeChange(e.target.value as SearchContentType)}
            className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
            disabled={loading}
          />
          Both
        </label>
        <label className="flex items-center text-base">
          <input
            type="radio"
            value="issues"
            checked={type === "issues"}
            onChange={(e) => onTypeChange(e.target.value as SearchContentType)}
            className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
            disabled={loading}
          />
          Issues
        </label>
        <label className="flex items-center text-base">
          <input
            type="radio"
            value="discussions"
            checked={type === "discussions"}
            onChange={(e) => onTypeChange(e.target.value as SearchContentType)}
            className="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500"
            disabled={loading}
          />
          Discussions
        </label>
      </div>
    </div>
  );
}
