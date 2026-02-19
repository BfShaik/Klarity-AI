export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="h-5 w-36 mt-2 bg-white/10 rounded" />
        </div>
        <div className="h-10 w-32 bg-white/10 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-white/10 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-48 bg-white/10 rounded-xl" />
        <div className="h-48 bg-white/10 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white/10 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-white/10 rounded-xl" />
        <div className="h-64 bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}
