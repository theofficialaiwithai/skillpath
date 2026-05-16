export default function PathLoading() {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-bg-warm animate-pulse">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="h-4 w-20 bg-gray-200 rounded mb-6" />
          <div className="flex items-center gap-3 mb-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
          </div>
          <div className="h-10 w-2/3 bg-gray-200 rounded-xl mb-4" />
          <div className="h-4 w-full max-w-lg bg-gray-200 rounded mb-2" />
          <div className="h-4 w-3/4 max-w-md bg-gray-200 rounded mb-6" />
          <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
          <div className="flex gap-3">
            <div className="h-12 w-36 bg-gray-200 rounded-xl" />
            <div className="h-12 w-28 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="h-2 w-full bg-gray-200 rounded-full" />
      </div>

      {/* Resource card skeletons */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-gray-200 rounded-lg mb-3" />
                <div className="h-3 w-full bg-gray-200 rounded mb-2" />
                <div className="h-3 w-2/3 bg-gray-200 rounded mb-3" />
                <div className="flex gap-3">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-12 bg-gray-200 rounded-full" />
                </div>
              </div>
              <div className="h-9 w-32 bg-gray-200 rounded-xl flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
