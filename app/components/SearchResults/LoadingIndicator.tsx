export default function LoadingIndicator() {
  return (
    <div className="mt-12 flex flex-col items-center">
      <div className="flex space-x-1 mb-4">
        <div className="w-3 h-3 bg-[#ff7300] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-[#ff9C00] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-[#ffb800] rounded-full animate-bounce"></div>
      </div>
      <p className="text-gray-600 text-sm">Searching repositories...</p>
    </div>
  );
}