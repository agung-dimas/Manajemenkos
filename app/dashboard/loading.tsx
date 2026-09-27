import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Header Loading Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-72 bg-muted/60 animate-pulse rounded-md" />
        </div>
        <div className="h-10 w-36 bg-muted animate-pulse rounded-md" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl border bg-card/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-8 rounded-full bg-muted/80 animate-pulse" />
            </div>
            <div className="h-7 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-40 bg-muted/50 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Skeleton */}
      <div className="rounded-xl border bg-card/80 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Memuat data terbaru...</span>
          </div>
          <div className="h-8 w-28 bg-muted animate-pulse rounded-md" />
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between py-3 border-b border-muted/30 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted/70 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted/50 animate-pulse rounded" />
                </div>
              </div>
              <div className="h-4 w-20 bg-muted/60 animate-pulse rounded hidden sm:block" />
              <div className="h-6 w-16 bg-muted/80 animate-pulse rounded-full" />
              <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
