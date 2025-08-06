type StatusBadgeProps = {
  type: "type" | "state";
  value: string;
};

export default function StatusBadge({ type, value }: StatusBadgeProps) {
  const getClassName = () => {
    if (type === "type") {
      return value === "issue"
        ? "bg-blue-50 text-blue-700 border border-blue-200"
        : "bg-purple-50 text-purple-700 border border-purple-200";
    }
    
    if (type === "state") {
      return value === "open"
        ? "bg-green-50 text-green-700 border border-green-200"
        : "bg-gray-50 text-gray-700 border border-gray-200";
    }
    
    return "bg-gray-50 text-gray-700 border border-gray-200";
  };

  return (
    <span className={`px-3 py-1 rounded-full font-medium text-xs ${getClassName()}`}>
      {value}
    </span>
  );
}