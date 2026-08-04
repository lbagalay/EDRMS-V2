export function PageLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="space-y-3">
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export function TableLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-8 w-40 rounded-lg bg-slate-200" />
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="h-10 bg-slate-100" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-t border-slate-100 bg-white" />
        ))}
      </div>
    </div>
  );
}

export function FormLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-6">
      <div className="h-8 w-56 rounded-lg bg-slate-200" />
      <div className="space-y-4 rounded-2xl border border-slate-100 p-6">
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-10 w-32 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}
