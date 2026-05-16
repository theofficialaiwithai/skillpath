export default function DashboardLoading() {
  return (
    <div className="min-h-[calc(100vh-65px)] bg-bg-warm">
      <div className="max-w-5xl mx-auto px-6 py-12 animate-pulse">

        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="h-10 w-48 bg-gray-200 rounded-xl mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-xl" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="h-9 w-12 bg-gray-200 rounded-lg mb-2" />
              <div className="h-3 w-28 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Section heading */}
        <div className="h-6 w-36 bg-gray-200 rounded-lg mb-4" />

        {/* Path card skeletons */}
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border-l-4 border-gray-200 px-6 py-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-4" />
            <div className="h-2 w-full bg-gray-200 rounded-full mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-gray-200 rounded" />
              <div className="h-8 w-24 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
